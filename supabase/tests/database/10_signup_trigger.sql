-- Test: Registrierung legt automatisch Konto, Mitgliedschaft und Profil an.
begin;
create extension if not exists pgtap;

select plan(4);

insert into auth.users (id, email)
values ('10000000-0000-0000-0000-000000000001', 'signup.test@example.com');

select is(
  (select count(*)::int from public.account_member where user_id = '10000000-0000-0000-0000-000000000001'),
  1,
  'Neuer Nutzer bekommt genau eine Mitgliedschaft'
);

select is(
  (select rolle from public.account_member where user_id = '10000000-0000-0000-0000-000000000001'),
  'inhaber',
  'Die Rolle der ersten Mitgliedschaft ist "inhaber"'
);

select is(
  (select display_name from public.profile where user_id = '10000000-0000-0000-0000-000000000001'),
  'signup.test',
  'Der Anzeigename wird ohne Angabe aus der E-Mail-Adresse abgeleitet'
);

select isnt(
  (select account_id from public.account_member where user_id = '10000000-0000-0000-0000-000000000001'),
  null,
  'Die Mitgliedschaft verweist auf ein bestehendes Konto'
);

select * from finish();
rollback;
