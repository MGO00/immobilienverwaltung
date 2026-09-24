# Handoff: Immobilienverwaltung — Runde 4, Schritt 2: Ressourcen, Glossar, Tipps & Tricks

## Overview
Dieses Paket ergänzt die öffentliche Website um die Bereiche, die in Schritt 1 (Startseite,
Paket `design_handoff_website`) bewusst ausgeklammert wurden:

- `/ressourcen` — Übersicht
- `/ressourcen/grunderwerbsteuer` — Tabelle aller 16 Bundesländer
- `/ressourcen/glossar` — Begriffserklärungen
- `/tipps` — Artikelübersicht (nur Platzhalter)
- `/tipps/<slug>` — Artikel-Vorlage (nur Platzhalter)

Außerdem bekommt die öffentliche Navigation die zwei Punkte **Tipps & Tricks** und
**Ressourcen**: Rechner · Tipps & Tricks · Ressourcen · Anmelden · Registrieren.

## About the Design Files
Die Dateien sind **Design-Referenzen in HTML**, Prototypen für Aussehen und Verhalten,
**kein Produktionscode**. Setze sie im bestehenden Codebase um (`src/app/…`,
`src/components/start/`) und verwende dessen Komponenten für Navigation, Fußzeile, Karten
und Buttons weiter. Alle Seiten liegen im Prototyp in **einer** Datei (`Website.dc.html`) und
werden über den Zustand `seite` umgeschaltet. Im Produkt ist das normales Routing.

## Fidelity
**High-fidelity.** Farben, Typografie, Abstände und Texte sind final. Ausnahmen sind im Text
als **[Platzhalter]** markiert. Das betrifft den kompletten Inhalt von Tipps & Tricks.

## Verbindliche Inhalte — nicht umformulieren
- **Grunderwerbsteuersätze** (Stand September 2026), fachlich geprüft.
- **Glossar-Erklärungen**, fachlich geprüft. Zwei Einträge sind im Entwurf in zwei Sätze
  geteilt, der Inhalt ist unverändert:
  Kaufpreisfaktor („… Jahreskaltmiete. Er zeigt, …“) und Tilgung („… verringert. Der Rest ist Zins.“).
- **Tipps & Tricks:** ausschließlich die zwei Platzhalter-Titel. Keine Teaser, Lesedauern,
  Daten oder Texte ergänzen. Die kommen später gemeinsam mit dem Auftraggeber.

## Design-Sprache (unverändert)
Weißer Grund · 1-px-Linien `rgba(32,30,29,0.15)` · Petrol `#14756b` nur für Primäraktion und
Links · Archivo, Überschriften 600, **H1 25 px** · H2 19–21 px · Karten `border-radius: 10px`,
Buttons und Inputs eckig · Schatten nur für Popover/Dialog · tabellarische Ziffern ·
Status-Pillen `border-radius: 999px`.

Layout wie auf der Startseite: `max-width: 1120px`, Seitenrand 24 px / 16 px mobil,
Container-Query-Breakpoint **≤ 760 px** für Mobil (Burger-Menü, alle Raster einspaltig).

## Navigation
- Neue Punkte: **Tipps & Tricks** → `/tipps`, **Ressourcen** → `/ressourcen`.
- **Aktiver Bereich:** Der Menüpunkt wird unterstrichen (`text-decoration: underline`,
  1 px, `text-underline-offset: 6px`) und bekommt `aria-current="page"`.
  „Ressourcen“ ist aktiv auf allen drei Ressourcen-Seiten, „Tipps & Tricks“ auf Übersicht
  und Artikel.
- Mobil erscheinen beide Punkte im aufklappbaren Menü, zwischen Rechner und Anmelden.
  Ein Klick schließt das Menü.
- **Zurück-Links** oben auf jeder Unterseite: 12 px, versal, `letter-spacing: 0.06em`,
  600, Tinte, Pfeil-Icon links („← Ressourcen“ bzw. „← Tipps & Tricks“).

## Screens

### 1. Ressourcen — Übersicht (`/ressourcen`)
- H1 „Ressourcen“, darunter 14 px `--color-neutral-700`, `max-width: 620px`:
  „Zum Nachschlagen statt zum Rechnen: Steuersätze und Begriffe rund um den
  Immobilienkauf. Die Rechner arbeiten mit deinen eigenen Zahlen, hier findest du die
  Grundlagen dazu.“
- Zwei Karten, `repeat(2, 1fr)`, `gap: 16px`, mobil untereinander. Die ganze Karte ist ein Link.
  Karte: 1 px Rahmen, 10 px Radius, 24 px Innenabstand. Hover: Rahmen `--color-neutral-500`.
  - Kopfzeile: Meta links (12 px, z. B. „Tabelle · 16 Bundesländer“ / „Glossar · 7 Begriffe“),
    rechts Pille **„Bereit“** (`.tag-neutral`, 999 px).
  - Titel 19 px / 600, Beschreibung 14 px, `max-width: 440px`.
  - Unten „Tabelle öffnen →“ bzw. „Glossar öffnen →“ (13 px / 600, Tinte).
  - Die Zählwerte in der Meta-Zeile sollten aus den Daten kommen.

