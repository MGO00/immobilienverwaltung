-- Zugriffsregeln (Row Level Security).
--
-- Grundprinzip: Ein Nutzer sieht und ändert nur Daten seines eigenen Kontos.
-- Die Hilfsfunktion is_account_member() läuft mit erhöhten Rechten
-- (security definer), damit sie account_member selbst lesen kann, obwohl
-- account_member auch Zugriffsregeln hat -- sonst würde sich die Prüfung im
-- Kreis drehen.
create or replace function public.is_account_member(pruef_account_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.account_member m
    where m.account_id = pruef_account_id
      and m.user_id = auth.uid()
  );
$$;

comment on function public.is_account_member is 'Prüft, ob der aktuell angemeldete Nutzer Mitglied des angegebenen Kontos ist.';

alter table public.account enable row level security;
alter table public.account_member enable row level security;
alter table public.profile enable row level security;
alter table public.property enable row level security;
alter table public.unit enable row level security;
alter table public.running_cost_item enable row level security;
alter table public.note enable row level security;

-- account: nur lesen, nie über die API anlegen/ändern/löschen (das
-- übernehmen die Trigger beim Registrieren bzw. beim letzten Mitglied).
create policy account_select on public.account
  for select to authenticated
  using (public.is_account_member(id));

-- account_member: Mitglieder eines Kontos sehen die Mitgliederliste ihres
-- Kontos. Anlegen/Ändern/Löschen läuft nur über Trigger (kein Umfang für
-- eine Einladungsfunktion in der Basisvariante).
create policy account_member_select on public.account_member
  for select to authenticated
  using (public.is_account_member(account_id));

-- profile: jeder Nutzer sieht und bearbeitet nur sein eigenes Profil.
create policy profile_select on public.profile
  for select to authenticated
  using (user_id = auth.uid());

create policy profile_update on public.profile
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- property, unit, running_cost_item, note: volles Lesen/Schreiben für
-- Mitglieder des jeweiligen Kontos, sonst kein Zugriff.
create policy property_all on public.property
  for all to authenticated
  using (public.is_account_member(account_id))
  with check (public.is_account_member(account_id));

create policy unit_all on public.unit
  for all to authenticated
  using (public.is_account_member(account_id))
  with check (public.is_account_member(account_id));

create policy running_cost_item_all on public.running_cost_item
  for all to authenticated
  using (public.is_account_member(account_id))
  with check (public.is_account_member(account_id));

create policy note_all on public.note
  for all to authenticated
  using (public.is_account_member(account_id))
  with check (public.is_account_member(account_id));
