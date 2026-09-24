-- Test: E-Mail-Liste (newsletter_subscriber). Weder Besucher (anon) noch
-- angemeldete Nutzer kommen an die Tabelle, und die Wertebereiche stimmen.
begin;
-- Im "extensions"-Schema fehlt der Verbindung auf dem echten Projekt das
-- Leserecht; "public" funktioniert dort wie lokal gleichermaßen.
create extension if not exists pgtap with schema public;

select plan(9);

insert into public.newsletter_subscriber (email, unsubscribe_token_hash)
values ('liste@example.com', 'hash-abmelden');

select is(
  (select status from public.newsletter_subscriber where email = 'liste@example.com'),
  'pending',
  'Neuer Eintrag startet als pending'
);

select throws_ok(
  $$insert into public.newsletter_subscriber (email, unsubscribe_token_hash) values ('Gross@Example.com', 'h')$$,
  '23514', null, 'E-Mail muss kleingeschrieben gespeichert werden'
);
select throws_ok(
  $$insert into public.newsletter_subscriber (email, unsubscribe_token_hash) values ('liste@example.com', 'h2')$$,
  '23505', null, 'Dieselbe Adresse kann nicht doppelt eingetragen werden'
);
select throws_ok(
  $$insert into public.newsletter_subscriber (email, unsubscribe_token_hash, status) values ('x@example.com', 'h3', 'irgendwas')$$,
  '23514', null, 'Nur pending, confirmed und unsubscribed sind erlaubte Status'
);

-- Besucher ohne Anmeldung
set local role anon;
select throws_ok($$select * from public.newsletter_subscriber$$, '42501', null, 'anon kann die Liste nicht lesen');
select throws_ok(
  $$insert into public.newsletter_subscriber (email, unsubscribe_token_hash) values ('anon@example.com', 'h4')$$,
  '42501', null, 'anon kann sich nicht selbst eintragen'
);
reset role;

-- Angemeldeter Nutzer
insert into auth.users (id, email) values ('80000000-0000-0000-0000-00000000000a', 'nutzer.newsletter@example.com');
set local role authenticated;
set local request.jwt.claim.sub = '80000000-0000-0000-0000-00000000000a';
select throws_ok($$select * from public.newsletter_subscriber$$, '42501', null, 'Angemeldete Nutzer können die Liste nicht lesen');
select throws_ok($$update public.newsletter_subscriber set status = 'confirmed'$$, '42501', null, 'Angemeldete Nutzer können nichts bestätigen');
select throws_ok($$delete from public.newsletter_subscriber$$, '42501', null, 'Angemeldete Nutzer können nichts löschen');
reset role;
reset request.jwt.claim.sub;

select * from finish();
rollback;
