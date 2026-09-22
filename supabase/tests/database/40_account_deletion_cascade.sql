-- Test: Löschen des letzten Mitglieds eines Kontos entfernt das Konto und
-- alle zugehörigen Daten. Bei mehreren Mitgliedern bleibt das Konto erhalten.
begin;
create extension if not exists pgtap;

select plan(7);

-- Einzelner Nutzer: Konto und alle Daten verschwinden vollständig.
insert into auth.users (id, email)
values ('40000000-0000-0000-0000-00000000000a', 'einzeln.test@example.com');

select account_id as konto_a
from public.account_member
where user_id = '40000000-0000-0000-0000-00000000000a'
\gset

insert into public.property (account_id, art, bezeichnung, kaufpreis)
values (:'konto_a', 'mehrfamilienhaus', 'Haus zum Löschen', 400000)
returning id as haus_id
\gset

insert into public.unit (account_id, property_id, name, kaltmiete_monat, status)
values (:'konto_a', :'haus_id', 'Whg 1', 600, 'vermietet');

insert into public.running_cost_item (account_id, property_id, typ, betrag_monat)
values (:'konto_a', :'haus_id', 'grundsteuer', 40);

insert into public.note (account_id, property_id, text)
values (:'konto_a', :'haus_id', 'Wird mitgelöscht');

delete from auth.users where id = '40000000-0000-0000-0000-00000000000a';

select is(
  (select count(*)::int from public.account where id = :'konto_a'),
  0,
  'Konto ist nach dem letzten Mitglied weg'
);

select is(
  (select count(*)::int from public.property where id = :'haus_id'),
  0,
  'Immobilie ist mit dem Konto weg'
);

select is(
  (select count(*)::int from public.unit where property_id = :'haus_id'),
  0,
  'Einheiten sind mit dem Konto weg'
);

select is(
  (select count(*)::int from public.running_cost_item where property_id = :'haus_id'),
  0,
  'Kostenposten sind mit dem Konto weg'
);

select is(
  (select count(*)::int from public.note where property_id = :'haus_id'),
  0,
  'Notizen sind mit dem Konto weg'
);

-- Mehrere Mitglieder: Konto bleibt erhalten, wenn nur eines geht.
insert into auth.users (id, email)
values ('40000000-0000-0000-0000-00000000000c', 'mehrfach.c@example.com');

select account_id as konto_c
from public.account_member
where user_id = '40000000-0000-0000-0000-00000000000c'
\gset

insert into auth.users (id, email)
values ('40000000-0000-0000-0000-00000000000d', 'mehrfach.d@example.com');

insert into public.account_member (account_id, user_id, rolle)
values (:'konto_c', '40000000-0000-0000-0000-00000000000d', 'inhaber');

delete from auth.users where id = '40000000-0000-0000-0000-00000000000d';

select is(
  (select count(*)::int from public.account where id = :'konto_c'),
  1,
  'Konto mit mehreren Mitgliedern bleibt erhalten'
);

select is(
  (select count(*)::int from public.account_member
     where account_id = :'konto_c' and user_id = '40000000-0000-0000-0000-00000000000c'),
  1,
  'Das verbliebene Mitglied ist weiterhin Mitglied'
);

select * from finish();
rollback;
