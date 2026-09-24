# Projekt: Immobilienverwaltung

Web-App zur Verwaltung und Bewertung von Immobilien für Privatvermieter und Kapitalanleger in
Deutschland. Aktueller Stand: Basisvariante (MVP). Später Ausbau um Abomodelle, Mieterverwaltung,
Dokumente und weitere Rechner.

## Unternehmerischer Rahmen
- Nebenberufliche Gründung; die Nebentätigkeitsgenehmigung ist noch zu beantragen.
- Rechtsform voraussichtlich UG oder GmbH (kein Einzelunternehmen); eine vorgeschaltete Holding ist
  noch offen.
- Das ist eine Voraussetzung für Meilenstein 5: Impressum und AGB brauchen eine feststehende
  Rechtsform.
- Vollständige Gesamtvision (Tarife, Kaufprüfung, Sanierungsplaner, Verwaltung, Marketing/SEO,
  90-Tage-Plan): docs/planung/funktionsplanung-immobilienverwaltung.md.

## Zusammenarbeit
- Der Auftraggeber hat keine Programmierkenntnisse. Erkläre in einfachem Deutsch, was du tust und
  warum, und arbeite in kleinen, nachvollziehbaren Schritten.
- Sage vor größeren Änderungen kurz, was du vorhast. Frage bei unklaren Anforderungen nach, statt
  zu raten.
- Ist ein Schritt außerhalb des Codes nötig (Konto anlegen, Schlüssel eintragen, Einstellung im
  Dashboard), sage genau, was der Auftraggeber tun muss, und warte.
- Führe keine zerstörerischen Befehle aus (Dateien oder Datenbank löschen, Git-Verlauf umschreiben,
  Force-Push) ohne ausdrückliche Zustimmung.

## Technik
- Next.js (App Router) mit TypeScript, Tailwind CSS, shadcn/ui, lucide-react
- Supabase (Postgres, Auth, Storage) in der EU-Region Frankfurt; Hosting auf Vercel; Stripe erst in
  einer späteren Stufe
