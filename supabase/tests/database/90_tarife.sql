-- Test: Tarif am Konto und die Grenzen im kostenlosen Tarif (5 Immobilien,
-- 20 aktive Interessenten). Durchgesetzt in der Datenbank, nicht umgehbar.
begin;
-- Im "extensions"-Schema fehlt der Verbindung auf dem echten Projekt das
-- Leserecht; "public" funktioniert dort wie lokal gleichermaßen.
create extension if not exists pgtap with schema public;

select plan(26);

-- Grenzwerte (müssen mit src/lib/constants/tarife.ts übereinstimmen)
select is(public.tarif_grenze('kostenlos', 'immobilien'), 5, 'kostenlos: 5 Immobilien');
select is(public.tarif_grenze('kostenlos', 'aktive_interessenten'), 20, 'kostenlos: 20 aktive Interessenten');
select is(public.tarif_grenze('plus', 'immobilien'), 10, 'plus: 10 Immobilien');
select is(public.tarif_grenze('plus', 'aktive_interessenten'), 100, 'plus: 100 aktive Interessenten');
select is(public.tarif_grenze('pro', 'immobilien'), null, 'pro: unbegrenzt');
select is(public.tarif_grenze('pro', 'aktive_interessenten'), null, 'pro: unbegrenzt');

insert into auth.users (id, email) values
  ('90000000-0000-0000-0000-00000000000a', 'nutzer.a.tarif@example.com'),
  ('90000000-0000-0000-0000-00000000000b', 'nutzer.b.tarif@example.com');

select account_id as konto_a from public.account_member where user_id = '90000000-0000-0000-0000-00000000000a' \gset
select account_id as konto_b from public.account_member where user_id = '90000000-0000-0000-0000-00000000000b' \gset

select is((select tarif from public.account where id = :'konto_a'), 'kostenlos', 'Neues Konto startet im Tarif kostenlos');
select throws_ok(
  format('update public.account set tarif = %L where id = %L', 'gold', :'konto_a'),
  '23514', null, 'Nur kostenlos, plus und pro sind erlaubte Tarife'
);

-- Als Nutzer A: Tarif selbst ändern ist wirkungslos (keine Update-Policy)
set local role authenticated;
set local request.jwt.claim.sub = '90000000-0000-0000-0000-00000000000a';
update public.account set tarif = 'pro' where id = :'konto_a';
reset role;
reset request.jwt.claim.sub;
select is((select tarif from public.account where id = :'konto_a'), 'kostenlos', 'Nutzer kann seinen Tarif nicht selbst ändern');

-- Immobilien: als Nutzer A fünf anlegen, die sechste scheitert
set local role authenticated;
set local request.jwt.claim.sub = '90000000-0000-0000-0000-00000000000a';

select lives_ok(
  format($f$insert into public.property (account_id, art, bezeichnung, kaufpreis)
            select %L, 'einfamilienhaus', 'Haus ' || n, 100000 from generate_series(1, 5) n$f$, :'konto_a'),
  'Nutzer A kann 5 Immobilien anlegen'
);
select throws_ok(
  format($f$insert into public.property (account_id, art, bezeichnung, kaufpreis) values (%L, 'einfamilienhaus', 'Haus 6', 100000)$f$, :'konto_a'),
  'TL001', null, 'Die 6. Immobilie wird abgelehnt'
);
select is((select count(*)::int from public.property where account_id = :'konto_a'), 5, 'Es bleiben genau 5 Immobilien');

-- Übernahme aus der Kaufprüfung ist ebenfalls begrenzt
insert into public.prospect (account_id, art, bezeichnung, kaufpreis, status)
values (:'konto_a', 'einfamilienhaus', 'Interessent zum Übernehmen', 200000, 'besichtigt')
returning id as prospect_uebernahme \gset
select throws_ok(
  format('select public.prospect_to_property(%L)', :'prospect_uebernahme'),
  'TL001', null, 'Übernahme in den Bestand über dem Limit wird abgelehnt'
);
select is((select status from public.prospect where id = :'prospect_uebernahme'), 'besichtigt', 'Interessent bleibt nach abgelehnter Übernahme unverändert');

