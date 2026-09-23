# Projekt: Immobilienverwaltung

Web-App zur Verwaltung und Bewertung von Immobilien für Privatvermieter und Kapitalanleger in
Deutschland. Aktueller Stand: Basisvariante (MVP). Später Ausbau um Abomodelle, Mieterverwaltung,
Dokumente und weitere Rechner.

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
- Routen auf Deutsch: /anmelden, /registrieren, /passwort-vergessen, /email-bestaetigen,
  /passwort-zuruecksetzen, /uebersicht, /immobilien/neu, /immobilien/[id], /rechner,
  /rechner/kaufnebenkosten, /rechner/rendite, /rechner/finanzierung, /rechner/cashflow,
  /einstellungen
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

## Design
- Quelle: docs/design/. Die neueste Runde (aktuell runde-2) gilt bei Widersprüchen. Was in der
  neuesten README fehlt (Komponenten-Zuordnung zu shadcn/ui, Tailwind-Mapping, Routen, Fokus-Stil),
  gilt aus runde-1 weiter.
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
  Detailseite zeigt ab Meilenstein 3 alle vier Rechner-Karten, aber nur Kaufnebenkosten ist
  verlinkt; Rendite, Finanzierung und Cashflow sind als "kommt noch" markiert, bis sie in
  Meilenstein 4 entstehen.
- Weitere Fälle aus Meilenstein 4: Der Kaufnebenkosten-Rechner kann das Ergebnis bei Objektbezug
  (?immobilie=<id>) per "Übernehmen"-Button als kaufnebenkosten_betrag am Objekt speichern (im
  Prototyp die "Zuordnen"-Box) — ohne Objektbezug zeigt er nur das Ergebnis. Die
  Tilgungsplan-Tabelle im Finanzierungs-Rechner gruppiert nach echten Kalenderjahren statt nach
  Darlehensjahren; ein Start- oder Endjahr mit weniger als 12 Monaten wird mit der Monatsanzahl
  gekennzeichnet (z. B. "2026 (7 Monate)"). Ohne Kaufdatum am Objekt gilt das heutige Datum als
  Start; der eigenständige Rechner hat dafür ein eigenes "Startdatum"-Feld (Default heute). Die
  Zeile "Davon Tilgung" im Cashflow-Rechner erscheint nur bei Objektbezug, weil sie Darlehen und
  Zins getrennt von der eingegebenen Rate kennen muss. Brutto- und Nettorendite werden im
  Rendite-Rechner beide neutral dargestellt (der Prototyp hebt die Bruttorendite farbig hervor) —
  konsistent mit dem übrigen, durchgehend neutralen Kennzahlen-Stil der App.
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

## Umfang der Basisvariante
Im Umfang:
- Registrierung und Login
- Übersicht mit Kennzahlen
- Immobilie anlegen, bearbeiten, löschen
- Detailseite mit Tabs: Übersicht, Einheiten, Kauf und Finanzierung, Einnahmen und Ausgaben,
  Rechner, Notizen
- Rechner: Kaufnebenkosten, Rendite, Finanzierung mit Tilgungsplan, Cashflow
- Objektfotos: Der Foto-Bereich wird im Layout gebaut (Objektkarte 132px hoch, Detailseite
  280×188px, Assistent 220×148px), zeigt aber zunächst nur einen ruhigen Platzhalter (Icon auf
  heller Fläche, ohne Drag-and-drop-Text). Der echte Upload kommt als eigener Schritt nach
  Meilenstein 3 und wird vorher mit dem Auftraggeber geklärt (Dateispeicher mit Zugriffsregeln,
  Größen- und Formatlimits, Zuschnitt).
- Einstellungen: Profil, Passwort ändern, Tarif (Platzhalter), Konto (Abmelden).

Ausdrücklich NICHT im Umfang (nicht vorbauen): Mieterverwaltung, Mietverträge,
Nebenkostenabrechnung, Dokumentenablage, Abos und Zahlungen, mehrere Nutzer pro Konto, andere
Länder als Deutschland.

## Datenmodell (Grundsätze)
- Hierarchie: Nutzer → Konto (account) → Immobilie (property) → Einheit (unit).
- Jede Immobilie hat mindestens eine Einheit. Eigentumswohnung und Einfamilienhaus haben genau
  eine, nur beim Mehrfamilienhaus sieht der Nutzer die Einheitenliste.
- Alle Fachtabellen tragen eine account_id. Später hängen Abos und weitere Nutzer am Konto.
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
- Mieter kommen später als eigene Tabellen an die Einheit, ohne bestehende Tabellen umzubauen.

## Fachliche Regeln und Rechner
- Rechner sind reine Funktionen in src/lib/calculators/ (ohne Oberfläche, ohne Datenbank) mit
  automatischen Tests. Als Testwerte dienen die Beispieldaten aus der Design-README.
- Steuersätze und Prozentwerte (Grunderwerbsteuer je Bundesland, Notar, Grundbuch, Makler) stehen in
  einer zentralen Konstantendatei mit Stand-Datum, nie in Komponenten.
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
  Rundungsfehler vermeiden (z. B. in Cent rechnen) und die Rundung zentral festlegen.
- Wo Rechner Ergebnisse zeigen, steht der Hinweis "Keine Steuer- oder Anlageberatung".

## Sicherheit und Datenschutz
- Row Level Security auf allen Tabellen. Jede Regel wird mit Tests belegt: Nutzer A sieht nie Daten
  von Nutzer B.
- Geheimnisse (Schlüssel, Passwörter) nie in Code oder Git. .env.local steht in .gitignore. Den
  Service-Role- bzw. Secret-Key nie im Frontend verwenden.
- Eingaben immer serverseitig validieren (z. B. mit zod).
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

## Vor der Veröffentlichung (nicht vergessen)
- Vercel: Der Hobby-Tarif ist nur für nicht-kommerzielle Nutzung erlaubt. Vor dem Livegang mit
  Abos auf Pro wechseln.
- Impressum, Datenschutzerklärung und AGB. Auftragsverarbeitungsverträge mit Supabase und Vercel.
- Einmaliger Sicherheitsreview der Zugriffsregeln durch eine Fachperson.
- Steuersätze und Rechenformeln erneut prüfen.
- Eigenen Mailversand (SMTP) für Supabase Auth einrichten (z. B. über Resend, Postmark oder
  SendGrid) und im Supabase-Dashboard unter Authentication > SMTP Settings eintragen. Der
  eingebaute Mailversand ist auf wenige E-Mails pro Stunde begrenzt und nur für die Entwicklung
  gedacht, nicht für den echten Betrieb.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