- Code-Bezeichner auf Englisch; Kommentare, Commit-Nachrichten und alle sichtbaren Texte auf Deutsch
- Routen auf Deutsch: / (öffentliche Startseite), /anmelden, /registrieren, /passwort-vergessen,
  /email-bestaetigen,
  /passwort-zuruecksetzen, /uebersicht, /immobilien/neu, /immobilien/[id] (mit den Unterseiten
  /einheiten, /kauf-und-finanzierung, /einnahmen-und-ausgaben, /rechner, /notizen je Tab),
  /immobilien/[id]/bearbeiten, /rechner,
  /rechner/kaufnebenkosten, /rechner/rendite, /rechner/finanzierung, /rechner/cashflow,
  /kaufpruefung, /kaufpruefung/neu, /kaufpruefung/[id], /kaufpruefung/[id]/bearbeiten,
  /einstellungen, /newsletter/bestaetigen, /newsletter/abmelden,
  /ressourcen, /ressourcen/grunderwerbsteuer, /ressourcen/glossar, /tipps
  (Artikelseiten /tipps/<slug> gibt es bewusst noch nicht, siehe "Keine öffentliche Seite mit
  Blindtext" unter Arbeitsweise.)
  Technischer Endpunkt ohne Seite: /auth/confirm (Ziel der Bestätigungs- und Recovery-Links von
  Supabase Auth).
  (/passwort-zuruecksetzen ist kein eigenes Nav-Ziel, sondern das Ziel des Links aus der
  Passwort-vergessen-E-Mail; im Prototyp nicht enthalten, aber ohne diesen Screen liefe der
  Reset-Link ins Leere.)
- Datenbankänderungen nur als Migrationsdateien im Repository (supabase/migrations), nie per Hand
  im Dashboard
- Befehle zum Starten, Bauen und Prüfen (im Projektordner ausführen):
  - `npm run dev` — startet die App lokal zur Entwicklung unter http://localhost:3000
  - `npm run build` — erstellt den Produktions-Build (muss vor jedem Livegang fehlerfrei laufen)
  - `npm run start` — startet den zuvor erstellten Produktions-Build lokal
  - `npm run lint` — prüft den Code automatisch auf Fehler und Stilprobleme (ESLint)
  - `npm test` — führt die automatischen Tests aus (Vitest), vor allem für die Rechner in
    src/lib/calculators/
  - `npx supabase test db` — führt die Datenbank-Tests aus (pgTAP, supabase/tests/database/),
    braucht einen laufenden lokalen Supabase-Stack (`npx supabase start`, benötigt Docker)

## Design
- Quelle: docs/design/. Für die App (alles hinter der Anmeldung) gilt runde-2 als neueste Runde bei
  Widersprüchen. Was in deren README fehlt (Komponenten-Zuordnung zu shadcn/ui, Tailwind-Mapping,
  Routen, Fokus-Stil), gilt aus runde-1 weiter. runde-4 betrifft nur die öffentliche Website
  (Startseite, Ressourcen, Glossar, Tipps & Tricks) und ändert nichts am Design der App. Für die
  Kaufprüfung gibt es keine eigene Runde (eine "runde-3" existiert nicht im Repository).
- Bei Widersprüchen zwischen README und Prototyp (Immobilienverwaltung.dc.html) gilt der Prototyp.
  Bekannte Fälle in runde-2: Die Navigation ist eine obere Leiste am Desktop und eine untere Leiste
  mobil (nicht, wie in der README steht, eine Sidebar). Der Assistent hat die Schritte 1 Objekt,
  2 Kauf und Finanzierung, 3 Miete und Kosten. Der Bearbeiten-Screen ist im Prototyp vereinfacht
  (ein Adressfeld, ein Kostenfeld, ein Mietfeld) — die App folgt stattdessen dem Muster des
  Assistenten: einzelne Adressfelder inkl. Bundesland, einzelne Kostenposten, Kaltmiete bei
  Wohnung/Haus über die einzige Einheit, beim Mehrfamilienhaus über den Einheiten-Tab.
- Weitere Fälle aus Meilenstein 3: Straße und Hausnummer sind ein einziges Feld (Datenbankspalte
  strasse_hausnummer), nicht zwei getrennte Felder wie im Prototyp. Der Einheiten-Status hat bei uns
  drei Werte inkl. selbstgenutzt (der Prototyp-Dialog bietet nur vermietet/leer) — folgt dem
  beschlossenen Datenmodell. Notizen sind eine Liste mehrerer datierter Einträge (note-Tabelle),
  nicht das vereinfachte Einzelfeld mit einem Speicherzeitpunkt aus dem Prototyp. Status-Pillen bei
  Einheiten: "leer" petrolfarben hervorgehoben (tag-accent), "vermietet" und "selbstgenutzt" neutral
  in Tinte — eigene Festlegung, weil der Prototyp sich hier selbst widerspricht (Detailseite und
  Assistent-Vorschau behandeln denselben Status unterschiedlich). Der Rechner-Tab auf der
  Detailseite zeigt alle vier Rechner-Karten als "Bereit", jeweils mit ?immobilie=<id> verlinkt (in
  Meilenstein 3 war nur Kaufnebenkosten verlinkt, die übrigen kamen mit Meilenstein 4).
- Weitere Fälle aus Meilenstein 4: Der Kaufnebenkosten-Rechner kann das Ergebnis bei Objektbezug
  (?immobilie=<id>) per "Übernehmen"-Button als kaufnebenkosten_betrag am Objekt speichern (im
  Prototyp die "Zuordnen"-Box) — ohne Objektbezug zeigt er nur das Ergebnis. Die
  Tilgungsplan-Tabelle im Finanzierungs-Rechner gruppiert nach echten Kalenderjahren statt nach
  Darlehensjahren; ein Start- oder Endjahr mit weniger als 12 Monaten wird mit der Monatsanzahl
  gekennzeichnet (z. B. "2026 (7 Monate)"). Ohne Kaufdatum am Objekt gilt das heutige Datum als
  Start; der eigenständige Rechner hat dafür ein eigenes "Startdatum"-Feld (Default heute). Die
  Zeile "Davon Tilgung" im Cashflow-Rechner erscheint nur mit Bezug auf eine Immobilie oder einen
  Interessenten mit Darlehen und Zins, weil sie beides getrennt von der eingegebenen Rate kennen muss. Brutto- und Nettorendite werden im
  Rendite-Rechner beide neutral dargestellt (der Prototyp hebt die Bruttorendite farbig hervor) —
  konsistent mit dem übrigen, durchgehend neutralen Kennzahlen-Stil der App.
- Weitere Fälle, öffentliche Rechner: Die vier Rechner und /rechner sind ohne Login erreichbar und
  liegen dafür in einer eigenen Routengruppe `(rechner)` mit session-abhängigem Layout
  (src/app/(rechner)/layout.tsx). Angemeldete sehen wie überall die normale App-Navigation
  (AppShell); Besucher ohne Anmeldung den öffentlichen Rahmen (PublicShell) mit derselben
  Navigation wie die Startseite (siehe "Weitere Fälle, Ressourcen und Tipps & Tricks") und eine
  schmale Fußzeile mit Impressum/Datenschutz (Platzhalter-Links bis Meilenstein 5) und dem Hinweis
  "Keine Steuer- oder Anlageberatung". Der Kopfbereich ist 1120 px breit wie auf der Startseite, der
  Rechner-Inhalt behält die App-Breite; der kleine Versatz zwischen Logo und Inhalt ist bewusst so
  belassen.
  Im eigenständigen Cashflow-Rechner (ohne Objektbezug) gibt es ein optionales Feld "Leerstand"
  in Prozent; die Ergebnisliste zeigt weiter die eingegebene Kaltmiete und den Leerstand als eigene
  Differenz-Zeile ("− Leerstand (x %)").
- Weitere Fälle, Kaufprüfung: Für diesen Bereich gibt es keinen Design-Entwurf (keine Runde in
  docs/design deckt ihn ab). Die Screens sind aus den vorhandenen Mustern abgeleitet (Übersicht,
  Objektkarte, Bearbeiten-Formular, Detailseite, Dialoge) und wurden Schritt für Schritt anhand von
  Screenshots freigegeben. Die Übersicht ist eine einfache Liste mit Status-Reitern (Alle,
  beobachtet, besichtigt, Angebot abgegeben, gekauft, abgelehnt, jeweils mit Anzahl); die im
  Briefing zusätzlich genannte Pipeline-Ansicht mit fünf Spalten wurde bewusst nicht gebaut.
  Gekaufte und abgelehnte Interessenten bleiben in der Liste sichtbar, mit grauerem Namen; gekaufte
  mit Link "Zur Immobilie im Bestand". Der Anlage-Screen ist ein einstufiges Formular (kein Assistent,
  keine Einheitenliste auch beim Mehrfamilienhaus, Finanzierung ausklappbar, Status startet immer
  bei "beobachtet"); Pflicht sind Objektart, Bezeichnung und Kaufpreis. Die Objektart ist beim
  Interessenten (anders als beim Bestand) nachträglich änderbar. Die Detailseite hat keine Tabs,
  sondern Abschnitte: Status-Stepper (beobachtet → besichtigt → Angebot abgegeben → gekauft,
  "abgelehnt" als Sonderfall mit "Wieder aufnehmen"), Stammdaten, ein einfaches Notizfeld (ein
  Text, nicht die datierte Notizliste des Bestands), Rechner-Karten, Löschen. "gekauft" ist nur über
  "In Bestand übernehmen" erreichbar (Klick auf den Schritt oder den Button, ab "besichtigt"),
  nie direkt. Der Übernahme-Dialog zeigt vorab alle übernommenen Felder inkl. Objektart. Die vier
  Rechner öffnen sich mit ?interessent=<id> vorbefüllt (Kaufpreis, Bundesland, erwartete Miete,
  Darlehen/Zins/Tilgung; laufende Kosten und Kaufnebenkosten sind dort nicht erfasst). "Davon
  Tilgung" erscheint im Cashflow-Rechner, sobald Darlehen und Zins bekannt sind; das
  Leerstand-Feld bleibt beim Interessenten sichtbar (es gibt keine echten Einheiten), nur beim
  Bestandsobjekt entfällt es.
- Weitere Fälle, Startseite (Runde 4, Schritt 1): docs/design/runde-4/ enthält seit dem 24.09.2026
  den Stand von Schritt 2 (Ressourcen, Glossar, Tipps & Tricks), nicht mehr das Handoff der
  Startseite. Das Schritt-1-Handoff ist vollständig und unverändert in der Git-Historie verfügbar,
  und zwar nur in Commit 5ddada4 — dem einzigen Commit, mit dem es ins Repository kam. Das ist ein
  fachfremder Commit (Kaufprüfung-Detailseite), der die Dateien versehentlich mit aufgenommen hat;
  einen eigenen Commit für das Schritt-1-Handoff gibt es nicht. Abrufen z. B. mit
  `git show 5ddada4:docs/design/runde-4/README.md`. Die öffentliche Startseite
  `/` folgt dem Handoff in Aufbau und Optik (Navigation, Hero mit Beispielrechnung, vier
  Rechner-Kacheln, "So funktioniert's", FAQ-Akkordeon, E-Mail-Liste, Fußzeile), aber NICHT dessen
  Texten, wo diese falsch oder erfunden waren. Alle Texte stehen zentral in
  src/lib/start/inhalte.ts. Korrigiert gegenüber dem Prototyp: keine Frage zum Datenexport (gibt es
  nicht); Kontaktadresse als [Platzhalter]; Kontolöschung mit der echten Funktion ("In den
  Einstellungen unter „Konto“ kannst du dein Konto selbst löschen. …"); "Bezahltarife sind für später
  geplant." (kein Jahr); "Der Finanzierungsrechner rechnet monatlich, wie bei einer Bank üblich.";
  Übernahme in eine Immobilie nur für den Kaufnebenkosten-Rechner erwähnt; Schritt 1 "Deine
  Eingaben werden nicht gespeichert."; Schritt 3 mit den echten Assistenten-Schritten; keine Zahl
  "bis zu 5 Immobilien" (Tariflimit unbestätigt und nicht umgesetzt). Grundsatz: Die Startseite
  verspricht nur, was die App tatsächlich kann — ändert sich die App, werden diese Texte
  mitgezogen. "Tipps & Tricks" und "Ressourcen" stehen seit Schritt 2 in der Navigation; der Text
  der E-Mail-Liste nennt sie bewusst weiterhin nicht ("Neuigkeiten zu den Rechnern und neuen
  Funktionen"), solange es keine echten Artikel gibt. Die Beispielrechnung im Hero (189.000 €, Bayern →
  17.142 €) wird aus dem echten Kaufnebenkosten-Rechner erzeugt, nicht hartkodiert
  (src/lib/start/beispielrechnung.ts, mit Test). Die Hero-Überschrift ist bewusst größer als H1 in
  der App (laut Handoff). Die E-Mail-Liste erscheint nur, wenn Mailversand und Secret-Key
  eingerichtet sind (siehe Sicherheit); die Bestätigen- und Abmelden-Seiten nutzen den
  öffentlichen Rahmen (PublicShell), dessen Logo zur Startseite führt.
- Weitere Fälle, Ressourcen und Tipps & Tricks (Runde 4, Schritt 2): Quelle ist
  docs/design/runde-4/ (README und Website.dc.html, Stand 24.09.2026, vom Auftraggeber geprüft;
  Texte und Zahlen 1:1 übernommen). Seiten in der Routengruppe `(website)` mit session-abhängigem
  Layout wie `(rechner)`: Angemeldete sehen den App-Rahmen, Besucher die PublicShell (Fußzeile
  dort nur Impressum · Datenschutz). Texte zentral in src/lib/ressourcen/inhalte.ts, Glossar in
  src/lib/ressourcen/glossar.ts; die Zahlen auf den Ressourcen-Karten ("16 Bundesländer",
  "7 Begriffe") werden aus den Daten gezählt. Die Grunderwerbsteuer-Tabelle kommt aus derselben
  Konstante wie der Kaufnebenkosten-Rechner (siehe Fachliche Regeln), belegt durch
  src/lib/ressourcen/grunderwerbsteuer.test.ts. Glossar-Anker ohne Umlaute
  (`#glossar-nicht-umlagefaehige-kosten`, Prototyp: mit "ä"). Abweichungen vom Prototyp: Die zwei
  Platzhalter-Karten unter /tipps sind NICHT anklickbar (keine Artikelseiten); die Artikel-Vorlage
  existiert nur als Baustein ohne Route und ohne Beispielinhalt
  (src/components/tipps/artikel-vorlage.tsx, Datenform src/lib/tipps/artikel.ts).
  Öffentliche Navigation überall gleich (src/components/shell/public-header.tsx; Startseite,
  Rechner, Ressourcen, Tipps, Newsletter-Seiten): Rechner · Tipps & Tricks · Ressourcen |
  Anmelden · Registrieren, mobil mit Menü. Aktiver Bereich unterstrichen mit aria-current:
  "Ressourcen" auf allen Ressourcen-Seiten, "Tipps & Tricks" auf /tipps und — Ergänzung zum
  Handoff — "Rechner" auf /rechner und allen Rechner-Unterseiten; auf der Startseite springt
  "Rechner" zum Abschnitt #rechner und bleibt unmarkiert. Für Angemeldete (Empfehlung des Handoffs
  aus Schritt 1, reduziert): Hauptnavigation der App unverändert; "Ressourcen" im Nutzermenü;
  im Kaufnebenkosten-Rechner der Link "Alle Sätze im Überblick →" zur Tabelle (für alle sichtbar).
  "Tipps & Tricks" kommt erst mit dem ersten echten Artikel ins Nutzermenü; "?"-Links neben
  Fachbegriffen ins Glossar sind ein eigener späterer Schritt.
- Weitere Fälle, Navigation und Einstellungen: Die Hauptnavigation hat vier Punkte — Übersicht,
  Kaufprüfung, Rechner, Einstellungen (src/components/shell/nav-links.ts); "Kaufprüfung" steht
  zwischen Übersicht und Rechner. Die mobile untere Leiste hat damit vier statt der drei Plätze aus
  runde-2. Die Einstellungen weichen bewusst von runde-2, Abschnitt 10 ab: echte Kontolöschung mit
  Passwortbestätigung statt "Hinweis zum Löschen per E-Mail"; die E-Mail-Adresse wird nur angezeigt
  (Ändern folgt mit dem eigenen Mailversand); kein Button "Tarife vergleichen", stattdessen "Größere
  Tarife sind in Vorbereitung.".
- Die Design-Dateien sind Referenz, kein Produktionscode: nachbauen, nicht kopieren. Die
  Prototyp-Leiste (schwarzer Balken oben) gehört nicht zum Produkt.
- Konkrete Werte (Farben, Größen, Radien, Abstände) stehen in der README der neuesten Runde und
  werden hier nicht dupliziert. Wichtigste Merkmale: weißer Grund, 1px-Linien, Petrol-Akzent
  sparsam (primäre Aktion, Links, Hauptzahl), Schrift Archivo mit Überschriften in 600, Karten mit
  10px Radius, Status-Pillen 999px, Schatten nur für Popover und Dialog, eigener Fehler-Token.
- Zahlen mit tabellarischen Ziffern. Ansprache "Du". Deutsche Formate: 1.234,56 €, TT.MM.JJJJ,
  58 m², Minuszeichen "−".
- Negative Werte werden überall neutral mit Minuszeichen dargestellt, nie rot. Die Fehlerfarbe ist
  nur für Fehler da. Die rote Darstellung des negativen Cashflows in Rechner 04 im Prototyp NICHT
  übernehmen.
- Screens, die noch nicht designt sind, nicht frei erfinden: vorhandene Muster nutzen und
  Abweichungen melden.
- Barrierefreiheit: sichtbarer Fokusring, Kontrast mindestens 4,5:1, Fehler nie nur über Farbe.
- Weitere Fälle, Foto-Upload: Der Prototyp bietet Upload an drei Stellen (Übersichtskarte,
  Detailseite, Assistent Schritt 1); die App bewusst nur an einer zentralen Stelle je Kontext —
  Bearbeiten-Formular für bestehende Immobilien, letzter Assistenten-Schritt ("Miete und Kosten")
  für neue. Der Foto-Bereich ist deshalb von Schritt 1 (Prototyp-Ort) in Schritt 3 gewandert. Das
  Bearbeiten-Formular bekommt dafür einen Foto-Abschnitt, den der Prototyp dort gar nicht kennt.
  Kein Zuschnitt/Pan-Zoom-Editor wie im Prototyp — Bilder werden per `object-fit: cover` in die
  festen Rahmen eingepasst. Ein "Foto entfernen"-Button ergänzt die im Prototyp nur vorhandenen
  "Replace"/"Edit"-Aktionen. Format: JPG, PNG, WebP, maximal 8 MB, im Browser automatisch auf
  maximal 1920px lange Kante verkleinert. Pfad im Bucket: `<account_id>/<property_id>` ohne
  Dateiendung (Content-Type kommt als Objekt-Metadatum mit, dadurch kann ein Ersetzen mit anderem
  Format nie ein verwaistes Foto unter der alten Endung hinterlassen). Anzeige über eine
  serverseitig je Seitenaufruf frisch erzeugte, 1 Stunde gültige signierte URL — kein manueller
  Schritt im Supabase-Dashboard nötig, Bucket und Zugriffsregeln kommen komplett per Migration.

## Umfang der Basisvariante
Im Umfang:
- Registrierung und Login
- Übersicht mit Kennzahlen
- Immobilie anlegen, bearbeiten, löschen
- Detailseite mit Tabs: Übersicht, Einheiten, Kauf und Finanzierung, Einnahmen und Ausgaben,
  Rechner, Notizen
- Rechner: Kaufnebenkosten, Rendite, Finanzierung mit Tilgungsplan, Cashflow
- Objektfotos: ein Foto pro Immobilie, echter Upload über Supabase Storage (privater Bucket
  `property-photos`, siehe Design-Abschnitt für die Details). Objektkarte 132px hoch, Detailseite
  280×188px — beide nur Anzeige, kein Upload dort. Upload/Ersetzen/Entfernen ausschließlich im
  Bearbeiten-Formular und im letzten Assistenten-Schritt (220×148px), jeweils über die
  wiederverwendbare `FotoUpload`-Komponente.
- Kaufprüfung (Interessenten): Liste mit Status-Reitern, Interessent hinzufügen/bearbeiten/löschen,
  Status ändern, Notiz, vorbefüllte Rechner, Übernahme in den Bestand. Basisanalyse ohne mehrere
  Szenarien und ohne Vergleich (das ist laut Planung ab Plus). Der Zähler "X von 20 aktiven
  Interessenten" zeigt die echte, durchgesetzte Grenze des Tarifs (siehe "Tarife und Grenzen").
- Tarif-Grenzen im kostenlosen Tarif (5 Objekte, 20 aktive Interessenten), echt durchgesetzt, mit
  Zähler "X von 5 Objekten genutzt" auf der Übersicht (siehe "Tarife und Grenzen"). Kein
  Zahlungssystem, keine Preisseite, kein Tarifwechsel.
- Einstellungen (nach runde-2, Abschnitt 10): Profil (Name änderbar; E-Mail-Adresse vorerst nur
  angezeigt, Ändern folgt mit dem eigenen Mailversand), Passwort ändern (mit Prüfung des aktuellen
  Passworts), Tarif (aktueller Tarif mit Nutzung "X von 5 Objekten" / "X von 20 aktiven
  Interessenten" und "Größere Tarife sind in Vorbereitung."; bewusst kein Button "Tarife
  vergleichen"), Konto (Abmelden und Konto löschen, siehe
  Sicherheit und Datenschutz, Kontolöschung).
- Öffentliche Startseite `/` mit E-Mail-Liste (Double-Opt-in). Es wird nur die Bestätigungsmail
  verschickt; einen Newsletter-Versand gibt es noch nicht.
- Ressourcen (Runde 4, Schritt 2): Übersicht, Grunderwerbsteuer-Tabelle aller 16 Bundesländer und
  Glossar mit sieben Begriffen, öffentlich erreichbar. Tipps & Tricks: nur die Übersicht mit zwei
  als "in Vorbereitung" gekennzeichneten, nicht anklickbaren Platzhalter-Karten; noch keine Artikel.

Ausdrücklich NICHT im Umfang (nicht vorbauen): Mieterverwaltung, Mietverträge,
Nebenkostenabrechnung, Dokumentenablage, Abos und Zahlungen, mehrere Nutzer pro Konto, andere
Länder als Deutschland. Diese Funktionen sind Teil der Gesamtvision (siehe
docs/planung/funktionsplanung-immobilienverwaltung.md) und folgen dort in einer festgelegten
Reihenfolge — aber ausdrücklich nicht jetzt und nicht als Vorbereitung. Jede davon wird erst
gebaut, wenn sie explizit als eigener Auftrag kommt.

## Bekannte künftige Änderungen (noch nicht umsetzen)
- Öffentliche Startseite, Rechnerseiten, Ressourcen und Tipps & Tricks sind ohne Login erreichbar,
  aber bewusst noch auf noindex
  (Konstante `RECHNER_INDEXIERBAR = false` in src/lib/seo/rechner.ts; die deutschen Titel und
  Beschreibungen stehen dort schon bereit, auch für Startseite, Ressourcen und Tipps). Freigeschaltet wird erst nach fertigem Impressum
  (Meilenstein 5) und ausdrücklicher Freigabe, ebenso keine Bewerbung der Seiten vorher. Die
  Impressumspflicht entsteht schon durch die bloße Erreichbarkeit, nicht erst durch die
  Indexierung — vor jedem echten Livegang muss das Impressum stehen.
- Tarifwechsel, Bezahlung (Stripe) und Preisseite kommen erst mit eigenem Auftrag (die
  Einstellungen zeigen den Tarif nur an). Plus und Pro sind in der Konfiguration vorbereitet (Werte aus der
  Planung, noch unbestätigt), werden aber nicht vergeben.
- Fünfter Rechner geplant: Mieterhöhung (Kappungsgrenze 20 %/15 % in drei Jahren, Index-/
  Staffelregeln, Pflichthinweis "keine Rechtsberatung"). Noch nicht gebaut.
- Datenmodell-Erweiterungen, die später anstehen: Darlehen als eigene Tabelle statt Spalten an property (wegen künftiger
  Anschlussfinanzierung/mehrerer Darlehen); eine transaktionale Buchungstabelle für Einnahmen/
  Ausgaben (könnte running_cost_item später ergänzen oder ablösen). Keine dieser Änderungen jetzt
  vornehmen.
- Zahlenfelder zeigen und akzeptieren bisher einen Dezimalpunkt ("1.5"). Deutsche Eingabe mit
  Komma ("1,5") in allen Formularen wird in einem eigenen Schritt umgesetzt.

## Tarife und Grenzen
- Jedes Konto hat einen Tarif: Spalte `account.tarif` (kostenlos | plus | pro, Standard "kostenlos"
  für neue und bestehende Konten). Aktuell wird nur "kostenlos" vergeben. Nutzer können ihren Tarif
  nicht selbst ändern (account hat nur eine Lese-Policy); gesetzt wird er nur über die
  Datenbank-Verwaltung bzw. später über den Bezahlprozess.
- Grenzen je Tarif: kostenlos 5 Objekte im Bestand und 20 aktive Interessenten; plus 10 / 100; pro
  unbegrenzt. Aktive Interessenten = beobachtet, besichtigt, Angebot abgegeben; gekaufte und
  abgelehnte zählen nicht. Interessenten zählen nicht auf die Objektgrenze.
- Die Werte stehen an ZWEI Stellen und werden IMMER gemeinsam geändert:
  src/lib/constants/tarife.ts (Anzeige, Zähler, Buttons, Meldungen) und die Datenbankfunktion
  `tarif_grenze()` (verbindliche Prüfung). Änderung nur per neuer Migration mit einem markierten
  Block `-- TARIFE:BEGIN … -- TARIFE:END`; src/lib/tarife.test.ts liest den Block der neuesten
  Migration und schlägt fehl, wenn die Zahlen von tarife.ts abweichen.
- Durchgesetzt in der Datenbank (Trigger `property_tarif_grenze` und `prospect_tarif_grenze`, Fehlercodes
  TL001/TL002), nicht nur in der Oberfläche. Das gilt für jeden Weg: Assistent, direkter API-Aufruf,
  "In Bestand übernehmen" (legt eine Immobilie an) und "Wieder aufnehmen" (abgelehnt → aktiv).
  Wechsel zwischen aktiven Status, Ablehnen und Kaufen bleiben immer erlaubt. Gegen gleichzeitige
  Anlagen (zwei Tabs) sperrt ein Advisory Lock je Konto die Prüfung, sodass immer nur eine Anlage
  gleichzeitig zählt. Gezählt wird mit einer einfachen count-Abfrage über den Index auf account_id.
- In der Oberfläche: Bei erreichter Grenze sind "Immobilie hinzufügen", "Interessent hinzufügen",
  "In Bestand übernehmen" und "Wieder aufnehmen" deaktiviert, mit sichtbarer Meldung (sachlicher
  Hinweis, nicht in Fehlerfarbe); Direktaufrufe von /immobilien/neu und /kaufpruefung/neu zeigen die
  Meldung statt Assistent/Formular. Die Server Actions prüfen zusätzlich vorab und übersetzen eine
  Ablehnung der Datenbank in dieselbe Meldung. Meldungstext ehrlich, ohne Upgrade-Versprechen: "Du
  hast dein Limit von 5 Objekten im kostenlosen Tarif erreicht. Größere Tarife sind in Vorbereitung."
- Konten, die (z. B. nach einer späteren Senkung einer Grenze) schon über der Grenze liegen,
  behalten alle Daten und können sie weiter bearbeiten und löschen; nur Neuanlagen werden abgelehnt.
- Die öffentliche Startseite nennt bewusst keine Zahl ("Konto kostenlos."), solange die Grenzen
  laut Planung unbestätigt sind.

## Datenmodell (Grundsätze)
- Hierarchie: Nutzer → Konto (account) → Immobilie (property) → Einheit (unit).
- Jede Immobilie hat mindestens eine Einheit. Eigentumswohnung und Einfamilienhaus haben genau
  eine, nur beim Mehrfamilienhaus sieht der Nutzer die Einheitenliste.
- Alle Fachtabellen tragen eine account_id. Später hängen Abos und weitere Nutzer am Konto. Das Konto
  trägt den Tarif (`account.tarif`, siehe "Tarife und Grenzen").
  unit, running_cost_item und note verweisen zusätzlich über einen verbundenen Fremdschlüssel
  (property_id, account_id) auf property. Das verhindert auf Datenbankebene, dass ihre account_id
  von der der zugehörigen Immobilie abweicht — unabhängig vom Zugriffsweg, nicht nur über
  Zugriffsregeln (RLS) geprüft, die nur den Weg über die normale Anmeldung schützen.
- Ein Konto ohne Mitglieder wird automatisch mitgelöscht, inklusive aller Immobilien darin —
  verhindert verwaiste, für niemanden mehr erreichbare Daten (z. B. wenn der einzige Nutzer eines
  Kontos gelöscht wird).
- Kennzahlen (Rendite, Cashflow, Annuität, Leerstandsquote, Gesamtwert usw.) werden abgeleitet und
  nie gespeichert. Ausnahme: Kaufnebenkosten werden als fester Betrag gespeichert, nicht berechnet
  — sie sind eine historische Tatsache zum Kaufzeitpunkt und dürfen sich nicht rückwirkend ändern,
  wenn sich Steuersätze später ändern.
- Kaufprüfung: Interessenten liegen in einer eigenen Tabelle `prospect` (mit account_id und RLS wie
  alle Fachtabellen), nicht als Statusfeld an property. Bewusste Abweichung von der Planungsnotiz
  "Interessent und Bestand in einer Objektstruktur, Statuswechsel statt Kopie" (docs/planung/...):
  Bestand, Kennzahlen und alle bestehenden Abfragen bleiben unberührt, und eine grobe Einschätzung
  braucht keine Einheiten, laufenden Kosten oder Fotos. Ein Interessent hat Status (beobachtet,
  besichtigt, angebot_abgegeben, gekauft, abgelehnt), Gesamtfläche und erwartete Kaltmiete als je
  einen Wert, optional geplante Finanzierung, Inserats-Link (Datenbank erlaubt nur http/https) und
  eine Notiz. "In Bestand übernehmen" ist eine KOPIE: die Datenbankfunktion prospect_to_property()
  legt in einer Transaktion eine neue Immobilie samt Einheit an (Fläche und erwartete Miete in die
  Einheit, Status "leer"; beim Mehrfamilienhaus eine "Einheit 1" mit den Gesamtwerten), setzt den
  Interessenten auf "gekauft" und speichert den Verweis property_id. Sie funktioniert nur ab
  "besichtigt" und nur einmal je Interessent. Nicht übernommen werden Inserats-Link und Notiz. Wird
  die Immobilie gelöscht, bleibt der Interessent mit leerem Verweis; wird der Interessent gelöscht,
  bleibt die Immobilie. Ob später Darlehen/mehrere Szenarien dazukommen, ist offen.
- E-Mail-Liste: Tabelle `newsletter_subscriber` — bewusste Ausnahme von "alle Fachtabellen tragen
  eine account_id": Die Einträge gehören keinem Konto (Besucher ohne Konto tragen sich ein). RLS ist
  an, es gibt aber keine Policies und keine Tabellenrechte für anon und authenticated (belegt durch
  supabase/tests/database/80_newsletter.sql); nur der Server kommt über den Secret-Key-Client heran.
  Gespeichert werden Adresse (kleingeschrieben), Status (pending, confirmed, unsubscribed),
  Zeitstempel und consent_text_version; von den Links in der Mail nur ein SHA-256-Hash, nie der Code
  selbst. Bestätigungslinks gelten 48 Stunden und einmal; nie bestätigte, abgelaufene Einträge werden
  nach einer Woche gelöscht. Keine IP-Adressen.
- Mieter kommen später als eigene Tabellen an die Einheit, ohne bestehende Tabellen umzubauen.

## Fachliche Regeln und Rechner
- Rechner sind reine Funktionen in src/lib/calculators/ (ohne Oberfläche, ohne Datenbank) mit
  automatischen Tests. Als Testwerte dienen die Beispieldaten aus der Design-README.
- Steuersätze und Prozentwerte (Grunderwerbsteuer je Bundesland, Notar, Grundbuch, Makler) stehen in
  einer zentralen Konstantendatei mit Stand-Datum, nie in Komponenten
  (src/lib/constants/steuersaetze.ts). Die Grunderwerbsteuer (`GRUNDERWERBSTEUER_PROZENT`), ihr
  Stand (`GRUNDERWERBSTEUER_STAND`) und die Formatierung (`formatSteuersatz()`) sind EINE Quelle
  für Auswahlliste und Berechnung im Kaufnebenkosten-Rechner und die Tabelle unter
  /ressourcen/grunderwerbsteuer; bei einer Änderung der Sätze den Stand mitziehen.
  Bremen: 5,5 % (die README aus Runde 1 nennt noch 5,0 %). Vor der Veröffentlichung alle Sätze
  gegen eine amtliche Quelle prüfen.
- Formeln:
  - Jahreskaltmiete = Summe der Kaltmieten der vermieteten Einheiten × 12 (leere Einheiten zählen
    mit 0)
  - Bruttorendite = Jahreskaltmiete ÷ Kaufpreis
  - Nettorendite = (Jahreskaltmiete − laufende Kosten pro Jahr) ÷ Gesamtinvestition × 100
  - Kaufpreisfaktor = Kaufpreis ÷ Jahreskaltmiete
  - Eigenkapital = Gesamtinvestition − Darlehen (Darlehen ist die Eingabe/der gespeicherte Wert,
    Eigenkapital wird daraus abgeleitet, nie umgekehrt)
  - Beleihungsauslauf = Darlehen ÷ Kaufpreis × 100
  - Annuität pro Monat = Darlehen × (Zins % + Tilgung %) ÷ 12
  - Cashflow pro Monat = Kaltmiete − Annuität − laufende Kosten
  - Nur im eigenständigen Cashflow-Rechner (ohne Objektbezug): Kaltmiete nach Leerstand =
    Kaltmiete × (1 − Leerstand % ÷ 100), auf 0–100 % begrenzt. Diese geminderte Kaltmiete geht in die
    Cashflow-Formel ein (`kaltmieteNachLeerstand()` in src/lib/calculators/leerstand.ts, vor
    `cashflowMonat()` angewendet). Der objektgebundene Rechner hat kein Leerstand-Feld, er nutzt die
    echten Einheiten-Ist-Daten (leere Einheiten zählen mit 0).
  - Ø Rendite (Portfolio) = Summe der Jahresmieten ÷ Summe der Kaufpreise
  - Leerstandsquote = leere Einheiten ÷ Einheiten
  - Kaufnebenkosten = Kaufpreis × (Grunderwerbsteuer % + Notar % + Grundbuch % + Makler %)
  - Gesamtinvestition = Kaufpreis + Kaufnebenkosten
- Tilgungsplan (Rechner Finanzierung): wird MONATLICH gerechnet (banküblich), nicht jährlich wie im
  Prototyp. Das Startjahr kommt aus dem Datum, nicht fest verdrahtet. Ein automatischer Test
  vergleicht das Ergebnis mit einem nachvollziehbaren Referenzwert. Die Tabelle zeigt die intern
  monatlich berechneten Werte nach Kalenderjahr aggregiert an (siehe Design, "Weitere Fälle aus
  Meilenstein 4").
- Die Fußnote im Rechner Rendite lautet: "… ohne Berücksichtigung künftigen Leerstands" (statt
  "ohne Leerstand").
- Laufende Kosten sind eine Postenliste (running_cost_item) mit sechs festen Typen: Hausgeld (nicht
  umlagefähig), Instandhaltungsrücklage, Grundsteuer, Versicherung, Instandhaltung, Verwaltung und
  Sonstiges. Der Assistent fragt bei Eigentumswohnung die ersten vier ab, bei Einfamilienhaus und
  Mehrfamilienhaus Grundsteuer, Versicherung, Instandhaltung und Verwaltung und Sonstiges (der
  Prototyp-Wizard hat "Verwaltung und Sonstiges" gar nicht, obwohl die Beispieldaten den Posten
  zeigen — ergänzt für alle Objektarten).
- Geldbeträge in der Datenbank als numeric, nie als Fließkommazahl. In Berechnungen
  Rundungsfehler vermeiden (z. B. in Cent rechnen) und die Rundung zentral festlegen: die Funktion
  `rundeCent()` (src/lib/rundung.ts) übernimmt das für die in Meilenstein 4 entstandenen Rechner
  (kaufnebenkosten.ts, finanzierung.ts, leerstand.ts). Die älteren Funktionen aus Meilenstein 3
  (immobilie.ts, portfolio.ts) runden bewusst nicht zusätzlich zentral — sie wurden nicht
  rückwirkend angefasst, um bereits getesteten Code nicht zu riskieren.
- Wo Rechner Ergebnisse zeigen, steht der Hinweis "Keine Steuer- oder Anlageberatung".

## Sicherheit und Datenschutz
- Row Level Security auf allen Tabellen. Jede Regel wird mit Tests belegt: Nutzer A sieht nie Daten
  von Nutzer B.
- Geheimnisse (Schlüssel, Passwörter) nie in Code oder Git. .env.local steht in .gitignore. Den
  Service-Role- bzw. Secret-Key nie im Frontend verwenden.
- Eingaben immer serverseitig validieren (z. B. mit zod).
- Tarif-Grenzen sind nicht umgehbar: Sie werden per Trigger in der Datenbank geprüft (belegt durch
  supabase/tests/database/90_tarife.sql), die Prüfungen in Oberfläche und Server Actions sind nur
  zusätzlich. Nutzer können ihren Tarif nicht selbst ändern.
- Abmelden ("Abmelden" im Nutzermenü und in den Einstellungen) meldet nur dieses Gerät ab
  (`signOut({ scope: "local" })` in src/app/(app)/actions.ts); andere Geräte bleiben angemeldet. Alle
  anderen Geräte werden nur beim Ändern des Passworts abgemeldet (macht Supabase dort automatisch;
  die aktuelle Sitzung bleibt, die Erfolgsmeldung sagt das ausdrücklich).
- Passwort ändern: Supabase prüft das bisherige Passwort nicht selbst. Die Server Action prüft es
  vorher mit einem eigenen, zustandslosen Supabase-Client (keine Cookies, die Sitzung im Browser
  bleibt unberührt) und beendet die dabei entstehende Prüf-Sitzung sofort wieder, nur diese eine
  (scope "local"). Falsches Passwort: neutrale Meldung "Das aktuelle Passwort stimmt nicht."
- Secret-Key (Supabase): Der einzige Code, der ihn nutzt, ist src/lib/supabase/admin.ts
  (`createAdminClient()`, mit `import "server-only"`, damit er nie in den Browser-Code gelangt; Wert
  nur in .env.local bzw. Vercel als `SUPABASE_SECRET_KEY`, nie mit NEXT_PUBLIC_). Ausdrücklich
  freigegeben sind genau diese Nutzungen:
  1. E-Mail-Liste (Newsletter): die für alle normalen Rollen gesperrte Tabelle newsletter_subscriber.
  2. Kontolöschung (src/app/(app)/einstellungen/konto-actions.ts), und dort nur
     2a. `auth.admin.deleteUser` für den angemeldeten Nutzer selbst und
     2b. das Nachprüfen und Leeren genau des Storage-Ordners `{account_id}/` dieses Kontos. Die
         account_id wird vorher serverseitig gelesen und stammt nie aus einer Eingabe des Browsers.
  Jede weitere Funktion, die erweiterten Zugriff jenseits der normalen Zugriffsregeln bräuchte, ist
  eine eigene, bewusste Entscheidung und kein Fall für die Wiederverwendung dieses admin-Clients
  ohne Rücksprache.
- Kontolöschung (Einstellungen → Konto → "Konto löschen"), Ablauf in der Server Action
  `kontoLoeschen`: (1) Dialog mit Warnung (alle Immobilien, Einheiten, Kosten, Notizen,
  Interessenten und Fotos gehen dauerhaft verloren) und Hinweis, dass ein Eintrag in der E-Mail-Liste
  unberührt bleibt und separat über den Abmelde-Link entfernt wird; (2) Zod → getUser() → Prüfung des
  aktuellen Passworts mit dem zustandslosen Client (src/lib/supabase/passwort-pruefung.ts); falsches
  Passwort: nichts wird gelöscht; (3) nur wenn der Nutzer das letzte Mitglied des Kontos ist: Fotos
  ZUERST und streng — alle Dateien im Ordner `{account_id}/` auflisten (auch verwaiste und in
  Unterordnern, nicht nur property.foto_pfad), mit den normalen Rechten des Nutzers löschen und
  danach erneut auflisten; bleibt irgendetwas übrig oder meldet Supabase einen Fehler, wird der Nutzer
  NICHT gelöscht, sondern es erscheint eine Meldung zum erneuten Versuch (Supabase meldet keinen
  Fehler, wenn eine Zugriffsregel das Löschen einer Datei still verhindert — nur die Nachkontrolle
  erkennt das); (4) `auth.admin.deleteUser` (2a); die Datenbank-Kaskade entfernt Mitgliedschaft und
  Profil, beim letzten Mitglied löscht der Trigger delete_account_if_empty() das Konto samt aller
  Fachdaten; bei weiteren Mitgliedern bleiben Konto, Daten und Fotos für diese erhalten; (5) erneute
  Nachkontrolle des Ordners mit dem Admin-Client (2b) für eine Datei, die ein zweiter Browser in
  diesem Moment noch hochgeladen haben könnte; (6) eigene Sitzungs-Cookies entfernen und Weiterleitung
  auf /?konto=geloescht mit Bestätigung. Ein zweiter, gleichzeitig angemeldeter Browser landet beim
  nächsten Seitenaufruf auf /anmelden. Ohne `SUPABASE_SECRET_KEY` zeigen die Einstellungen statt des
  Buttons "Die Kontolöschung ist gerade nicht verfügbar." Belegt durch
  supabase/tests/database/45_nutzer_loeschen.sql, src/lib/konto/foto-ordner.test.ts und
  Ende-zu-Ende-Tests (lokal und im verbundenen Projekt).
- E-Mail-Liste: Double-Opt-in (Eintrag erst nach Klick auf den Link in der Bestätigungsmail;
  Bestätigen und Abmelden passieren per Knopfdruck auf der Link-Seite, nicht schon beim Öffnen,
  damit vorab abrufende Mailprogramme nichts auslösen). Schutz ohne Drittanbieter: unsichtbares
  Honigtopf-Feld, höchstens eine Mail pro Adresse in 10 Minuten, Obergrenze neuer
  Bestätigungsmails pro Stunde. Die Rückmeldung ist immer dieselbe, egal ob die Adresse neu, offen
  oder schon bestätigt ist — es lässt sich nicht herausfinden, wer eingetragen ist. Die Karte auf der
  Startseite erscheint nur, wenn `SUPABASE_SECRET_KEY`, `SMTP_HOST` und `MAIL_FROM` gesetzt sind
  (Vorlage in .env.example); vorher wird nichts gesammelt.
- Startseite: `/` steht als exakter Pfad in der Liste der öffentlichen Pfade in src/proxy.ts (nie
  per startsWith, sonst wäre jeder Pfad öffentlich), ebenso `/newsletter/bestaetigen`,
  `/newsletter/abmelden`, `/ressourcen`, `/ressourcen/grunderwerbsteuer`, `/ressourcen/glossar` und
  `/tipps` (künftige Artikelseiten unter /tipps/... sind damit nicht automatisch öffentlich und
  müssen einzeln freigegeben werden). Angemeldete Nutzer leitet der Proxy von `/` direkt zu /uebersicht.
- Öffentliche Rechnerseiten: src/proxy.ts gibt genau die fünf Rechner-Pfade als exakte Liste frei
  (kein startsWith, damit künftige Routen unter /rechner nicht automatisch öffentlich werden).
  ?immobilie=<id> wird nur bei angemeldetem Nutzer ausgewertet — zusätzlich zu den
  Zugriffsregeln (RLS, Rolle anon sieht keine Zeile; belegt durch supabase/tests/database/
  60_anon_zugriff.sql), damit anonyme Besucher nie eine fremde Immobilie sehen. Dasselbe gilt für
  ?interessent=<id> (Kaufprüfung, Tabelle prospect, Tests in 70_prospect.sql). Server Actions
  (Zod, getUser()) bleiben unverändert: ein anonymer Aufruf von kaufnebenkostenUebernehmen liefert
  "Bitte melde dich erneut an." und schreibt nichts.
- Daten nur in der EU-Region speichern. Keine Tracking-Dienste ohne Rücksprache.
- Im MVP keine personenbezogenen Daten Dritter (Mieter).

## Arbeitsweise
- Meilensteine, immer nur einer zugleich:
  1. Grundgerüst und Design-System
  2. Login und Datenbank mit Zugriffsregeln
  3. Immobilien (Formular, Übersicht, Detailseite)
  4. Rechner mit Tests
  5. Abschluss (Rechtstexte, Sicherheitsprüfung, Testnutzer)
- Nach jedem Meilenstein: App läuft, Tests sind grün, kurze Zusammenfassung in einfachem Deutsch,
  Commit mit verständlicher Nachricht und eine kurze Anleitung, wie der Auftraggeber das Ergebnis
  selbst ausprobiert.
- Nichts bauen, was nicht im Umfang steht. Ideen für später als Vorschlag notieren.
- Keine öffentliche Seite mit Blindtext: Keine öffentlich erreichbare Seite zeigt Lorem ipsum oder
  erfundenen Beispielinhalt. Vorlagen (z. B. die Artikel-Vorlage für Tipps & Tricks) bleiben
  Bausteine im Code ohne eigene Route; eine Seite entsteht erst mit echtem Inhalt. Sichtbar
  gekennzeichnete [Platzhalter] sind nur dort erlaubt, wo sie freigegeben sind, und stehen in der
  Liste unter "Vor der Veröffentlichung".

## Vor der Veröffentlichung (nicht vergessen)
- Vercel: Der Hobby-Tarif ist nur für nicht-kommerzielle Nutzung erlaubt. Vor dem Livegang mit
  Abos auf Pro wechseln.
- Impressum, Datenschutzerklärung und AGB. Auftragsverarbeitungsverträge mit Supabase und Vercel.
- Einmaliger Sicherheitsreview der Zugriffsregeln durch eine Fachperson.
- Steuersätze und Rechenformeln erneut prüfen.
- Kontolöschung (DSGVO-Pflicht, Recht auf Löschung): technisch gelöst (Funktion in den
  Einstellungen, siehe Sicherheit und Datenschutz). Noch offen: (a) Beschreibung in der
  Datenschutzerklärung (was gelöscht wird, dass ein Eintrag in der E-Mail-Liste separat bleibt,
  Backups/Aufbewahrung bei Supabase); (b) `SUPABASE_SECRET_KEY` auf Vercel eintragen, sonst ist die
  Funktion im Livebetrieb nicht verfügbar.
- Anmelde-Limit von Supabase prüfen und bei Bedarf erhöhen (Supabase-Dashboard, Authentication →
  Rate Limits, "sign-ins and sign-ups"; lokal 30 pro 5 Minuten und IP). Anmeldung und die Prüfung
  des aktuellen Passworts beim Passwortwechsel laufen über Server Actions, also vom Server aus;
  Supabase sieht dabei vermutlich die IP des Servers statt die der Nutzer, sodass sich alle Nutzer
  ein Kontingent teilen. Vor dem Livegang unter echter Last prüfen.
- Startseite: alle mit [Platzhalter] markierten Texte in src/lib/start/inhalte.ts ersetzen
  (Datensicherheit, Kontaktadresse). Außerdem alle Platzhalter-Links (bisher `#impressum`,
  `#datenschutz`, `#agb`) durch echte Seiten ersetzen: Fußzeile der Startseite (src/app/page.tsx),
  der Rechnerseiten, Newsletter-Seiten, Ressourcen und Tipps & Tricks
  (src/components/shell/public-shell.tsx) und der
  Anmelde-/Registrierungsseiten (src/app/(auth)/layout.tsx); der Datenschutz-Link in der Karte der
  E-Mail-Liste (src/components/start/newsletter-karte.tsx); bei der Registrierung die Links "AGB" und
  "Datenschutzerklärung" im Hinweistext unter dem Formular (src/app/(auth)/registrieren/
  sign-up-form.tsx; eine AGB-Checkbox gibt es bewusst nicht).
- Tipps & Tricks: /tipps zeigt sichtbare [Platzhalter]-Karten. Vor dem Livegang entweder echte
  Artikel veröffentlichen oder "Tipps & Tricks" aus der öffentlichen Navigation nehmen
  (src/components/shell/public-header.tsx).
- E-Mail-Liste einschalten erst, wenn die Datenschutzerklärung die Adress-Erhebung beschreibt:
  dann `SUPABASE_SECRET_KEY` und Mailversand (Anbieter mit eigener Domain, `SMTP_*`, `MAIL_FROM`)
  in .env.local und Vercel eintragen. Einwilligungstexte je Version im Repository ablegen (z. B.
  docs/einwilligung/v1.md mit dem genauen Hinweistext unter dem Feld und dem Stand der
  Datenschutzerklärung), damit sich zu jedem Eintrag nachweisen lässt, welchem Text zugestimmt
  wurde (Spalte consent_text_version). Bei jeder Textänderung eine neue Datei anlegen und die
  Konstante `EINWILLIGUNG_TEXT_VERSION` in src/lib/newsletter/regeln.ts hochzählen; alte Versionen
  nie überschreiben.
- Eigenen Mailversand (SMTP) für Supabase Auth einrichten (z. B. über Resend, Postmark oder
  SendGrid) und im Supabase-Dashboard unter Authentication > SMTP Settings eintragen. Der
  eingebaute Mailversand ist auf wenige E-Mails pro Stunde begrenzt und nur für die Entwicklung
  gedacht, nicht für den echten Betrieb.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
