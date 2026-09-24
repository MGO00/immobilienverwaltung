-- Tarife und Grenzen (zentrale Einstellung).
--
-- Jedes Konto hat einen Tarif. Die Grenzen je Tarif stehen hier in
-- tarif_grenze() UND in src/lib/constants/tarife.ts (für Anzeige und Buttons).
-- Beide Stellen immer gemeinsam ändern: Ein automatischer Test
-- (src/lib/tarife.test.ts) liest den markierten TARIFE-Block der neuesten
-- Migration und vergleicht ihn mit tarife.ts.
--
-- Durchgesetzt wird hier in der Datenbank (Trigger), nicht nur in der
-- Oberfläche: So ist die Grenze auf keinem Weg umgehbar (zwei Tabs, direkter
-- API-Aufruf, Übernahme aus der Kaufprüfung).

alter table public.account
  add column tarif text not null default 'kostenlos'
  check (tarif in ('kostenlos', 'plus', 'pro'));

comment on column public.account.tarif is
  'Tarif des Kontos. Aktuell wird nur "kostenlos" vergeben; kein Tarifwechsel durch Nutzer (keine Update-Policy auf account).';

-- Grenze je Tarif und Art. null = unbegrenzt.
create or replace function public.tarif_grenze(p_tarif text, p_art text)
returns int
language sql
immutable
set search_path = public
as $$
  select t.grenze
  from (values
    -- TARIFE:BEGIN
    ('kostenlos', 'immobilien', 5),
    ('kostenlos', 'aktive_interessenten', 20),
    ('plus', 'immobilien', 10),
    ('plus', 'aktive_interessenten', 100),
    ('pro', 'immobilien', null),
    ('pro', 'aktive_interessenten', null)
    -- TARIFE:END
  ) as t(tarif, art, grenze)
  where t.tarif = p_tarif and t.art = p_art
$$;

comment on function public.tarif_grenze is
  'Grenze je Tarif ("immobilien" oder "aktive_interessenten"); null = unbegrenzt. Werte gespiegelt in src/lib/constants/tarife.ts.';

-- Sperre je Konto für die Dauer der Transaktion: Zwei gleichzeitige Anlagen
-- desselben Kontos (z. B. zwei Browser-Tabs) werden nacheinander geprüft, statt
-- beide die alte Anzahl zu sehen und gemeinsam über die Grenze zu rutschen.
create or replace function public.sperre_konto_fuer_grenzpruefung(p_account_id uuid)
returns void
language sql
as $$
  select pg_advisory_xact_lock(hashtextextended('tarifgrenze:' || p_account_id::text, 0))
$$;

-- Immobilien: vor jedem Anlegen zählen. Greift auch für prospect_to_property().
-- security definer, damit unabhängig von den Zugriffsregeln wirklich alle
-- Immobilien des Kontos gezählt werden.
create or replace function public.pruefe_immobilien_grenze()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_grenze int;
  v_anzahl int;
begin
  perform public.sperre_konto_fuer_grenzpruefung(new.account_id);

  select public.tarif_grenze(a.tarif, 'immobilien') into v_grenze
  from public.account a where a.id = new.account_id;
  if v_grenze is null then
    return new;
  end if;

  select count(*) into v_anzahl from public.property where account_id = new.account_id;
  if v_anzahl >= v_grenze then
    raise exception using
      errcode = 'TL001',
      message = format('Objektlimit des Tarifs erreicht (%s).', v_grenze);
  end if;
  return new;
end;
$$;

create trigger property_tarif_grenze
before insert on public.property
for each row
execute function public.pruefe_immobilien_grenze();

-- Aktive Interessenten (beobachtet, besichtigt, Angebot abgegeben): prüfen,
-- wenn ein Interessent neu aktiv wird — beim Anlegen oder beim Wiederaufnehmen
-- (abgelehnt -> aktiv). Wechsel zwischen aktiven Status, Ablehnen und Kaufen
-- bleiben immer erlaubt.
create or replace function public.pruefe_interessenten_grenze()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_aktiv constant text[] := array['beobachtet', 'besichtigt', 'angebot_abgegeben'];
  v_grenze int;
  v_anzahl int;
begin
  if not (new.status = any (v_aktiv)) then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status = any (v_aktiv) then
    return new;
  end if;

  perform public.sperre_konto_fuer_grenzpruefung(new.account_id);

  select public.tarif_grenze(a.tarif, 'aktive_interessenten') into v_grenze
  from public.account a where a.id = new.account_id;
  if v_grenze is null then
    return new;
  end if;

  select count(*) into v_anzahl
  from public.prospect
  where account_id = new.account_id and status = any (v_aktiv);
  if v_anzahl >= v_grenze then
    raise exception using
      errcode = 'TL002',
      message = format('Limit aktiver Interessenten des Tarifs erreicht (%s).', v_grenze);
  end if;
  return new;
end;
$$;

create trigger prospect_tarif_grenze
before insert or update of status on public.prospect
for each row
execute function public.pruefe_interessenten_grenze();
