-- Test: Kaufprüfung (Tabelle prospect). Zugriffsregeln (A sieht nie B, anon
-- nichts), Wertebereiche und die atomare Übernahme in den Bestand.
begin;
-- Im "extensions"-Schema fehlt der Verbindung auf dem echten Projekt das
-- Leserecht; "public" funktioniert dort wie lokal gleichermaßen.
create extension if not exists pgtap with schema public;

select plan(20);

insert into auth.users (id, email) values
  ('70000000-0000-0000-0000-00000000000a', 'nutzer.a.prospect@example.com'),
  ('70000000-0000-0000-0000-00000000000b', 'nutzer.b.prospect@example.com');

select account_id as konto_a from public.account_member
where user_id = '70000000-0000-0000-0000-00000000000a' \gset
select account_id as konto_b from public.account_member
where user_id = '70000000-0000-0000-0000-00000000000b' \gset

-- Als Nutzer A angemeldet
set local role authenticated;
set local request.jwt.claim.sub = '70000000-0000-0000-0000-00000000000a';

select lives_ok(
  format('insert into public.prospect (account_id, art, bezeichnung, kaufpreis, flaeche_qm, kaltmiete_monat, inserat_url)
          values (%L, ''eigentumswohnung'', ''Altbauwohnung Connewitz'', 165000, 72, 780, ''https://example.com/inserat/1'')', :'konto_a'),
  'Nutzer A kann einen Interessenten anlegen'
);

select is(
  (select status from public.prospect where bezeichnung = 'Altbauwohnung Connewitz'),
  'beobachtet',
  'Neuer Interessent startet bei beobachtet'
);

select throws_ok(
  format('insert into public.prospect (account_id, art, bezeichnung, kaufpreis) values (%L, ''einfamilienhaus'', ''x'', 0)', :'konto_a'),
  '23514', null, 'Kaufpreis muss größer 0 sein'
);

select throws_ok(
  format('insert into public.prospect (account_id, art, bezeichnung, kaufpreis, status) values (%L, ''einfamilienhaus'', ''x'', 1, ''unbekannt'')', :'konto_a'),
  '23514', null, 'Nur die fünf Status sind erlaubt'
);

select throws_ok(
  format('insert into public.prospect (account_id, art, bezeichnung, kaufpreis, inserat_url) values (%L, ''einfamilienhaus'', ''x'', 1, ''javascript:alert(1)'')', :'konto_a'),
  '23514', null, 'Inserats-Link nur mit http/https'
);

select throws_ok(
  format('insert into public.prospect (account_id, art, bezeichnung, kaufpreis) values (%L, ''einfamilienhaus'', ''Fremd'', 1)', :'konto_b'),
  '42501', null, 'Nutzer A kann keinen Interessenten in Konto B anlegen'
);

-- Übernahme: zu früh (beobachtet) wird abgelehnt
select id as prospect_a_id from public.prospect where bezeichnung = 'Altbauwohnung Connewitz' \gset

select throws_ok(
  format('select public.prospect_to_property(%L)', :'prospect_a_id'),
  'P0001', 'Die Übernahme ist erst ab dem Status "besichtigt" möglich.',
  'Übernahme bei Status beobachtet wird abgelehnt'
);

update public.prospect set status = 'besichtigt' where id = :'prospect_a_id';

select lives_ok(
  format('select public.prospect_to_property(%L)', :'prospect_a_id'),
  'Übernahme bei Status besichtigt funktioniert'
);

select is(
  (select status from public.prospect where id = :'prospect_a_id'), 'gekauft',
  'Interessent ist danach gekauft'
);

select is(
  (select count(*)::int from public.property p join public.prospect x on x.property_id = p.id
   where x.id = :'prospect_a_id' and p.bezeichnung = 'Altbauwohnung Connewitz' and p.kaufpreis = 165000),
  1,
  'Verknüpfte Immobilie mit den übernommenen Daten existiert'
);

select is(
  (select u.flaeche_qm::text || '/' || u.kaltmiete_monat::text || '/' || u.status
   from public.unit u join public.prospect x on x.property_id = u.property_id where x.id = :'prospect_a_id'),
  '72.00/780.00/leer',
  'Fläche und erwartete Miete stehen in der einen Einheit (Status leer)'
);

select throws_ok(
  format('select public.prospect_to_property(%L)', :'prospect_a_id'),
  'P0001', 'Dieser Interessent wurde bereits in den Bestand übernommen.',
  'Zweite Übernahme desselben Interessenten wird abgelehnt'
);

-- Mehrfamilienhaus bekommt eine Einheit mit den Gesamtwerten
insert into public.prospect (account_id, art, bezeichnung, kaufpreis, flaeche_qm, kaltmiete_monat, status)
values (:'konto_a', 'mehrfamilienhaus', 'Zinshaus Hörde', 720000, 380, 3100, 'angebot_abgegeben');
select id as prospect_mfh_id from public.prospect where bezeichnung = 'Zinshaus Hörde' \gset

select public.prospect_to_property(:'prospect_mfh_id');

select is(
  (select count(*)::int from public.unit u join public.prospect x on x.property_id = u.property_id
   where x.id = :'prospect_mfh_id' and u.name = 'Einheit 1' and u.kaltmiete_monat = 3100 and u.flaeche_qm = 380),
  1,
  'Mehrfamilienhaus: eine Einheit "Einheit 1" mit den Gesamtwerten'
);

-- Immobilie löschen: Interessent bleibt, Verweis wird leer
delete from public.property where id = (select property_id from public.prospect where id = :'prospect_mfh_id');

select is(
  (select property_id is null and status = 'gekauft' from public.prospect where id = :'prospect_mfh_id'),
  true,
  'Nach dem Löschen der Immobilie bleibt der Interessent, der Verweis ist leer'
);

reset role;
reset request.jwt.claim.sub;

-- Nutzer B (eigener Interessent in Konto B) sieht und ändert nichts von A
insert into public.prospect (account_id, art, bezeichnung, kaufpreis, status)
values (:'konto_b', 'einfamilienhaus', 'Haus von B', 200000, 'besichtigt');
select id as prospect_b_id from public.prospect where bezeichnung = 'Haus von B' \gset

set local role authenticated;
set local request.jwt.claim.sub = '70000000-0000-0000-0000-00000000000b';

select is(
  (select count(*)::int from public.prospect where account_id = :'konto_a'), 0,
  'Nutzer B sieht keine Interessenten von A'
);

update public.prospect set bezeichnung = 'manipuliert' where id = :'prospect_a_id';
delete from public.prospect where id = :'prospect_a_id';

select throws_ok(
  format('select public.prospect_to_property(%L)', :'prospect_a_id'),
  'P0001', null,
  'Nutzer B kann fremden Interessenten nicht übernehmen (nicht gefunden bzw. schon übernommen)'
);

reset role;
reset request.jwt.claim.sub;

select is(
  (select bezeichnung from public.prospect where id = :'prospect_a_id'),
  'Altbauwohnung Connewitz',
  'Nutzer B konnte den Interessenten von A weder ändern noch löschen'
);

-- Ein zweiter Interessent von A, den B übernehmen will (Status passt, aber fremd)
insert into public.prospect (account_id, art, bezeichnung, kaufpreis, status)
values (:'konto_a', 'einfamilienhaus', 'Haus Garbsen', 310000, 'besichtigt');
select id as prospect_garbsen_id from public.prospect where bezeichnung = 'Haus Garbsen' \gset

set local role authenticated;
set local request.jwt.claim.sub = '70000000-0000-0000-0000-00000000000b';

select throws_ok(
  format('select public.prospect_to_property(%L)', :'prospect_garbsen_id'),
  'P0001', 'Interessent nicht gefunden.',
  'Fremder besichtigter Interessent: Übernahme durch B scheitert mit "nicht gefunden"'
);

reset role;
reset request.jwt.claim.sub;

-- Ohne Anmeldung (anon): nichts sichtbar, nichts anlegbar
set local role anon;

select is((select count(*)::int from public.prospect), 0, 'anon sieht keine Interessenten');

select throws_ok(
  format('insert into public.prospect (account_id, art, bezeichnung, kaufpreis) values (%L, ''einfamilienhaus'', ''x'', 1)', :'konto_a'),
  null, null, 'anon kann keinen Interessenten anlegen'
);

reset role;

select * from finish();
rollback;
