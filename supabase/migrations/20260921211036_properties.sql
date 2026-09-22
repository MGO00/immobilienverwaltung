-- Immobilie.
--
-- Geldbeträge und Prozentwerte als numeric (exakte Dezimalzahl), nie als
-- Fließkommazahl (float/double) -- siehe CLAUDE.md "Sicherheit und
-- Datenschutz". Alles, was sich ausrechnen lässt (Gesamtinvestition,
-- Eigenkapital, Rendite, Rate, Tilgungsplan ...) wird bewusst NICHT hier
-- gespeichert, sondern in src/lib/calculators/ live berechnet.
create table public.property (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.account (id) on delete cascade,

  -- Feste Werte statt enum-Typ, damit sich die Liste bei Bedarf per
  -- Migration ändern lässt, ohne den Spaltentyp anzufassen.
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

  baujahr smallint check (baujahr is null or baujahr > 1000),
  grundstuecksflaeche_qm numeric(8, 2) check (grundstuecksflaeche_qm is null or grundstuecksflaeche_qm >= 0),

  kaufdatum date,
  kaufpreis numeric(12, 2) not null check (kaufpreis > 0),

  -- Historische Tatsache, wird beim Anlegen einmalig eingetragen (Eingabe
  -- oder Übernahme aus dem Kaufnebenkosten-Rechner) und ändert sich später
  -- nicht mehr automatisch mit -- auch wenn sich Steuersätze ändern.
  kaufnebenkosten_betrag numeric(12, 2) check (kaufnebenkosten_betrag is null or kaufnebenkosten_betrag >= 0),

  darlehen_betrag numeric(12, 2) check (darlehen_betrag is null or darlehen_betrag >= 0),
  sollzins_prozent numeric(5, 2) check (sollzins_prozent is null or sollzins_prozent >= 0),
  tilgung_prozent numeric(5, 2) check (tilgung_prozent is null or tilgung_prozent >= 0),
  zinsbindung_bis date
);

comment on table public.property is 'Immobilie. Fläche steht nicht hier, sondern an der/den Einheit(en).';
comment on column public.property.kaufnebenkosten_betrag is 'Gespeicherte historische Tatsache, nicht neu berechnet.';
comment on column public.property.darlehen_betrag is 'Eingabe. Eigenkapital ergibt sich rechnerisch aus Gesamtinvestition minus Darlehen.';

create index property_account_id_idx on public.property (account_id);

-- Für den zusammengesetzten Fremdschlüssel von unit/running_cost_item/note:
-- garantiert, dass deren account_id nie von der der zugehörigen Immobilie
-- abweichen kann (Datenbank-Garantie, nicht nur Zugriffsregel).
alter table public.property add constraint property_id_account_id_uk unique (id, account_id);

-- Die Objektart lässt sich nach dem Anlegen nicht mehr ändern (der
-- Bearbeiten-Screen im Design bietet sie auch nicht an). Das wird hier in
-- der Datenbank erzwungen, nicht nur in der Oberfläche.
create or replace function public.prevent_property_art_change()
returns trigger
language plpgsql
as $$
begin
  if new.art is distinct from old.art then
    raise exception 'Die Objektart kann nach dem Anlegen nicht mehr geändert werden.';
  end if;
  return new;
end;
$$;

create trigger property_art_immutable
before update on public.property
for each row
execute function public.prevent_property_art_change();
