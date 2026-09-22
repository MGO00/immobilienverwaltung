-- Konto, Mitgliedschaft und Profil.
--
-- Hierarchie laut CLAUDE.md: Nutzer -> Konto (account) -> Immobilie -> Einheit.
-- Ein Konto kann mehrere Mitglieder haben (account_member), auch wenn heute
-- beim Registrieren immer genau ein Mitglied entsteht. So lässt sich später
-- ohne Umbau ein zweiter Nutzer pro Konto ergänzen.

create extension if not exists pgcrypto;

create table public.account (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

comment on table public.account is 'Konto (Mandant). Alle Fachdaten hängen daran, nicht direkt am Nutzer.';

create table public.account_member (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.account (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rolle text not null default 'inhaber',
  created_at timestamptz not null default now(),
  unique (account_id, user_id)
);

comment on table public.account_member is 'Wer zu welchem Konto gehört. Heute immer genau ein Mitglied pro Konto.';

create index account_member_user_id_idx on public.account_member (user_id);

create table public.profile (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

comment on table public.profile is 'Anzeigename je Nutzer. E-Mail kommt direkt aus auth.users, wird nicht dupliziert.';

-- Beim Registrieren automatisch Konto, Mitgliedschaft (Rolle "inhaber") und
-- Profil anlegen. Läuft mit erhöhten Rechten (security definer), weil
-- normale Nutzer die Tabelle account_member sonst nicht selbst befüllen
-- dürfen (siehe Zugriffsregeln in der letzten Migration).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  neues_konto_id uuid;
begin
  insert into public.account default values
  returning id into neues_konto_id;

  insert into public.account_member (account_id, user_id, rolle)
  values (neues_konto_id, new.id, 'inhaber');

  insert into public.profile (user_id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Ein Konto ohne Mitglieder wird automatisch mitgelöscht (kaskadiert über
-- die Fremdschlüssel weiter zu Immobilien, Einheiten usw.). Löscht man einen
-- Nutzer, der das einzige Mitglied war, verschwindet so auch sein Konto samt
-- aller Daten. Gibt es noch weitere Mitglieder, bleibt das Konto erhalten.
create or replace function public.delete_account_if_empty()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  verbleibend int;
begin
  select count(*) into verbleibend
  from public.account_member
  where account_id = old.account_id;

  if verbleibend = 0 then
    delete from public.account where id = old.account_id;
  end if;

  return old;
end;
$$;

create trigger on_account_member_deleted
after delete on public.account_member
for each row
execute function public.delete_account_if_empty();