### 2. Grunderwerbsteuer (`/ressourcen/grunderwerbsteuer`)
- Zweispaltig wie die FAQ der Startseite (`1fr / 2fr`, `gap: 56px`), mobil gestapelt.
- **Links:** H1 „Grunderwerbsteuer nach Bundesland“ und Einleitung
  (14 px / 1,6, `--color-neutral-800`):
  „Die Grunderwerbsteuer zahlst du einmalig, wenn du ein Grundstück oder eine Immobilie
  kaufst. Berechnet wird sie auf den Kaufpreis im notariellen Kaufvertrag. Den Steuersatz
  legt jedes Bundesland selbst fest, deshalb hängt die Höhe davon ab, wo die Immobilie liegt.“
- **Rechts:** `.table`, zwei Spalten, **Bundesland** (links) · **Steuersatz** (rechts,
  600, `nowrap`), alphabetisch:

  | Bundesland | Satz |
  | --- | --- |
  | Baden-Württemberg | 5,0 % |
  | Bayern | 3,5 % |
  | Berlin | 6,0 % |
  | Brandenburg | 6,5 % |
  | Bremen | 5,5 % |
  | Hamburg | 5,5 % |
  | Hessen | 6,0 % |
  | Mecklenburg-Vorpommern | 6,0 % |
  | Niedersachsen | 5,0 % |
  | Nordrhein-Westfalen | 6,5 % |
  | Rheinland-Pfalz | 5,0 % |
  | Saarland | 6,5 % |
  | Sachsen | 5,5 % |
  | Sachsen-Anhalt | 5,0 % |
  | Schleswig-Holstein | 6,5 % |
  | Thüringen | 5,0 % |

  Darunter 12 px `--color-neutral-700`: „Stand: September 2026, Angaben ohne Gewähr“.
- Nach einer 1-px-Linie folgt der Primärbutton **„Jetzt deine Kaufnebenkosten berechnen →“**
  zu `/rechner/kaufnebenkosten`.
- **Datenquelle:** Die Tabelle, die Auswahlliste im Kaufnebenkosten-Rechner und dessen
  Berechnung müssen aus **derselben** Konstante kommen. Im App-Prototyp stand bei Bremen
  in der Auswahlliste noch 5,0 %, gerechnet wurde aber mit 5,5 %. Das ist dort korrigiert.

### 3. Glossar (`/ressourcen/glossar`)
- H1 „Glossar“, Satz „Die Begriffe aus den Rechnern, alphabetisch und kurz erklärt.“
- Liste mit `max-width: 820px`, oben eine 1-px-Linie. **Gruppiert nach Anfangsbuchstaben**,
  jede Gruppe ist eine Zeile mit `grid-template-columns: 56px 1fr` (mobil `32px 1fr`),
  `padding: 24px 0` und einer 1-px-Linie unten.
  - Linke Spalte: Buchstabe 21 px / 600, `--color-neutral-700`.
  - Rechte Spalte: `<dl>`. Je Eintrag `<dt>` Begriff 16 px / 600, `<dd>` Erklärung
    14 px / 1,6, `max-width: 600px`, darunter ein Link in Petrol, 13 px:
    „Zum Rechner 0X · Name →“. Abstand zwischen Einträgen einer Gruppe 20 px.
- Jeder Eintrag hat eine **Anker-ID** (`#glossar-kaufpreisfaktor` usw.), damit die App
  später „?“-Links direkt auf den Begriff setzen kann.
- Einträge und Rechner-Zuordnung:

  | Begriff | Erklärung | Link |
  | --- | --- | --- |
  | Beleihungsauslauf | Anteil des Kaufpreises, der über ein Darlehen finanziert wird. | Rechner 03 · Finanzierung |
  | Bruttorendite | Jahreskaltmiete geteilt durch den Kaufpreis, ohne Kosten abzuziehen. | Rechner 02 · Rendite |
  | Kaufpreisfaktor | Kaufpreis geteilt durch die Jahreskaltmiete. Er zeigt, wie viele Jahresmieten der Kaufpreis entspricht. | Rechner 02 · Rendite |
  | Nettorendite | Jahreskaltmiete abzüglich laufender Kosten, geteilt durch die Gesamtinvestition. | Rechner 02 · Rendite |
  | Nicht umlagefähige Kosten | Kosten, die der Vermieter trägt und nicht auf die Mieter umlegen kann, z. B. Verwaltung oder Instandhaltungsrücklage. | Rechner 04 · Cashflow |
  | Tilgung | Der Teil der monatlichen Kreditrate, der das Darlehen tatsächlich verringert. Der Rest ist Zins. | Rechner 03 · Finanzierung |
  | Zinsbindung | Der Zeitraum, für den der vereinbarte Zinssatz eines Darlehens fest steht. | Rechner 03 · Finanzierung |

  Die Gruppen werden aus den Daten erzeugt, sortiert nach Anfangsbuchstabe (B, K, N, T, Z).

