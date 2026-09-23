-- Kaufprüfung: Interessenten (Immobilien, die noch nicht gekauft sind).
--
-- Bewusst eine eigene Tabelle statt eines Statusfelds an property: Der Bestand,
-- seine Kennzahlen und alle bestehenden Abfragen bleiben unberührt, und eine
-- grobe Einschätzung braucht keine Einheiten, laufenden Kosten oder Fotos.
-- Beim Kauf entsteht über prospect_to_property() eine neue Immobilie; der
-- Interessent bleibt als "gekauft" mit Verweis erhalten.
--
-- Geldbeträge als numeric, nie als Fließkommazahl (siehe CLAUDE.md).
create table public.prospect (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.account (id) on delete cascade,
  created_at timestamptz not null default now(),

  -- Anders als bei property lässt sich die Objektart hier später ändern: Es ist
  -- nur eine erste, grobe Einschätzung.
  art text not null check (art in ('eigentumswohnung', 'einfamilienhaus', 'mehrfamilienhaus')),
  bezeichnung text not null check (btrim(bezeichnung) <> ''),

  strasse_hausnummer text,
  plz text,
  ort text,
  bundesland text check (
    bundesland is null or bundesland in (
      'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg',
      'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen',
      'Rheinland-Pfalz', 'Saarland', 'Sachsen', 'Sachsen-Anhalt',
      'Schleswig-Holstein', 'Thüringen'
    )
  ),

  kaufpreis numeric(12, 2) not null check (kaufpreis > 0),
  -- Ein Gesamtwert, keine Einheitenliste (auch nicht beim Mehrfamilienhaus).
  flaeche_qm numeric(8, 2) check (flaeche_qm is null or flaeche_qm >= 0),
  -- Erwartete Kaltmiete pro Monat, ebenfalls ein Gesamtwert.
  kaltmiete_monat numeric(12, 2) check (kaltmiete_monat is null or kaltmiete_monat >= 0),

  -- Geplante Finanzierung, optional.
  darlehen_betrag numeric(12, 2) check (darlehen_betrag is null or darlehen_betrag >= 0),
  sollzins_prozent numeric(5, 2) check (sollzins_prozent is null or sollzins_prozent >= 0),
  tilgung_prozent numeric(5, 2) check (tilgung_prozent is null or tilgung_prozent >= 0),

  -- Nur http/https: verhindert Links wie "javascript:...", die beim Anklicken
  -- Code im Browser ausführen würden.
  inserat_url text check (inserat_url is null or inserat_url ~* '^https?://[^[:space:]]+$'),

  status text not null default 'beobachtet'
    check (status in ('beobachtet', 'besichtigt', 'angebot_abgegeben', 'gekauft', 'abgelehnt')),

  notiz text,

  -- Verweis auf die Immobilie, die beim Kauf aus diesem Interessenten entstand.
  -- Der zusammengesetzte Fremdschlüssel erzwingt, dass sie zum selben Konto
  -- gehört. Wird die Immobilie gelöscht, bleibt der Interessent erhalten und
  -- nur der Verweis wird geleert.
  property_id uuid,
  constraint prospect_property_account_fk
    foreign key (property_id, account_id)
    references public.property (id, account_id)
    on delete set null (property_id)
);

comment on table public.prospect is 'Interessent der Kaufprüfung (noch nicht gekauft). Getrennt vom Bestand (property).';
comment on column public.prospect.kaltmiete_monat is 'Erwartete Kaltmiete pro Monat, Gesamtwert.';
comment on column public.prospect.property_id is 'Immobilie, die beim Kauf aus diesem Interessenten entstand (Verweis, keine Kopie der Daten).';

create index prospect_account_id_idx on public.prospect (account_id);

alter table public.prospect enable row level security;

create policy prospect_all on public.prospect
  for all to authenticated
  using (public.is_account_member(account_id))
  with check (public.is_account_member(account_id));

-- Übernahme in den Bestand in EINEM Schritt (eine Transaktion): Immobilie
-- anlegen, Einheit füllen, Interessent auf "gekauft" setzen und verknüpfen.
-- Eine einzelne Server Action wäre nicht atomar: Bei einem Fehler zwischen
-- den Schritten könnte eine Immobilie ohne Verweis entstehen.
-- security invoker (Standard): Es gelten die Zugriffsregeln (RLS) des
-- aufrufenden Nutzers, fremde Interessenten sind also nicht erreichbar.
create or replace function public.prospect_to_property(p_prospect_id uuid)
returns uuid
language plpgsql
as $$
declare
  p public.prospect%rowtype;
  neue_property_id uuid;
begin
  select * into p from public.prospect where id = p_prospect_id for update;

  if not found then
    raise exception 'Interessent nicht gefunden.';
  end if;
  if p.property_id is not null then
    raise exception 'Dieser Interessent wurde bereits in den Bestand übernommen.';
  end if;
  if p.status not in ('besichtigt', 'angebot_abgegeben') then
    raise exception 'Die Übernahme ist erst ab dem Status "besichtigt" möglich.';
  end if;

  insert into public.property (
    account_id, art, bezeichnung, strasse_hausnummer, plz, ort, bundesland,
    kaufpreis, darlehen_betrag, sollzins_prozent, tilgung_prozent
  )
  values (
    p.account_id, p.art, p.bezeichnung, p.strasse_hausnummer, p.plz, p.ort, p.bundesland,
    p.kaufpreis, p.darlehen_betrag, p.sollzins_prozent, p.tilgung_prozent
  )
  returning id into neue_property_id;

  -- Fläche und erwartete Kaltmiete landen in der einen Einheit (Status "leer":
  -- kaltmiete_monat ist die Soll-Miete, "vermietet" setzt der Nutzer selbst).
  -- Wohnung/Einfamilienhaus: die Einheit hat der Trigger schon angelegt.
  -- Mehrfamilienhaus: eine Einheit "Einheit 1" mit den Gesamtwerten, die im
  -- Bestand aufgeteilt werden kann.
  if p.art = 'mehrfamilienhaus' then
    insert into public.unit (account_id, property_id, name, flaeche_qm, kaltmiete_monat, status)
    values (p.account_id, neue_property_id, 'Einheit 1', p.flaeche_qm, coalesce(p.kaltmiete_monat, 0), 'leer');
  else
    update public.unit
    set flaeche_qm = p.flaeche_qm, kaltmiete_monat = coalesce(p.kaltmiete_monat, 0)
    where property_id = neue_property_id;
  end if;

  update public.prospect
  set status = 'gekauft', property_id = neue_property_id
  where id = p.id;

  return neue_property_id;
end;
$$;

comment on function public.prospect_to_property is
  'Übernimmt einen Interessenten (Status besichtigt/Angebot) als neue Immobilie in den Bestand und markiert ihn als gekauft.';
