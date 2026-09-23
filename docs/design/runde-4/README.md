# Handoff: Immobilienverwaltung — Öffentliche Startseite (Runde 4, Schritt 1)

## Overview
Die Startseite (`/`) für **nicht angemeldete Besucher**. Sie erklärt das Produkt, führt
in die vier kostenlosen Rechner und zur Registrierung und sammelt E-Mail-Adressen für
eine Neuigkeiten-Liste. Angemeldete Nutzer werden weiterhin direkt auf `/uebersicht`
geleitet — daran ändert sich nichts.

Dieses Paket ergänzt das bestehende Handoff `design_handoff_immobilienverwaltung`
(App, Rechner, Einstellungen, Auth). Tokens, Rechenregeln und Komponenten sind dort
beschrieben und gelten hier unverändert. Folgende Seiten sind geplant, aber **noch nicht
Teil dieses Pakets**: Ressourcen-Übersicht, Grunderwerbsteuer-Tabelle, Glossar,
Tipps & Tricks (Übersicht und Artikel-Vorlage).

## About the Design Files
Die Dateien sind **Design-Referenzen in HTML** — Prototypen für Aussehen und Verhalten,
**kein Produktionscode**. Die Aufgabe ist, sie im Zielcodebase mit dessen Mustern und
Bibliotheken nachzubauen. Die Startseite gehört zur selben Anwendung wie die App und
sollte deren Komponenten (Button, Input, Karte, Fußzeile) wiederverwenden.

## Fidelity
**High-fidelity.** Farben, Typografie, Abstände, Zustände und Texte sind final.
Ausnahmen sind im Text als **[Platzhalter]** markiert.

## Design-Sprache (unverändert aus Runde 1–3)
- Weißer Grund, 1-px-Linien `rgba(32,30,29,0.15)` (`--color-divider`), kein Schatten.
- Petrol `#14756b` nur für primäre Aktionen, Links und die eine Hauptzahl.
- Schrift **Archivo**, Überschriften Semibold (600). Karten `border-radius: 10px`,
  Buttons und Inputs eckig.
- Tabellarische Ziffern (`font-variant-numeric: tabular-nums`), deutsches Zahlenformat,
  Ansprache „Du".
- **Eine bewusste Abweichung:** Die Hero-Überschrift ist größer als H1 in der App
  (`clamp(30px, 3.4cqi, 42px)`, `line-height: 1.08`, `letter-spacing: -0.02em`).
  Alle anderen H1 bleiben 25 px; Abschnittsüberschriften (H2) 21 px.

## Layout
- Inhaltsbreite `max-width: 1120px`, Seitenrand 24 px (Desktop) / 16 px (Mobil).
- Abschnitte: `padding-block: 64px` (Mobil 44 px), getrennt durch eine 1-px-Linie oben.
- Breakpoints (Container-Queries auf dem Seiten-Root):
  - **≤ 1000 px:** Rechner-Kacheln und Schritte zweispaltig.
  - **≤ 760 px:** Mobil-Navigation, alle Raster einspaltig, Hero-Überschrift 30 px,
    E-Mail-Formular gestapelt.

## Bereiche (von oben nach unten)

### 1. Navigation (sticky)
Höhe 60 px, weißer Grund, 1-px-Linie unten.
- **Desktop:** Logo links („**Immobilien**verwaltung", 16 px, erster Teil 600, zweiter 400).
  Rechts, `gap: 24px`: Rechner · Tipps & Tricks · Ressourcen (14 px, Tinte, ohne
  Unterstreichung) · senkrechte Trennlinie 1 × 20 px · **Anmelden** (Link) ·
  **Registrieren** (Primärbutton, Petrol).
- **Mobil (≤ 760 px):** Logo, rechts kleiner Primärbutton „Registrieren" (40 px hoch)
  und Menü-Button 44 × 44 px (1-px-Rahmen, Burger-Icon ↔ X). Das Menü klappt
  unter der Leiste auf: Rechner, Tipps & Tricks, Ressourcen, Anmelden als 48 px hohe
  Zeilen mit Trennlinien.

### 2. Hero
Zweispaltig `1.15fr / 0.85fr`, `gap: 56px`, vertikal zentriert; mobil gestapelt.
- **Links:** Kicker „FÜR PRIVATE VERMIETER" (11 px, versal, `letter-spacing: 0.1em`,
  `--color-neutral-700`); Überschrift „Rechne deine Immobilie durch, bevor du
  unterschreibst." (`text-wrap: balance`); Subtext 17 px / 1,55, `max-width: 520px`.
  Aktionen, `gap: 12px`, `white-space: nowrap`:
  **Rechner kostenlos nutzen** (Primär, mit Pfeil-Icon → `/rechner`) und
  **Kostenlos registrieren** (Sekundär → Registrierung). Darunter 12 px:
  „Rechner ohne Konto. Konto kostenlos für bis zu 5 Immobilien."
- **Rechts:** Beispielrechnung als Karte (1 px Rahmen, 10 px Radius, 24 px Innenabstand).
  Kopfzeile „BEISPIELRECHNUNG" / „RECHNER 01". Zeilen: Kaufpreis 189.000 € · Bundesland
  Bayern · Grunderwerbsteuer 3,5 % 6.615 € · Notar und Grundbuch 2,0 % 3.780 € ·
  Makler 3,57 % 6.747 €. Summe **Kaufnebenkosten 17.142 €** (30 px, Petrol) mit
  „9,07 % des Kaufpreises". Die Werte folgen den Rechenregeln aus dem App-Handoff und
  können aus dem bestehenden Rechner-Code erzeugt werden.