### 4. Tipps & Tricks — Übersicht (`/tipps`)
- H1 „Tipps & Tricks“, Satz „Die ersten Artikel sind in Vorbereitung.“
- Karten `repeat(2, 1fr)`, `gap: 16px`, mobil untereinander. Karte: 1 px Rahmen, 10 px Radius,
  `overflow: hidden`.
  1. **Bild-Platzhalter**, volle Breite, Seitenverhältnis **16 : 9**.
  2. Kopfzeile: „Lesedauer folgt“ (12 px) links, rechts die Pille **„in Vorbereitung“**.
     Sie ist bewusst anders als „Bereit“: transparenter Grund, **gestrichelter**
     1-px-Rahmen `--color-neutral-500`, 11 px, `--color-neutral-700`.
  3. Titel 18 px / 600, darunter „[Platzhalter] Teaser-Text folgt.“ (14 px, `--color-neutral-700`).
- Titel (ausschließlich diese):
  - „[Platzhalter] Die wichtigsten Kennzahlen beim Immobilienkauf“
  - „[Platzhalter] Kaltmiete, Warmmiete, Nettokaltmiete erklärt“
- Die Karte ist unterhalb des Bildes klickbar und führt zur Artikel-Vorlage.
  Der Bildbereich bleibt im Prototyp Ablagefläche.

### 5. Tipps & Tricks — Artikel-Vorlage (`/tipps/<slug>`)
- Zentrierte Lesespalte, `max-width: 680px`.
- Zurück-Link „← Tipps & Tricks“, dann H1 25 px / 600, `line-height: 1.2`,
  `text-wrap: balance`.
- **Meta-Zeile** (13 px, `--color-neutral-700`, 1-px-Linie unten, 16 px Abstand):
  Datum · Lesedauer, rechts die Pille „in Vorbereitung“. Im Entwurf „TT.MM.JJJJ“ und
  „X Min. Lesezeit“. Format im Produkt: `TT.MM.JJJJ`, „N Min. Lesezeit“.
  Die Pille entfällt bei veröffentlichten Artikeln.
- **Artikelbild** 16 : 9, `border-radius: 10px`, 24 px Abstand oben.
- **Fließtext:** 16 px / 1,7, `--color-neutral-900`. Einleitungsabsatz 18 px / 1,6.
  Absätze mit 16 px Abstand. H2 19 px / 600, 32 px oben / 12 px unten. Listen 20 px
  eingerückt, 6 px Abstand. Inhalt im Entwurf: Lorem ipsum.
- **„Passend dazu“** mit 56 px Abstand und einer 1-px-Linie oben: H2 17 px, darunter drei
  Kärtchen `repeat(3, 1fr)`, `gap: 12px`, mobil untereinander. Kärtchen: 1 px Rahmen,
  10 px Radius, `padding: 12px 16px`, Art versal 11 px („Rechner 02“, „Ressource“),
  Titel 15 px / 600. Im Entwurf: Rendite, Finanzierung, Glossar. Im Produkt pro Artikel
  pflegbar.

## State / Daten
- `seite`: `Start | Ressourcen | Grunderwerbsteuer | Glossar | Tipps | Artikel`
  (im Produkt Routing).
- `LAENDER` — 16 Einträge `{ name, satz }`. **Eine** gemeinsame Quelle mit dem
  Kaufnebenkosten-Rechner.
- `GLOSSAR` — `{ begriff, text, rechner }`, Gruppierung nach Anfangsbuchstaben zur Laufzeit.
- Artikel — `{ titel, slug, datum?, lesedauer?, teaser?, bild?, verwandt[], status }`.
  `status: "in Vorbereitung"` steuert die gestrichelte Pille.

## Files
- `Website.dc.html` — die gesamte öffentliche Website inkl. Startseite (Schritt 1) und der
  neuen Seiten. Seite über den Zustand `seite` wählbar.
- `Runde 4.dc.html` — Übersicht aller Seiten nebeneinander bei 1280 px und 390 px
  (6a–6f Schritt 3, 5a–5d Schritt 2, 4a–4c Startseite).
- `image-slot.js` — Bild-Platzhalter (im Produkt durch echte Bilder ersetzen)
- `support.js` — Laufzeit zum Öffnen der Dateien im Browser
- `_ds/modernist-…/` — das gebundene Design-System
- `screenshots/`
  - `01-desktop-ressourcen.png`
  - `02-desktop-grunderwerbsteuer.png`, `03-desktop-grunderwerbsteuer-ende.png`
  - `04-desktop-glossar.png`, `05-desktop-glossar-weiter.png`
  - `06-desktop-tipps.png`
  - `07-desktop-artikel.png`, `08-desktop-artikel-ende.png`
  - `09-mobil-ressourcen.png`, `10-mobil-grunderwerbsteuer.png`, `11-mobil-glossar.png`,
    `12-mobil-tipps.png`, `13-mobil-artikel.png`

  Die Desktop-Aufnahmen sind bei ca. 900 px Breite entstanden. Die Anordnung bei 1280 px
  zeigt `Runde 4.dc.html`.
