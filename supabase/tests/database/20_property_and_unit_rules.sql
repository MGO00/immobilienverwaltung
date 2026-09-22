-- Test: automatische Einheit, unveränderliche Objektart, Löschschutz der
-- letzten Einheit (außer die Immobilie selbst wird gelöscht).
begin;
-- Im "extensions"-Schema fehlt der Verbindung auf dem echten Projekt das
-- Leserecht; "public" funktioniert dort wie lokal gleichermaßen.
create extension if not exists pgtap with schema public;

select plan(7);

insert into auth.users (id, email)
values ('20000000-0000-0000-0000-000000000001', 'eigentuemer.test@example.com');

select account_id as konto_id
from public.account_member
where user_id = '20000000-0000-0000-0000-000000000001'
\gset

-- Eigentumswohnung: automatisch genau eine Einheit.
insert into public.property (account_id, art, bezeichnung, kaufpreis)
values (:'konto_id', 'eigentumswohnung', 'Testwohnung', 200000)
returning id as etw_id
\gset

select is(
  (select count(*)::int from public.unit where property_id = :'etw_id'),
  1,
  'Eigentumswohnung bekommt automatisch genau eine Einheit'
);

select is(
  (select name from public.unit where property_id = :'etw_id'),
  'Wohnung',
  'Die automatische Einheit heißt "Wohnung"'
);

-- Mehrfamilienhaus: keine automatische Einheit.
insert into public.property (account_id, art, bezeichnung, kaufpreis)
values (:'konto_id', 'mehrfamilienhaus', 'Testhaus MFH', 500000)
returning id as mfh_id
\gset

select is(
  (select count(*)::int from public.unit where property_id = :'mfh_id'),
  0,
  'Mehrfamilienhaus bekommt keine automatische Einheit'
);

-- Objektart ist nach dem Anlegen unveränderlich.
select throws_ok(
  format('update public.property set art = %L where id = %L', 'einfamilienhaus', :'etw_id'),
  'Die Objektart kann nach dem Anlegen nicht mehr geändert werden.',
  'Die Objektart lässt sich nicht nachträglich ändern'
);

-- Die letzte Einheit einer bestehenden Immobilie lässt sich nicht löschen.
select throws_ok(
  format('delete from public.unit where property_id = %L', :'etw_id'),
  'Die letzte Einheit einer Immobilie kann nicht gelöscht werden.',
  'Die letzte Einheit einer Immobilie lässt sich nicht einzeln löschen'
);

-- Löscht man die Immobilie selbst, verschwindet die letzte Einheit mit --
-- der Schutz darf das nicht blockieren.
select lives_ok(
  format('delete from public.property where id = %L', :'etw_id'),
  'Die Immobilie samt ihrer letzten Einheit lässt sich vollständig löschen'
);

select is(
  (select count(*)::int from public.unit where property_id = :'etw_id'),
  0,
  'Nach dem Löschen der Immobilie ist auch die Einheit weg'
);

select * from finish();
rollback;
