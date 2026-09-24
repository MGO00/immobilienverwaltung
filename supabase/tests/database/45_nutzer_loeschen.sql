-- Test: Kontolöschung auf Datenbankebene. Das Löschen des Nutzers in auth.users
-- (so wie auth.admin.deleteUser es tut) entfernt Profil, Mitgliedschaft, Konto
-- und ALLE Fachdaten inkl. Interessenten. Ein zweites Konto bleibt unberührt.
begin;
-- Im "extensions"-Schema fehlt der Verbindung auf dem echten Projekt das
-- Leserecht; "public" funktioniert dort wie lokal gleichermaßen.
create extension if not exists pgtap with schema public;

select plan(10);

insert into auth.users (id, email) values
  ('45000000-0000-0000-0000-00000000000a', 'loeschen.a@example.com'),
  ('45000000-0000-0000-0000-00000000000b', 'bleibt.b@example.com');

select account_id as konto_a from public.account_member where user_id = '45000000-0000-0000-0000-00000000000a' \gset
select account_id as konto_b from public.account_member where user_id = '45000000-0000-0000-0000-00000000000b' \gset

-- Daten für beide Konten
insert into public.property (account_id, art, bezeichnung, kaufpreis)
values (:'konto_a', 'eigentumswohnung', 'Wohnung A', 150000) returning id as haus_a \gset
insert into public.property (account_id, art, bezeichnung, kaufpreis)
values (:'konto_b', 'eigentumswohnung', 'Wohnung B', 160000) returning id as haus_b \gset
insert into public.running_cost_item (account_id, property_id, typ, betrag_monat) values
  (:'konto_a', :'haus_a', 'hausgeld', 200), (:'konto_b', :'haus_b', 'hausgeld', 210);
insert into public.note (account_id, property_id, text) values
  (:'konto_a', :'haus_a', 'Notiz A'), (:'konto_b', :'haus_b', 'Notiz B');
insert into public.prospect (account_id, art, bezeichnung, kaufpreis) values
  (:'konto_a', 'einfamilienhaus', 'Interessent A', 300000),
  (:'konto_b', 'einfamilienhaus', 'Interessent B', 310000);

-- Nutzer A löschen (wie auth.admin.deleteUser)
delete from auth.users where id = '45000000-0000-0000-0000-00000000000a';

select is((select count(*)::int from public.profile where user_id = '45000000-0000-0000-0000-00000000000a'), 0, 'Profil von A ist weg');
select is((select count(*)::int from public.account_member where user_id = '45000000-0000-0000-0000-00000000000a'), 0, 'Mitgliedschaft von A ist weg');
select is((select count(*)::int from public.account where id = :'konto_a'), 0, 'Konto von A ist weg');
select is(
  (select count(*) from public.property where account_id = :'konto_a')
  + (select count(*) from public.unit where account_id = :'konto_a')
  + (select count(*) from public.running_cost_item where account_id = :'konto_a')
  + (select count(*) from public.note where account_id = :'konto_a'),
  0::bigint,
  'Immobilien, Einheiten, Kosten und Notizen von A sind weg'
);
select is((select count(*)::int from public.prospect where account_id = :'konto_a'), 0, 'Interessenten von A sind weg');

-- Konto B unverändert
select is((select count(*)::int from public.account where id = :'konto_b'), 1, 'Konto B besteht');
select is((select count(*)::int from public.profile where user_id = '45000000-0000-0000-0000-00000000000b'), 1, 'Profil von B besteht');
select is((select count(*)::int from public.property where account_id = :'konto_b'), 1, 'Immobilie von B besteht');
select is(
  (select count(*) from public.unit where account_id = :'konto_b')
  + (select count(*) from public.running_cost_item where account_id = :'konto_b')
  + (select count(*) from public.note where account_id = :'konto_b'),
  3::bigint,
  'Einheit, Kosten und Notiz von B bestehen'
);
select is((select count(*)::int from public.prospect where account_id = :'konto_b'), 1, 'Interessent von B besteht');

select * from finish();
rollback;
