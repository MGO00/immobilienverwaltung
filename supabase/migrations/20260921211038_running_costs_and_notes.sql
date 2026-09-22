-- Laufende Kosten (Postenliste) und Notizen.
--
-- Der Cashflow-Rechner übernimmt bei Zuordnung die Summe aller Posten einer
-- Immobilie. Die drei Eingabefelder des Rechners (nicht umlagefähig,
-- Rücklage, Verwaltung) sind reine Rechner-Eingaben ohne eigene
-- Datenstruktur -- hier zählt nur die Gesamtsumme.
create table public.running_cost_item (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  property_id uuid not null,

  typ text not null check (typ in (
    'hausgeld',
    'instandhaltungsruecklage',
    'grundsteuer',
    'versicherung',
    'instandhaltung',
    'verwaltung_sonstiges'
  )),
  betrag_monat numeric(12, 2) not null check (betrag_monat >= 0),

  constraint running_cost_item_property_account_fk
    foreign key (property_id, account_id)
    references public.property (id, account_id)
    on delete cascade
);

comment on table public.running_cost_item is 'Ein Posten laufender Kosten pro Monat, je Immobilie.';

create index running_cost_item_property_id_idx on public.running_cost_item (property_id);
create index running_cost_item_account_id_idx on public.running_cost_item (account_id);

create table public.note (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  property_id uuid not null,

  text text not null check (btrim(text) <> ''),
  created_at timestamptz not null default now(),

  constraint note_property_account_fk
    foreign key (property_id, account_id)
    references public.property (id, account_id)
    on delete cascade
);

comment on table public.note is 'Notiz zu einer Immobilie.';

create index note_property_id_idx on public.note (property_id);
create index note_account_id_idx on public.note (account_id);
