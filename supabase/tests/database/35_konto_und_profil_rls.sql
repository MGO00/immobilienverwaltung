-- Test: Zugriffsregeln für Konto, Mitgliedschaft und Profil. Nutzer A sieht
-- und ändert nie Konto, Mitgliederliste oder Profil von Nutzer B (Ergänzung zu
-- 30_row_level_security.sql, das die Fachtabellen abdeckt).
begin;
-- Im "extensions"-Schema fehlt der Verbindung auf dem echten Projekt das
-- Leserecht; "public" funktioniert dort wie lokal gleichermaßen.
create extension if not exists pgtap with schema public;

select plan(14);

insert into auth.users (id, email, raw_user_meta_data) values
  ('35000000-0000-0000-0000-00000000000a', 'nutzer.a.konto@example.com', '{"display_name": "Anna A"}'),
  ('35000000-0000-0000-0000-00000000000b', 'nutzer.b.konto@example.com', '{"display_name": "Bernd B"}');

select account_id as konto_a from public.account_member where user_id = '35000000-0000-0000-0000-00000000000a' \gset
select account_id as konto_b from public.account_member where user_id = '35000000-0000-0000-0000-00000000000b' \gset

-- Als Nutzer A angemeldet
set local role authenticated;
set local request.jwt.claim.sub = '35000000-0000-0000-0000-00000000000a';

select is((select count(*)::int from public.account), 1, 'Nutzer A sieht genau ein Konto');
select is((select id from public.account), :'konto_a'::uuid, 'Das ist sein eigenes Konto');
select is((select count(*)::int from public.account where id = :'konto_b'), 0, 'Nutzer A sieht das Konto von B nicht');

select is((select count(*)::int from public.account_member), 1, 'Nutzer A sieht nur die Mitgliederliste seines Kontos');
select is(
  (select count(*)::int from public.account_member where user_id = '35000000-0000-0000-0000-00000000000b'),
  0,
  'Nutzer A sieht die Mitgliedschaft von B nicht'
);
select throws_ok(
  format('insert into public.account_member (account_id, user_id) values (%L, %L)',
    :'konto_b', '35000000-0000-0000-0000-00000000000a'),
  '42501', null, 'Nutzer A kann sich nicht in das Konto von B eintragen'
);

select is((select count(*)::int from public.profile), 1, 'Nutzer A sieht nur ein Profil');
select is((select display_name from public.profile), 'Anna A', 'Das ist sein eigenes Profil');
select is(
  (select count(*)::int from public.profile where user_id = '35000000-0000-0000-0000-00000000000b'),
  0,
  'Nutzer A sieht das Profil von B nicht'
);

select lives_ok(
  $$update public.profile set display_name = 'Anna Neu' where user_id = '35000000-0000-0000-0000-00000000000a'$$,
  'Nutzer A kann sein eigenes Profil ändern'
);
-- Fremde Zeilen filtert RLS schon vor dem Ändern heraus: kein Fehler, aber null Zeilen.
update public.profile set display_name = 'Manipuliert' where user_id = '35000000-0000-0000-0000-00000000000b';
delete from public.account where id = :'konto_b';
delete from public.account_member where account_id = :'konto_b';

reset role;
reset request.jwt.claim.sub;

select is(
  (select display_name from public.profile where user_id = '35000000-0000-0000-0000-00000000000a'),
  'Anna Neu',
  'Die eigene Änderung ist gespeichert'
);
select is(
  (select display_name from public.profile where user_id = '35000000-0000-0000-0000-00000000000b'),
  'Bernd B',
  'Nutzer A konnte das Profil von B nicht ändern'
);
select is((select count(*)::int from public.account where id = :'konto_b'), 1, 'Nutzer A konnte das Konto von B nicht löschen');
select is(
  (select count(*)::int from public.account_member where account_id = :'konto_b'),
  1,
  'Nutzer A konnte die Mitgliedschaft von B nicht löschen'
);

select * from finish();
rollback;
