-- Test: Storage-Zugriffsregeln für Immobilienfotos (Bucket property-photos).
-- Nutzer A sieht/ändert nie das Foto von Nutzer B und umgekehrt, analog zu
-- 30_row_level_security.sql für die normalen Tabellen.
begin;
-- Im "extensions"-Schema fehlt der Verbindung auf dem echten Projekt das
-- Leserecht; "public" funktioniert dort wie lokal gleichermaßen.
create extension if not exists pgtap with schema public;

select plan(5);

insert into auth.users (id, email) values
  ('50000000-0000-0000-0000-00000000000a', 'nutzer.a.foto@example.com'),
  ('50000000-0000-0000-0000-00000000000b', 'nutzer.b.foto@example.com');

select account_id as konto_a
from public.account_member
where user_id = '50000000-0000-0000-0000-00000000000a'
\gset

insert into public.property (account_id, art, bezeichnung, kaufpreis)
values (:'konto_a', 'einfamilienhaus', 'Haus mit Foto von A', 250000)
returning id as haus_a_id
\gset

select (:'konto_a' || '/' || :'haus_a_id') as foto_pfad_a \gset

-- Als Nutzer A angemeldet: kann das eigene Foto einfügen und sieht es.
set local role authenticated;
set local request.jwt.claim.sub = '50000000-0000-0000-0000-00000000000a';

select lives_ok(
  format('insert into storage.objects (bucket_id, name) values (%L, %L)', 'property-photos', :'foto_pfad_a'),
  'Nutzer A kann sein eigenes Foto hochladen'
);

select is(
  (select count(*)::int from storage.objects where bucket_id = 'property-photos' and name = :'foto_pfad_a'),
  1,
  'Nutzer A sieht sein eigenes Foto'
);

reset role;
reset request.jwt.claim.sub;

-- Als Nutzer B angemeldet: sieht das Foto von A nicht und darf nichts im
-- Ordner von Konto A einfügen/ändern/löschen.
set local role authenticated;
set local request.jwt.claim.sub = '50000000-0000-0000-0000-00000000000b';

select is(
  (select count(*)::int from storage.objects where bucket_id = 'property-photos' and name = :'foto_pfad_a'),
  0,
  'Nutzer B sieht das Foto von Nutzer A nicht'
);

select throws_ok(
  format('insert into storage.objects (bucket_id, name) values (%L, %L)',
    'property-photos', :'foto_pfad_a' || '-eingeschleust'),
  'new row violates row-level security policy for table "objects"',
  'Nutzer B kann kein Foto im Ordner von Konto A anlegen'
);

-- RLS filtert die Zeile über die USING-Klausel schon vor dem Ändern heraus:
-- Der Befehl selbst schlägt nicht fehl, betrifft aber null Zeilen. Löschen
-- wird hier bewusst nicht getestet: storage.objects hat einen eigenen
-- Schutz-Trigger, der JEDES direkte SQL-DELETE ablehnt (auch für den
-- Eigentümer) und stattdessen die Storage-API verlangt - das würde also kein
-- RLS-spezifisches Verhalten prüfen, nur den Trigger.
update storage.objects set user_metadata = '{"manipuliert": true}'::jsonb where name = :'foto_pfad_a';

reset role;
reset request.jwt.claim.sub;

select is(
  (select user_metadata from storage.objects where name = :'foto_pfad_a'),
  null,
  'Nutzer B kann das Foto von Nutzer A nicht ändern'
);

select * from finish();
rollback;
