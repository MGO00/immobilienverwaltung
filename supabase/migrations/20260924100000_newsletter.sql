-- E-Mail-Liste der Startseite mit Double-Opt-in.
--
-- Bewusst OHNE account_id: Die Einträge gehören keinem Konto (Besucher ohne
-- Konto tragen sich ein), es sind keine Kontodaten. Deshalb gibt es auch keine
-- Zugriffsregeln (RLS-Policies) für Nutzer: Die Tabelle ist für anon und
-- authenticated komplett gesperrt und wird nur vom Server mit dem Secret-Key
-- gelesen und geschrieben (siehe src/lib/supabase/admin.ts).
--
-- Von den Bestätigungs- und Abmelde-Links wird nur ein SHA-256-Hash gespeichert,
-- nie der Link-Code selbst: Auch wer die Tabelle einsehen könnte, kann damit keine
-- Adresse bestätigen.
create table public.newsletter_subscriber (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(btrim(email)) and length(email) between 3 and 254),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'unsubscribed')),

  confirm_token_hash text,
  confirm_expires_at timestamptz,
  unsubscribe_token_hash text not null,

  created_at timestamptz not null default now(),
  confirmation_sent_at timestamptz,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,

  -- Welcher Hinweistext galt bei der Anmeldung (Nachweis der Einwilligung).
  consent_text_version text not null default 'v1'
);

comment on table public.newsletter_subscriber is
  'E-Mail-Liste der Startseite (Double-Opt-in). Kein Konto-Bezug, nur per Secret-Key vom Server erreichbar.';
comment on column public.newsletter_subscriber.confirm_token_hash is
  'SHA-256-Hash des Bestätigungs-Codes; wird nach dem Bestätigen geleert (einmal nutzbar).';

create unique index newsletter_subscriber_email_uk on public.newsletter_subscriber (email);
create index newsletter_subscriber_confirm_token_idx on public.newsletter_subscriber (confirm_token_hash);
create index newsletter_subscriber_unsubscribe_token_idx on public.newsletter_subscriber (unsubscribe_token_hash);

alter table public.newsletter_subscriber enable row level security;

-- Keine Policies UND keine Tabellenrechte für die Rollen der normalen App.
revoke all on table public.newsletter_subscriber from anon, authenticated;
