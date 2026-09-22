-- Einheit.
--
-- kaltmiete_monat trägt immer die (Soll-)Kaltmiete, auch bei einer leeren
-- Einheit -- das ist eine bewusste Vereinfachung gegenüber dem Prototyp, der
-- dafür zwei getrennte Felder (miete/soll) nutzt. Welche Einheiten in
-- Jahreskaltmiete, Rendite und Cashflow einfließen, entscheidet der
-- Rechner anhand von status = 'vermietet' -- nicht diese Tabelle.
create table public.unit (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  property_id uuid not null,

  name text not null check (btrim(name) <> ''),
  flaeche_qm numeric(8, 2) check (flaeche_qm is null or flaeche_qm >= 0),
  kaltmiete_monat numeric(12, 2) not null default 0 check (kaltmiete_monat >= 0),
  status text not null default 'leer' check (status in ('vermietet', 'selbstgenutzt', 'leer')),

  constraint unit_property_account_fk
    foreign key (property_id, account_id)
    references public.property (id, account_id)
    on delete cascade
);

comment on table public.unit is 'Einheit einer Immobilie. Wohnung/Einfamilienhaus haben genau eine, Mehrfamilienhaus mehrere.';
comment on column public.unit.kaltmiete_monat is 'Immer die (Soll-)Kaltmiete, auch bei status = leer.';

create index unit_property_id_idx on public.unit (property_id);
create index unit_account_id_idx on public.unit (account_id);

-- Bei Wohnung/Einfamilienhaus entsteht automatisch genau eine Einheit. Die
-- Anwendung befüllt Name, Fläche, Kaltmiete und Status direkt im Anschluss
-- (gleicher Speichervorgang im Assistenten). Beim Mehrfamilienhaus legt die
-- Anwendung die Einheiten selbst an; die Prüfung "mindestens eine Einheit"
-- übernimmt dort der Assistent vor dem Speichern.
create or replace function public.create_default_unit_for_single_property()
returns trigger
language plpgsql
as $$
begin
  if new.art in ('eigentumswohnung', 'einfamilienhaus') then
    insert into public.unit (account_id, property_id, name, status, kaltmiete_monat)
    values (
      new.account_id,
      new.id,
      case new.art when 'eigentumswohnung' then 'Wohnung' else 'Haus' end,
      'leer',
      0
    );
  end if;
  return new;
end;
$$;

create trigger property_create_default_unit
after insert on public.property
for each row
execute function public.create_default_unit_for_single_property();

-- Die letzte Einheit einer Immobilie lässt sich nicht löschen -- jede
-- Immobilie braucht laut Datenmodell mindestens eine. Ausnahme: Wird die
-- Immobilie selbst gerade gelöscht (Kaskade über den Fremdschlüssel), greift
-- die Sperre nicht, sonst könnte man eine Immobilie nie mehr löschen.
create or replace function public.prevent_last_unit_delete()
returns trigger
language plpgsql
as $$
declare
  verbleibend int;
begin
  if not exists (select 1 from public.property where id = old.property_id) then
    return old;
  end if;

  select count(*) into verbleibend
  from public.unit
  where property_id = old.property_id and id <> old.id;

  if verbleibend = 0 then
    raise exception 'Die letzte Einheit einer Immobilie kann nicht gelöscht werden.';
  end if;

  return old;
end;
$$;

create trigger unit_prevent_last_delete
before delete on public.unit
for each row
execute function public.prevent_last_unit_delete();