-- Löschen macht wieder Platz
delete from public.property where id = (select id from public.property where account_id = :'konto_a' limit 1);
select lives_ok(
  format('select public.prospect_to_property(%L)', :'prospect_uebernahme'),
  'Nach dem Löschen einer Immobilie klappt die Übernahme'
);

-- Interessenten: 20 aktive gehen (einer ist oben gekauft und zählt nicht mehr), der 21. scheitert
select lives_ok(
  format($f$insert into public.prospect (account_id, art, bezeichnung, kaufpreis)
            select %L, 'eigentumswohnung', 'Interessent ' || n, 150000 from generate_series(1, 20) n$f$, :'konto_a'),
  'Nutzer A kann 20 aktive Interessenten anlegen'
);
select throws_ok(
  format($f$insert into public.prospect (account_id, art, bezeichnung, kaufpreis) values (%L, 'eigentumswohnung', 'Interessent 21', 150000)$f$, :'konto_a'),
  'TL002', null, 'Der 21. aktive Interessent wird abgelehnt'
);
select lives_ok(
  format($f$insert into public.prospect (account_id, art, bezeichnung, kaufpreis, status) values (%L, 'eigentumswohnung', 'Abgelehnt direkt', 150000, 'abgelehnt')$f$, :'konto_a'),
  'Abgelehnte Interessenten zählen nicht und können trotzdem angelegt werden'
);
select lives_ok(
  format($f$update public.prospect set status = 'besichtigt' where account_id = %L and bezeichnung = 'Interessent 1'$f$, :'konto_a'),
  'Statuswechsel zwischen aktiven Status bleibt möglich'
);
select throws_ok(
  format($f$update public.prospect set status = 'beobachtet' where account_id = %L and bezeichnung = 'Abgelehnt direkt'$f$, :'konto_a'),
  'TL002', null, 'Wiederaufnahme eines abgelehnten Interessenten über dem Limit wird abgelehnt'
);
select lives_ok(
  format($f$update public.prospect set status = 'abgelehnt' where account_id = %L and bezeichnung = 'Interessent 2'$f$, :'konto_a'),
  'Ablehnen bleibt immer möglich'
);
select lives_ok(
  format($f$update public.prospect set status = 'beobachtet' where account_id = %L and bezeichnung = 'Abgelehnt direkt'$f$, :'konto_a'),
  'Mit wieder freiem Platz klappt die Wiederaufnahme'
);

reset role;
reset request.jwt.claim.sub;

-- Konto B ist von der Auslastung von A unberührt
set local role authenticated;
set local request.jwt.claim.sub = '90000000-0000-0000-0000-00000000000b';
select lives_ok(
  format($f$insert into public.property (account_id, art, bezeichnung, kaufpreis) values (%L, 'einfamilienhaus', 'Haus von B', 100000)$f$, :'konto_b'),
  'Konto B kann unabhängig von A anlegen'
);
reset role;
reset request.jwt.claim.sub;

-- Tarif plus (nur per Datenbank-Verwaltung setzbar) erlaubt 10 Immobilien
update public.account set tarif = 'plus' where id = :'konto_b';
select lives_ok(
  format($f$insert into public.property (account_id, art, bezeichnung, kaufpreis)
            select %L, 'einfamilienhaus', 'Plus-Haus ' || n, 100000 from generate_series(1, 9) n$f$, :'konto_b'),
  'Tarif plus: 10 Immobilien möglich'
);
select throws_ok(
  format($f$insert into public.property (account_id, art, bezeichnung, kaufpreis) values (%L, 'einfamilienhaus', 'Plus-Haus 11', 100000)$f$, :'konto_b'),
  'TL001', null, 'Tarif plus: die 11. Immobilie wird abgelehnt'
);

-- Tarif pro ist unbegrenzt
update public.account set tarif = 'pro' where id = :'konto_b';
select lives_ok(
  format($f$insert into public.property (account_id, art, bezeichnung, kaufpreis) values (%L, 'einfamilienhaus', 'Pro-Haus', 100000)$f$, :'konto_b'),
  'Tarif pro: keine Grenze'
);

select * from finish();
rollback;
