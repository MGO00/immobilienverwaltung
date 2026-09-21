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
- Routen auf Deutsch: /anmelden, /uebersicht, /immobilien/neu, /immobilien/[id], /rechner,
  /rechner/kaufnebenkosten, /einstellungen
- Datenbankänderungen nur als Migrationsdateien im Repository (supabase/migrations), nie per Hand
  im Dashboard
- Befehle zum Starten, Bauen und Prüfen (im Projektordner ausführen):
  - `npm run dev` — startet die App lokal zur Entwicklung unter http://localhost:3000
  - `npm run build` — erstellt den Produktions-Build (muss vor jedem Livegang fehlerfrei laufen)
  - `npm run start` — startet den zuvor erstellten Produktions-Build lokal
  - `npm run lint` — prüft den Code automatisch auf Fehler und Stilprobleme (ESLint)
  - Automatische Tests für die Rechner (`npm test` o. ä.) werden in Meilenstein 4 ergänzt, sobald
    die ersten Rechner entstehen.

## Design
- Verbindliche Quelle: docs/design/ (jeweils der neueste Ordner "runde-N" mit README.md,
  styles.css, Prototyp und Screenshots). Die Dateien sind Referenz, kein Produktionscode:
  nachbauen, nicht kopieren. Die Prototyp-Leiste (schwarzer Balken oben) gehört nicht zum Produkt.
- Tokens, Komponenten und Abstände exakt aus der README übernehmen (Petrol-Akzent #14756b, Schrift
  Archivo, Radius 0, 1px-Linien, keine Schatten außer am Nutzermenü).
- Zahlen mit tabellarischen Ziffern. Ansprache "Du". Deutsche Formate: 1.234,56 €, TT.MM.JJJJ,
  58 m², Minuszeichen "−". Negative Werte nicht rot.
- Screens, die noch nicht designt sind, nicht frei erfinden: vorhandene Muster nutzen, die
  einfachere Lösung wählen und die Abweichung melden.
- Barrierefreiheit: Fokusring 2px #14756b, Kontrast mindestens 4,5:1, Fehler nie nur über Farbe.

## Umfang der Basisvariante
Im Umfang:
- Registrierung und Login
- Übersicht mit Kennzahlen
- Immobilie anlegen, bearbeiten, löschen
- Detailseite mit Tabs: Übersicht, Einheiten, Kauf und Finanzierung, Einnahmen und Ausgaben,
  Rechner, Notizen
- Rechner: Kaufnebenkosten, Rendite, Finanzierung mit Tilgungsplan, Cashflow

Ausdrücklich NICHT im Umfang (nicht vorbauen): Mieterverwaltung, Mietverträge,
Nebenkostenabrechnung, Dokumentenablage, Abos und Zahlungen, mehrere Nutzer pro Konto, andere
Länder als Deutschland.

## Datenmodell (Grundsätze)
- Hierarchie: Nutzer → Konto (account) → Immobilie (property) → Einheit (unit).
- Jede Immobilie hat mindestens eine Einheit. Eigentumswohnung und Einfamilienhaus haben genau
  eine, nur beim Mehrfamilienhaus sieht der Nutzer die Einheitenliste.
- Alle Fachtabellen tragen eine account_id. Später hängen Abos und weitere Nutzer am Konto.
- Kennzahlen (Rendite, Cashflow, Annuität, Leerstandsquote, Gesamtwert usw.) werden abgeleitet und
  nie gespeichert.
- Mieter kommen später als eigene Tabellen an die Einheit, ohne bestehende Tabellen umzubauen.

## Fachliche Regeln und Rechner
- Rechner sind reine Funktionen in src/lib/calculators/ (ohne Oberfläche, ohne Datenbank) mit
  automatischen Tests. Als Testwerte dienen die Beispieldaten aus der Design-README.
- Steuersätze und Prozentwerte (Grunderwerbsteuer je Bundesland, Notar, Grundbuch, Makler) stehen in
  einer zentralen Konstantendatei mit Stand-Datum, nie in Komponenten.
  Bremen: 5,5 % (die README aus Runde 1 nennt noch 5,0 %). Vor der Veröffentlichung alle Sätze
  gegen eine amtliche Quelle prüfen.
- Formeln:
  - Jahreskaltmiete = Kaltmiete × 12
  - Bruttorendite = Jahreskaltmiete ÷ Kaufpreis
  - Kaufpreisfaktor = Kaufpreis ÷ Jahreskaltmiete
  - Annuität pro Monat = Darlehen × (Zins % + Tilgung %) ÷ 12
  - Cashflow pro Monat = Kaltmiete − Annuität − laufende Kosten
  - Ø Rendite (Portfolio) = Summe der Jahresmieten ÷ Summe der Kaufpreise
  - Leerstandsquote = leere Einheiten ÷ Einheiten
  - Kaufnebenkosten = Kaufpreis × (Grunderwerbsteuer % + Notar % + Grundbuch % + Makler %)
  - Gesamtinvestition = Kaufpreis + Kaufnebenkosten
  - Nettorendite: Definition wird beim Rechner "Rendite" gemeinsam festgelegt
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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