### 3. Rechner-Kacheln (`#rechner`)
H2 „Vier Rechner, ohne Anmeldung" + Satz darunter. Vier Karten (`repeat(4, 1fr)`,
`gap: 16px`), ganze Karte ist ein Link. Je Karte: Nummer 01–04 (12 px), Titel
(17 px / 600), Beschreibung (13 px, `flex: 1`), unten „Rechner öffnen →" (13 px / 600,
Tinte). Hover: Rahmen `--color-neutral-500`.
Ziele: `/rechner/kaufnebenkosten`, `/rechner/rendite`, `/rechner/finanzierung`,
`/rechner/cashflow` (im Prototyp als `#`-Anker).

### 4. So funktioniert's
H2 + Satz. Vier Schritte als `<ol>` im gleichen Raster, `gap: 24px`. Je Schritt eine
1-px-Linie in **Tinte** oben (bewusst kräftiger als die Trennlinien), Nummer 13 px,
Titel 17 px / 600, Text 13 px:
1. Rechnen · 2. Konto anlegen · 3. Immobilie erfassen · 4. Überblick behalten.

### 5. Häufige Fragen
Zweispaltig `1fr / 2fr`: links H2 und Kontakt-Satz, rechts die Liste. Je Frage ein
Button über die volle Breite (min. 56 px hoch, Frage 15 px / 600, rechts Plus/Minus-Icon,
`aria-expanded`). Antwort 14 px / 1,6, `max-width: 640px`. **Immer nur eine offen**;
die erste ist beim Laden geöffnet, erneuter Klick schließt sie.
Die Antwort zu „Werden meine Daten sicher gespeichert?" ist **[Platzhalter]** — die
übrigen Antworten entsprechen dem Stand der App (Tarif, CSV-Export, Kontolöschung,
Rechengenauigkeit) und müssen bei Änderungen dort mitgezogen werden.

### 6. E-Mail-Liste
Eigene Karte (1 px Rahmen, 10 px Radius, 24 px Innenabstand), zweispaltig; bewusst
**getrennt von der Registrierung** — Button sekundär, Text „Das ist kein Konto".
- Feld „E-Mail-Adresse" + Button „Auf dem Laufenden bleiben" nebeneinander
  (mobil gestapelt, Button volle Breite). Darunter Hinweis zur Abmeldung mit Link
  zur Datenschutzerklärung.
- **Fehler:** ungültige Adresse → Rahmen `--color-error` und
  „Bitte gib eine gültige E-Mail-Adresse ein." Der Fehler verschwindet bei der
  nächsten Eingabe.
- **Erfolg:** Formular wird ersetzt durch Häkchen, „Fast geschafft" und
  „Bitte bestätige deine Adresse über den Link, den wir an … geschickt haben."
  → **Double-Opt-in** vorsehen.

### 7. Fußzeile
1-px-Linie oben, zentriert, 12 px, `--color-neutral-700`: Impressum · Datenschutz —
identisch mit der Fußzeile der Rechnerseiten.

## Navigation für angemeldete Nutzer — Empfehlung
Tipps & Tricks und Ressourcen **nicht** in die Hauptnavigation der App aufnehmen.
Die App-Navigation ist aufgabenorientiert (Übersicht, Rechner, Einstellungen), und die
mobile Leiste unten funktioniert mit drei Plätzen gut.
- **Ressourcen im Kontext:** kleiner „?"-Link neben Fachbegriffen (z. B. Kaufpreisfaktor,
  Beleihungsauslauf) ins Glossar; im Kaufnebenkosten-Rechner ein Link zur
  Grunderwerbsteuer-Tabelle.
- **Tipps & Tricks:** über Fußzeile und Nutzermenü erreichbar.

## State Management
- `menuOffen` (Mobil-Menü)
- `faqOffen` — Index der offenen Frage oder keine
- `mail`, `mailStatus` — `leer | fehler | ok`
- Validierung im Prototyp: `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$` — im Produkt die übliche
  Validierung des Codebases verwenden; der Versand erfolgt serverseitig mit Bestätigungsmail.

## Files
- `Website.dc.html` — die Startseite als responsive Komponente (Desktop und Mobil in einer Datei)
- `Runde 4.dc.html` — Übersicht, die die Startseite nebeneinander in 1280 px, 390 px und
  390 px mit offenem Menü zeigt
- `support.js` — Laufzeit zum Öffnen der Dateien im Browser
- `_ds/modernist-…/` — das gebundene Design-System
- `screenshots/` — `01–05-desktop.png` (Hero, Rechner, Schritte/FAQ, E-Mail-Liste,
  Fußzeile) und `06–10-mobil.png` (Hero, Menü offen, Rechner, FAQ, E-Mail-Liste).
  Die Desktop-Aufnahmen sind bei ca. 900 px Breite entstanden, deshalb stehen die
  Rechner-Kacheln dort zweispaltig; ab 1000 px sind es vier in einer Reihe
  (siehe `Runde 4.dc.html`).
