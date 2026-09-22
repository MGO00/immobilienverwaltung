-- Test: Zugriffsregeln (RLS). Nutzer A sieht/ändert nie Daten von Nutzer B --
-- auch nicht über unit, running_cost_item oder note.
begin;
create extension if not exists pgtap;

select plan(8);

insert into auth.users (id, email) values
  ('30000000-0000-0000-0000-00000000000a', 'nutzer.a.rls@example.com'),
  ('30000000-0000-0000-0000-00000000000b', 'nutzer.b.rls@example.com');

select account_id as konto_a
from public.account_member
where user_id = '30000000-0000-0000-0000-00000000000a'
\gset

insert into public.property (account_id, art, bezeichnung, kaufpreis)
values (:'konto_a', 'einfamilienhaus', 'Haus von A', 300000)
returning id as haus_a_id
\gset

select id as einheit_a_id from public.unit where property_id = :'haus_a_id' \gset

insert into public.running_cost_item (account_id, property_id, typ, betrag_monat)
values (:'konto_a', :'haus_a_id', 'grundsteuer', 50)
returning id as kosten_a_id
\gset

insert into public.note (account_id, property_id, text)
values (:'konto_a', :'haus_a_id', 'Notiz von A')
returning id as notiz_a_id
\gset

-- Als Nutzer A angemeldet: sieht die eigene Immobilie.
set local role authenticated;
set local request.jwt.claim.sub = '30000000-0000-0000-0000-00000000000a';

select is(
  (select count(*)::int from public.property where id = :'haus_a_id'),
  1,
  'Nutzer A sieht seine eigene Immobilie'
);

reset role;
reset request.jwt.claim.sub;

-- Als Nutzer B angemeldet: sieht nichts von A und darf nichts einfügen/ändern.
set local role authenticated;
set local request.jwt.claim.sub = '30000000-0000-0000-0000-00000000000b';

select is(
  (select count(*)::int from public.property where id = :'haus_a_id'),
  0,
  'Nutzer B sieht die Immobilie von Nutzer A nicht'
);

select is(
  (select count(*)::int from public.unit where id = :'einheit_a_id'),
  0,
  'Nutzer B sieht die Einheit von Nutzer A nicht'
);

select is(
  (select count(*)::int from public.running_cost_item where id = :'kosten_a_id'),
  0,
  'Nutzer B sieht den Kostenposten von Nutzer A nicht'
);

select is(
  (select count(*)::int from public.note where id = :'notiz_a_id'),
  0,
  'Nutzer B sieht die Notiz von Nutzer A nicht'
);

select throws_ok(
  format('insert into public.property (account_id, art, bezeichnung, kaufpreis) values (%L, %L, %L, %L)',
    :'konto_a', 'einfamilienhaus', 'Eingeschleust', 1),
  'new row violates row-level security policy for table "property"',
  'Nutzer B kann keine Immobilie in Konto A anlegen'
);

select throws_ok(
  format('insert into public.unit (account_id, property_id, name, kaltmiete_monat) values (%L, %L, %L, %L)',
    :'konto_a', :'haus_a_id', 'Eingeschleust', 1),
  'new row violates row-level security policy for table "unit"',
  'Nutzer B kann keine Einheit in Konto A anlegen'
);

-- RLS filtert die Zeile über die USING-Klausel schon vor dem Ändern heraus:
-- Der Befehl selbst schlägt nicht fehl, betrifft aber null Zeilen.
update public.note set text = 'Manipuliert' where id = :'notiz_a_id';

reset role;
reset request.jwt.claim.sub;

select is(
  (select text from public.note where id = :'notiz_a_id'),
  'Notiz von A',
  'Nutzer B kann die Notiz von Nutzer A nicht ändern'
);

select * from finish();
rollback;
