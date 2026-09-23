-- Test: Besucher ohne Anmeldung (Rolle anon) sehen keine Fachdaten. Wichtig, seit
-- die Rechnerseiten öffentlich sind und dort ?immobilie=<id> ausgewertet wird.
begin;
-- Im "extensions"-Schema fehlt der Verbindung auf dem echten Projekt das
-- Leserecht; "public" funktioniert dort wie lokal gleichermaßen.
create extension if not exists pgtap with schema public;

select plan(6);

insert into auth.users (id, email) values
  ('60000000-0000-0000-0000-00000000000a', 'nutzer.a.anon@example.com');

select account_id as konto_a
from public.account_member
where user_id = '60000000-0000-0000-0000-00000000000a'
\gset

insert into public.property (account_id, art, bezeichnung, kaufpreis)
values (:'konto_a', 'einfamilienhaus', 'Haus von A', 300000)
returning id as haus_a_id
\gset

insert into public.running_cost_item (account_id, property_id, typ, betrag_monat)
values (:'konto_a', :'haus_a_id', 'grundsteuer', 50);

insert into public.note (account_id, property_id, text)
values (:'konto_a', :'haus_a_id', 'Notiz von A');

-- Ohne Anmeldung: keine Zeile sichtbar, egal ob per Tabellenrecht abgewiesen
-- oder von RLS herausgefiltert (beides ist ein "kein Zugriff").
set local role anon;

select is((select count(*)::int from public.property), 0, 'anon sieht keine Immobilien');
select is((select count(*)::int from public.unit), 0, 'anon sieht keine Einheiten');
select is((select count(*)::int from public.running_cost_item), 0, 'anon sieht keine laufenden Kosten');
select is((select count(*)::int from public.note), 0, 'anon sieht keine Notizen');
select is(
  (select count(*)::int from public.property where id = :'haus_a_id'),
  0,
  'anon sieht die Immobilie auch bei bekannter ID nicht'
);

select throws_ok(
  format('insert into public.property (account_id, art, bezeichnung, kaufpreis) values (%L, %L, %L, 1)',
    :'konto_a', 'einfamilienhaus', 'Eingeschleust'),
  null,
  'anon kann keine Immobilie anlegen'
);

reset role;

select * from finish();
rollback;
