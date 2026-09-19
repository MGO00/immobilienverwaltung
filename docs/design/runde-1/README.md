# Handoff: Immobilienverwaltung (MVP-Basisvariante)

## Überblick

Web-App zur Immobilienverwaltung für Privatvermieter und Kapitalanleger in Deutschland. Die
Oberfläche ist vollständig deutsch, alle Formate sind deutsch (1.234,56 €, TT.MM.JJJJ, m²).
Zielgruppe sind Laien, keine Software-Profis: ruhige, hell gehaltene Oberfläche, jede Seite mit
einem klaren Zweck, Kennzahlen prominent und tabellarisch gesetzt.

Dieser Stand deckt vier Bildschirme aus, die restlichen sind spezifiziert, aber noch nicht gebaut
(siehe „Noch offene Screens").

## Zu den Design-Dateien

Die Dateien in diesem Paket sind **Design-Referenzen in HTML** — Prototypen, die Aussehen und
Verhalten zeigen, **kein Produktionscode zum Kopieren**. Aufgabe ist es, diese Designs im
Zielcodebase mit dessen etablierten Mustern und Bibliotheken **nachzubauen**. Für dieses Projekt
ist die Zielumgebung vorgegeben: **Next.js (App Router), Tailwind CSS, shadcn/ui**. Das Design ist
bewusst so gehalten, dass es sich 1:1 auf shadcn/ui-Primitives abbilden lässt (keine exotischen
Effekte, Radius 0, flache Flächen, nur Border und Typografie als Struktur).

Der Prototyp ist eine einzelne HTML-Datei mit einer React-artigen Logikklasse. Die enthaltene
Prototyp-Leiste (schwarzer Balken oben mit „Desktop / Mobil" und „3 Objekte / Leer") ist ein
Präsentationshilfsmittel und **nicht Teil des Produkts** — nicht nachbauen.

## Fidelity

**High-fidelity.** Farben, Typografie, Abstände, Zustände und Beschriftungen sind final gemeint und
sollen pixelgenau übernommen werden. Ausnahme: der Screen „Einstellungen" ist bisher nur ein
Platzhalter, und drei der vier Rechner sind als Karten mit Status „In Arbeit" angelegt.

---

## Design-Tokens

Basis ist das Design-System „Modernist" (`styles.css` im Paket, `:root`-Variablen). Der Prototyp
überschreibt darin lokal drei Dinge: **Grund weiß**, **leichtere Linien (1px)**, **Akzent Petrol
statt Rot**. Für die Implementierung gelten die hier gelisteten, effektiven Werte.

### Farben

| Rolle | Wert | Verwendung |
| --- | --- | --- |
| `--color-bg` | `#ffffff` | App-Grund, Header, Immobilien-Karten |
| `--color-surface` | `#f8f4f4` | Rechner-Karten, Ergebnisbox, Inputs |
| `--color-text` | `#201e1d` | Schrift, Zahlen |
| `--color-divider` | `rgba(32,30,29,0.15)` (`color-mix(in srgb, #201e1d 15%, transparent)`) | **alle** Linien, 1px |
| `--color-accent` | `#14756b` | Primärbutton, aktive Navigation, Kicker, Fokusring |

Akzent-Rampe (Petrol, ersetzt die rote Rampe des Systems):

| Step | Hex | Verwendung |
| --- | --- | --- |
| 100 | `#eaf5f3` | Hinweisbox-Fläche, `tag-accent`-Fläche |
| 200 | `#cfe8e4` | — |
| 300 | `#a3d3cc` | Rahmen der Hinweisbox |
| 400 | `#5fb3a8` | — |
| 500 | `#1f8b7e` | — |
| 600 | `#0f6058` | Hover Primärbutton |
| 700 | `#0a4a44` | Akzentschrift in Fließtextgröße, Icon in Hinweisbox, Pressed-State |
| 800 | `#083831` | Schrift auf `accent-100` (Tags) |
| 900 | `#062a25` | Schrift in der Hinweisbox |

Neutral-Rampe (unverändert aus dem System):
`100 #f8f4f4` · `200 #eae7e7` · `300 #d7d3d3` · `400 #bab6b6` · `500 #9b9797` · `600 #7d7979`
· `700 #605d5d` · `800 #444141` · `900 #2d2b2b`

Verwendung: `600` für sekundäre Labels und Fußnoten, `700` für Beschreibungstexte, `900` für
Kennzahlen mit Betonung und die Avatar-Kachel.

Kontraste: Weiß auf `#14756b` = 5,6:1. `accent-700` auf Weiß = 9,8:1. `neutral-700` auf Weiß = 6,1:1.
Negative Werte (Cashflow) werden **nicht** rot gesetzt, sondern in `neutral-900` — das Minuszeichen
genügt, Rot würde fälschlich als Fehler gelesen.

### Typografie

Archivo (Google Fonts), Gewichte 400 / 600 / 800. `--font-heading` und `--font-body` sind beide
Archivo. Basis: 15px / 1.55 / 400.

| Element | Größe | Gewicht | Weiteres |
| --- | --- | --- | --- |
| Seitentitel (h1, inline überschrieben) | 34px | 800 | `letter-spacing: -0.015em`, `line-height: 1.12` |
| Leerzustand-Headline (h2) | 27px | 800 | |
| Abschnittstitel (h4) | 20px | 800 | |
| Kicker (h6) | 13px | 800 | `uppercase`, `letter-spacing: 0.08em`, Farbe `accent` |
| Kennzahl-Wert | `clamp(19px, 2.3cqi, 28px)`, mobil 24px | 800 | `letter-spacing: -0.02em`, `white-space: nowrap`, tabellarische Ziffern |
| Kennzahl-Label | 11px | 400 | `uppercase`, `letter-spacing: 0.08em`, `neutral-700` |
| Kennzahl-Hinweis | 11px | 400 | `neutral-600` |
| Karten-Titel Immobilie | 18px | 800 | |
| Karten-Titel Rechner | 19px | 800 | |
| Fließtext | 13–15px | 400 | `text-wrap: pretty`, `neutral-700`/`neutral-800` |
| Tabelle | 14px | 400 | Kopf 11px uppercase `letter-spacing: 0.08em`, `neutral-600` |
| Button-Label | 14px | 800 | |
| Feld-Label | 12px | 400 | `color-mix(--color-text 70%)` |
| Tag | 11px | 400 | Padding 3px 10px |

**Alle Zahlen** tragen `font-variant-numeric: tabular-nums` (Utility `.num` im Prototyp).

### Abstände, Radius, Schatten

`--space-1: 4px` · `--space-2: 8px` · `--space-3: 12px` · `--space-4: 16px` · `--space-6: 24px`
· `--space-8: 32px`. Seitenrand im Content: `--space-6` (24px). Header: `0 24px`, Höhe durch
`padding: 12px 8px` an den Nav-Buttons.

**Radius ist überall 0** — das ist Absicht, nicht Versehen (shadcn: `--radius: 0rem`).

Schatten nur an der Prototyp-Bühne und am Nutzermenü-Dropdown: `--shadow-lg: 0 12px 32px rgba(45,43,43,0.22)`.
In der App selbst gibt es keine Elevation — Struktur kommt ausschließlich aus 1px-Linien.

### Tailwind-Mapping (Vorschlag)

```js
// tailwind.config.ts – theme.extend
colors: {
  background: '#ffffff',
  surface: '#f8f4f4',
  foreground: '#201e1d',
  border: 'rgba(32,30,29,0.15)',
  accent: {
    DEFAULT: '#14756b', 100: '#eaf5f3', 200: '#cfe8e4', 300: '#a3d3cc', 400: '#5fb3a8',
    500: '#1f8b7e', 600: '#0f6058', 700: '#0a4a44', 800: '#083831', 900: '#062a25',
  },
  neutral: { 100:'#f8f4f4',200:'#eae7e7',300:'#d7d3d3',400:'#bab6b6',500:'#9b9797',
             600:'#7d7979',700:'#605d5d',800:'#444141',900:'#2d2b2b' },
},
fontFamily: { sans: ['Archivo', 'system-ui', 'sans-serif'] },
borderRadius: { none: '0', sm: '0', DEFAULT: '0', md: '0', lg: '0' },
```

---

## Komponenten (wiederverwendbar)

| Prototyp-Klasse | shadcn/ui-Pendant | Spezifikation |
| --- | --- | --- |
| `.btn .btn-primary` | `Button` (default) | Fläche `accent`, Label `#ffffff`, 14px/800, Padding `8px 14.4px`, Radius 0, Hover `accent-600`, Active `accent-700`, disabled `opacity: .45` |
| `.btn .btn-secondary` | `Button variant="outline"` | transparent, 1px `divider`, Hover `rgba(32,30,29,0.07)`, Active `0.14` |
| `.btn` mit Icon | — | Icon 16px, `gap: 6px`, Icon links vor dem Label |
| `.tag .tag-neutral` | `Badge variant="secondary"` | Fläche `neutral-100`, Schrift `neutral-800`, 11px |
| `.tag .tag-accent` | `Badge` | Fläche `accent-100`, Schrift `accent-800` |
| `.field` + `label` + `.input` | `Label` + `Input` | Input: min-height 36px, Padding `6px 10px`, 14px, Fläche `surface`, 1px `divider`, Hover-Border 45 % Ink, Focus-Border `accent` |
| Input mit Suffix (€, %) | `Input` + Addon | Zahl rechtsbündig, `border-right: 0`; Suffix-Box `neutral-200`, 1px `divider`, Padding `0 10px`, min-width 38px |
| `select.input` | `Select` | gleiche Metrik wie Input |
| `.radio` + `.dot` (als Checkbox genutzt) | `Checkbox` | 16px Kästchen, Radius 0, 1.5px `divider`, checked: Fläche `accent` + `inset 0 0 0 4px #fff` |
| `.table` | `Table` | 14px; `th` 11px uppercase, `border-bottom: 1px divider`; `td` Padding 8px, `border-bottom: 1px divider`; Row-Hover `rgba(32,30,29,0.04)` |
| Kennzahlen-Zelle | eigene Komponente `<Kpi label wert hinweis />` | siehe „Übersicht" |
| Fokus | global | `:focus-visible { outline: 2px solid #14756b; outline-offset: 2px }` — nie der Browser-Default |

---

## Navigation (Shell)

**Desktop (Container > 860px)** — obere Leiste, `position: sticky; top: 0`, Fläche `#ffffff`,
`border-bottom: 1px divider`, Innenabstand `0 24px`:

1. Wortmarke links: „Immobilien" in 800 + „verwaltung" in 400, 16px, `letter-spacing: -0.02em`, `nowrap`.
2. Nav-Buttons horizontal (`gap: 8px`, Padding `12px 8px`, 14px/800, Icon 17px): **Übersicht**,
   **Rechner**, **Einstellungen**. Aktiv: `border-bottom: 2px solid accent`, `margin-bottom: -1px`
   (überzeichnet die Header-Linie), Schrift `--color-text`; inaktiv Schrift `neutral-600`.
3. Rechts das Nutzermenü: Button mit 26px-Initialenkachel (`neutral-900` Fläche, `neutral-100`
   Schrift, 11px/800), Name (13px, `nowrap`), Chevron 14px, 1px `divider` Rahmen,
   Hover `rgba(32,30,29,0.07)`. Klick öffnet ein Dropdown (200px, rechts ausgerichtet,
   `top: calc(100% + 6px)`, 1px `divider`, `shadow-lg`): Kopf mit Name + E-Mail, Eintrag „Profil",
   Eintrag **„Abmelden"** in `accent-700` mit Log-out-Icon, Hover `accent-100`.

**Mobil (Container ≤ 860px)** — obere Nav-Buttons und der Nutzername werden ausgeblendet
(Wortmarke und Initialenkachel bleiben), stattdessen untere Leiste: `position: sticky; bottom: 0`,
`border-top: 1px divider`, 3 gleiche Spalten, je Eintrag min-height 58px, Icon 20px über Label
11px/800, aktiv: `border-top: 3px solid accent` und Schrift `accent-800`, inaktiv `neutral-700`.

**Fußzeile** (unter dem Content, über der Mobil-Nav): `border-top: 1px divider`, Padding `16px 24px`,
11px `neutral-600`: „Alle Berechnungen ohne Gewähr. Keine Steuer- oder Anlageberatung."

Einstellungen führt laut Spezifikation auf Profil / Passwort ändern / Tarif (Platzhalter).

---

## Screens

### 1. Übersicht (Startseite nach dem Login)

**Zweck:** Portfolio auf einen Blick, Einstieg zum Anlegen einer Immobilie.

**Layout** (Content-Padding 24px):

1. **Kopfzeile** — Flex, `align-items: flex-end`, `justify-content: space-between`, `gap: 16px`,
   darunter 24px Abstand. Links: Kicker „Portfolio" (accent), h1 „Übersicht" (34px),
   Unterzeile 14px `neutral-700`: „Stand 19.09.2026 · drei Objekte, alle Werte in Euro".
   Rechts: Primärbutton **„Immobilie hinzufügen"** mit Plus-Icon.
   Unter 860px kippt die Zeile in eine Spalte (`flex-direction: column; align-items: stretch`).

2. **Kennzahlenband** — Grid, `border-top: 1px divider`, `border-bottom: 1px divider`,
   5 gleiche Spalten; Zellen `padding: 16px 16px 16px 0`, Trennung durch
   `border-left: 1px divider` (erste Zelle ohne). Je Zelle: Label (11px uppercase `neutral-700`,
   8px Abstand), Wert (800, `clamp(19px, 2.3cqi, 28px)`, nowrap), Hinweis (11px `neutral-600`, 6px Abstand).
   - ≤ 1180px: 3 Spalten, `border-left` bei jeder 1. Spalte entfernen, ab der 4. Zelle `border-top: 1px`.
   - ≤ 860px: 2 Spalten, Wert 24px.

   | Label | Wert | Hinweis |
   | --- | --- | --- |
   | Objekte | `3` | 8 Einheiten |
   | Gesamtwert | `1.464.000 €` | Summe der Kaufpreise |
   | Monatsmiete | `5.810 €` | kalt, ohne Leerstand |
   | Cashflow / Monat | `−90 €` | nach Zins und Tilgung |
   | Ø Rendite | `4,76 %` | brutto, wertgewichtet |

3. **Abschnittskopf** — 32px Abstand oben, 16px unten: h4 „Immobilien" + 12px `neutral-700`
   „3 Objekte · 8 Einheiten" (baseline-aligned, `gap: 12px`).

4. **Immobilien-Karten** — Grid, 3 Spalten, `gap: 16px`, ≤ 860px eine Spalte. Karte:
   Fläche `#ffffff`, 1px `divider`, Padding 16px, `gap: 12px`, `cursor: pointer`,
   Hover `border-color: var(--color-text)`. Aufbau von oben:
   - Zeile: Tag mit Objektart (links) ↔ Fläche 11px `neutral-700` (rechts)
   - Bezeichnung 18px/800, darunter Ort 13px `neutral-700`
   - Drei Wertzeilen in einer Liste mit 1px-Linien (`padding: 7px 0`): Label 12px `neutral-700`
     links, Wert 14px/800 rechts — **Wert**, **Kaltmiete / Monat**, **Bruttorendite**
   - Fußzeile: Status-Tag links ↔ „Details" 13px/800 in `accent` mit Pfeil-Icon rechts

   Karten-Inhalte (Beispieldaten, siehe unten). Klick öffnet die Detailseite (noch nicht gebaut).

### 2. Übersicht — leerer Zustand

Wird gezeigt, solange keine Immobilie angelegt ist.

Kopf: Kicker „Portfolio" + h1 „Übersicht". Danach ein Block mit `border-top`/`border-bottom` 1px
und `padding: 32px 0`, Inhalt auf `max-width: 520px`:

- h2 (27px) „Leg deine erste Immobilie an"
- Absatz 15px `neutral-800`: „Sobald ein Objekt angelegt ist, siehst du hier Wert, Miete, Cashflow
  und Rendite auf einen Blick. Du brauchst nur Kaufpreis, Miete und die Finanzierung — alles andere
  kannst du später ergänzen."
- Button-Paar (`gap: 8px`, umbrechend): Primär **„Erste Immobilie hinzufügen"** (Plus-Icon),
  sekundär **„Erst mal rechnen"** (führt auf den Rechner-Bereich)
- Drei Schritte als Liste mit 1px-Linien (`padding: 10px 0`), Nummer 12px/800 in `accent`
  (min-width 22px) + Text 13px `neutral-800`:
  1. „Objektart, Adresse und Wohnfläche eintragen"
  2. „Kaufpreis, Nebenkosten und Finanzierung ergänzen"
  3. „Miete und laufende Kosten — fertig, Kennzahlen rechnen sich selbst"

Ansprache durchgängig **Du**.

### 3. Rechner — Startseite

Kopf: Kicker „Werkzeuge", h1 „Rechner", Absatz 14px `neutral-700` (max-width 560px): „Vier Rechner
für die Entscheidung vor dem Kauf. Ergebnisse kannst du einer deiner Immobilien zuordnen."

Karten-Grid: `border-top: 1px divider`, `padding-top: 16px`, 2 Spalten, `gap: 16px`, ≤ 860px eine
Spalte. Karte: Fläche `surface`, 1px `divider`, Padding 16px, `gap: 8px`:
Kopfzeile mit Nummer (12px/800 `accent`, `letter-spacing: .08em`) links ↔ Status-Tag rechts,
Titel 19px/800, Beschreibung 13px `neutral-800` (`flex: 1`), unten sekundärer Button.

| Nr | Titel | Beschreibung | Tag | Button |
| --- | --- | --- | --- | --- |
| 01 | Kaufnebenkosten | Grunderwerbsteuer nach Bundesland, Notar, Grundbuch und Makler. | „Bereit" (`tag-accent`) | „Rechner öffnen" → Screen 4 |
| 02 | Rendite | Brutto- und Nettorendite sowie Kaufpreisfaktor aus Miete und Gesamtkosten. | „In Arbeit" (`tag-neutral`) | „Folgt", disabled |
| 03 | Finanzierung | Annuität, Restschuld am Ende der Zinsbindung und Tilgungsplan pro Jahr. | „In Arbeit" | „Folgt", disabled |
| 04 | Cashflow | Miete minus Rate und laufende Kosten, monatlich und auf das Jahr gerechnet. | „In Arbeit" | „Folgt", disabled |

Darunter (32px Abstand) die **Hinweisbox**: Fläche `accent-100`, 1px `accent-300`,
`padding: 12px 16px`, Flex mit 12px Gap, Info-Icon 18px in `accent-700`, Text 13px `accent-900`:
**„Keine Steuer- oder Anlageberatung."** + „Die Rechner liefern Näherungswerte auf Basis deiner
Eingaben. Für verbindliche Aussagen frag deine Steuerberatung."

### 4. Kaufnebenkosten-Rechner (voll ausgearbeitet)

Zurück-Link oben: Pfeil-Icon + „ALLE RECHNER", 12px/800 uppercase `letter-spacing: .06em`, `accent`.
h1 „Kaufnebenkosten", Absatz: „Grunderwerbsteuer, Notar, Grundbuch und Maklerprovision — die Kosten,
die neben dem Kaufpreis anfallen."

Zwei Spalten (`border-top: 1px divider`, `padding-top: 24px`, `grid-template-columns: 0.9fr 1.1fr`,
`gap: 32px`; ≤ 860px einspaltig, Eingaben zuerst).

**Links — „EINGABEN"** (h6 `neutral-700`), Felder mit 16px Abstand:

| Feld | Typ | Default | Detail |
| --- | --- | --- | --- |
| Kaufpreis | Text, numerisch | `189.000` | rechtsbündig, Tausenderpunkte, Suffix „€"; Eingabe wird auf Ziffern reduziert |
| Bundesland (Grunderwerbsteuer) | Select, 16 Länder | Sachsen | Option-Label „Sachsen · 5,5 %" |
| Notar | Number, step 0.1 | `1,5` | Suffix „%" |
| Grundbuch | Number, step 0.1 | `0,5` | Suffix „%" |
| Maklerprovision einrechnen | Checkbox | an | über 1px-Linie abgesetzt |
| Maklerprovision (Käuferanteil, inkl. USt.) | Number, step 0.01 | `3,57` | Suffix „%", disabled wenn Checkbox aus |

Notar und Grundbuch stehen in einem 2-Spalten-Grid (`gap: 12px`), ≤ 860px untereinander.

**Rechts — „ERGEBNIS"** (h6 `neutral-700`):

Ergebnisbox (Fläche `surface`, 1px `divider`, Padding 16px):
- Tabelle mit Spalten **Position / Satz / Betrag** (Satz und Betrag rechtsbündig, Betrag 800 und
  `nowrap`): Grunderwerbsteuer (Satz aus Bundesland), Notar, Grundbuch, Maklerprovision.
  Ist die Makler-Checkbox aus, lautet die Zeile „Maklerprovision (nicht einberechnet)", Satz „—",
  Betrag `0,00 €`.
- Summenblock: links „Kaufnebenkosten gesamt" (15px/800) + Anteil (12px `neutral-700`,
  z. B. „11,07 % vom Kaufpreis"), rechts der Betrag 26px/800 in `accent`, `nowrap`.
- Getrennt durch 1px-Linie: „Gesamtinvestition" (15px/800) + „Kaufpreis + Nebenkosten"
  (12px `neutral-700`), rechts 22px/800 `nowrap`.

Zuordnungsbox (1px `divider`, Padding 16px): Titel 15px/800 „Ergebnis einer Immobilie zuordnen",
Erklärtext 13px `neutral-700` „Die Nebenkosten werden dann bei Kauf und Finanzierung des Objekts
gespeichert.", darunter Select „Immobilie" (Platzhalter „Bitte wählen", Optionen = die drei Objekte)
und Primärbutton **„Zuordnen"** (disabled bis eine Immobilie gewählt ist). Nach dem Klick erscheint
über einer 1px-Linie eine Bestätigung in 13px `accent-800`:
„Gespeichert: 20.922,30 € Kaufnebenkosten bei „Wohnung Südvorstadt"."

Abschließend dieselbe Hinweisbox wie auf der Rechner-Startseite, zweiter Satz hier:
„Notar- und Grundbuchkosten sind Erfahrungswerte und können im Einzelfall abweichen."

### 5. Einstellungen (Platzhalter)

Aktuell nur h1 „Einstellungen" + Hinweis. Soll werden: Profil, Passwort ändern, Bereich „Tarif"
(Kostenlos, dezenter Upgrade-Hinweis). Abomodell nicht ausgestalten.

---

## Interaktionen & Verhalten

- **Navigation** ist reines Umschalten des aktiven Screens (kein Routing im Prototyp). Ziel in
  Next.js: `/uebersicht`, `/rechner`, `/rechner/kaufnebenkosten`, `/einstellungen`.
- **Nutzermenü**: Klick auf den Button toggelt das Dropdown; jede Navigation und „Abmelden"
  schließen es. Im Produktionscode zusätzlich Outside-Click und `Esc` schließen (shadcn
  `DropdownMenu` erledigt das).
- **Rechner** berechnet live bei jeder Eingabe, ohne „Berechnen"-Button.
- **Kaufpreis-Eingabe**: alle Nicht-Ziffern werden entfernt, Anzeige mit `de-DE`-Tausenderpunkten.
- **Makler-Checkbox aus** → Provisionsfeld disabled, Satz „—", Betrag 0, Summe rechnet ohne Makler.
- **„Zuordnen"** ist bis zur Auswahl disabled; danach Bestätigungszeile (keine Navigation).
- **Hover**: Immobilien-Karte bekommt eine dunkle Rahmenfarbe; Tabellenzeilen tönen auf 4 % Ink;
  Buttons nach Systemvorgabe.
- **Fokus**: überall `2px solid #14756b` mit 2px Offset, bei Inputs stattdessen Border in `accent`.
- **Responsiv**: ein Breakpoint bei **860px** (Navigation oben ↔ unten, alle Grids einspaltig) und
  einer bei **1180px** (Kennzahlen 5 → 3 Spalten). Im Prototyp als Container-Queries umgesetzt,
  damit der Mobilrahmen funktioniert; in der Implementierung sind normale Media-Queries richtig
  (`md:` / `xl:`).
- Noch nicht gebaut, aber spezifiziert: Formularvalidierung direkt am Feld (Fehlertext unter dem
  Feld, Border in einem Fehlerrot, `aria-describedby`), Ladezustände, Fehlerzustände.

## State

Prototyp-State (der App-Teil davon ist der relevante):

| State | Werte | Auslöser |
| --- | --- | --- |
| `screen` | `uebersicht` / `rechner` / `nebenkosten` / `einstellungen` | Navigation → in Next.js Routing |
| `userMenu` | bool | Nutzermenü-Button |
| `kaufpreis` | number, default 189000 | Eingabe |
| `land` | 16 Bundesländer, default „Sachsen" | Select |
| `notar`, `grundbuch`, `makler` | 1.5 / 0.5 / 3.57 (%) | Eingabe |
| `maklerAn` | bool, default true | Checkbox |
| `zuordnung` / `zugeordnet` | Objektname | Select / „Zuordnen" |
| `mode`, `daten` | Prototyp-Leiste (**nicht** übernehmen) | — |

Datenbedarf pro Immobilie (aus der Spezifikation): Objektart, Bezeichnung, Adresse, Baujahr,
Wohnfläche, Kaufdatum, Kaufpreis, Kaufnebenkosten, Finanzierung (Darlehen, Zins, Tilgung,
Zinsbindung bis), Nutzung, Kaltmiete, laufende Kosten, Einheiten (Name, Fläche, Kaltmiete, Status),
Notizen. Kennzahlen werden **abgeleitet**, nicht gespeichert.

## Formeln und Beispieldaten

Alle Werte im Prototyp sind rechnerisch konsistent — bitte identisch übernehmen, damit Design und
Implementierung vergleichbar bleiben.

**Formeln**

- Bruttorendite = Jahreskaltmiete ÷ Kaufpreis
- Jahreskaltmiete = Kaltmiete × 12
- Annuität/Monat = Darlehen × (Zins % + Tilgung %) ÷ 12
- Cashflow/Monat = Kaltmiete − Annuität − laufende Kosten
- Ø Rendite (Portfolio) = Summe Jahresmieten ÷ Summe Werte (wertgewichtet)
- Leerstandsquote = leere Einheiten ÷ Einheiten
- Kaufnebenkosten = Kaufpreis × (GrESt % + Notar % + Grundbuch % + Makler %)
- Gesamtinvestition = Kaufpreis + Kaufnebenkosten

**Objekte**

| | Wohnung Südvorstadt | Haus Kirchröder Straße | Mehrfamilienhaus Nordmarkt |
| --- | --- | --- | --- |
| Ort | Leipzig | Hannover | Dortmund |
| Objektart (Tag) | Eigentumswohnung | Einfamilienhaus | Mehrfamilienhaus |
| Fläche | 58 m² | 128 m² (Grundstück 520 m²) | 412 m², 6 Einheiten |
| Baujahr | 1998 | — | — |
| Kaufpreis / Wert | 189.000 € | 385.000 € | 890.000 € |
| Kaltmiete / Monat | 640 € | 1.450 € | 3.720 € |
| Bruttorendite | 4,06 % | 4,52 % | 5,02 % |
| Status-Tag | „vermietet" (neutral) | „vermietet" (neutral) | „1 von 6 Einheiten leer" (accent) |
| Darlehen | 150.000 € | 280.000 € | 620.000 € |
| Zins / Tilgung | 3,6 % / 2,0 % | 3,5 % / 2,0 % | 3,8 % / 2,0 % |
| Annuität / Monat | 700 € | 1.283 € | 2.997 € |
| Laufende Kosten / Monat | 105 € | 200 € | 615 € |
| Cashflow / Monat | −165 € | −33 € | +108 € |

Portfolio: Gesamtwert 1.464.000 €, Monatsmiete 5.810 €, Cashflow −90 €, Ø Rendite 4,76 %,
8 Einheiten (1 + 1 + 6).

Einheiten des Mehrfamilienhauses (für den Tab „Einheiten"): EG links 62 m² / 690 €, EG rechts
58 m² / 645 €, 1. OG links 74 m² / 810 €, 1. OG rechts 68 m² / 745 €, 2. OG links 76 m² / 830 €,
DG 74 m² leer (Sollmiete 790 €) → Gesamtmiete 3.720 €, Leerstandsquote 16,7 %.

**Grunderwerbsteuer je Bundesland (Stand 2026)**

Baden-Württemberg 5,0 · Bayern 3,5 · Berlin 6,0 · Brandenburg 6,5 · Bremen 5,0 · Hamburg 5,5 ·
Hessen 6,0 · Mecklenburg-Vorpommern 6,0 · Niedersachsen 5,0 · Nordrhein-Westfalen 6,5 ·
Rheinland-Pfalz 5,0 · Saarland 6,5 · Sachsen 5,5 · Sachsen-Anhalt 5,0 · Schleswig-Holstein 6,5 ·
Thüringen 5,0 (jeweils %). Die Sätze gehören in eine wartbare Konstante, nicht in die View.

**Beispielrechnung (Defaults)**: 189.000 € in Sachsen → GrESt 10.395,00 €, Notar 2.835,00 €,
Grundbuch 945,00 €, Makler 6.747,30 € → Nebenkosten 20.922,30 € (11,07 %),
Gesamtinvestition 209.922,30 €.

**Formatierung**: `Intl.NumberFormat('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2})`
+ „ €". Kennzahlen im Band ohne Dezimalstellen, Rechnerbeträge mit zwei. Prozente mit Komma
(„4,76 %"), Datum TT.MM.JJJJ, Fläche „58 m²". Negative Werte mit „−" (U+2212).

## Noch offene Screens (spezifiziert, nicht gebaut)

1. **Login / Registrierung** — E-Mail + Passwort, „Passwort vergessen", Wechsel Anmelden ↔
   Registrieren, kurzer Datenschutzhinweis bei der Registrierung.
2. **Immobilie hinzufügen** — dreistufiges Formular mit Fortschrittsanzeige: (1) Objektart,
   Bezeichnung, Adresse, Baujahr, Wohnfläche; (2) Kaufdatum, Kaufpreis, Kaufnebenkosten,
   Finanzierung; (3) Nutzung, Kaltmiete, laufende Kosten. Validierung am Feld, Speichern und Zurück.
3. **Immobilien-Detailseite** — Kopf mit Name, Adresse, Objektart, „Bearbeiten"; Tabs: Übersicht,
   Einheiten (Tabelle + „Einheit hinzufügen", Summen und Leerstandsquote berechnet; ETW und EFH
   haben genau eine Einheit, MFH mehrere), Kauf und Finanzierung, Einnahmen und Ausgaben
   (bei ETW zusätzlich Hausgeld und Instandhaltungsrücklage), Rechner (vorbefüllt), Notizen.
4. **Rechner 02–04** — Rendite, Finanzierung mit Tilgungsplan, Cashflow.
5. **Einstellungen** — Profil, Passwort ändern, Platzhalter „Tarif".

Die App soll später um Abomodelle erweitert werden: Navigation und Einstellungen sind dafür offen
gehalten (Platzhalter „Tarif").

## Screenshots

Im Ordner `screenshots/` (Prototyp-Leiste oben im Bild gehört nicht zum Produkt):

| Datei | Screen |
| --- | --- |
| `01-screen.png` | Übersicht, Desktop, mit drei Objekten |
| `02-screen.png` | Übersicht, Desktop, leerer Zustand |
| `03-screen.png` | Rechner-Startseite, Desktop |
| `04-screen.png` | Kaufnebenkosten-Rechner, Desktop, Eingaben und Ergebnis |
| `05-screen.png` | Übersicht, Mobil (390px-Rahmen) |
| `06-screen.png` | Kaufnebenkosten-Rechner, Mobil — einspaltig, Eingaben zuerst, Ergebnisbox darunter |

## Assets

Keine Bilddateien. Alle Icons sind inline-SVG im Lucide-Stil (`stroke-width: 1.6–2.5`, 14–20px):
`building`, `calculator`, `sliders-horizontal`, `plus`, `arrow-right`, `arrow-left`, `chevron-down`,
`log-out`, `info`. In der Implementierung `lucide-react` verwenden.
Schrift: Archivo über Google Fonts (400, 600, 800).

## Dateien in diesem Paket

| Datei | Inhalt |
| --- | --- |
| `Immobilienverwaltung.dc.html` | Der Prototyp: alle vier Screens, beide Navigationsmodi, der gerechnete Kaufnebenkosten-Rechner. Im Browser direkt öffenbar. |
| `support.js` | Laufzeit für das Prototyp-Format (nicht Teil des Designs, nur damit die HTML-Datei lokal läuft). |
| `styles.css` | Das Design-System „Modernist": Token-Sheet + Komponentenklassen. Enthält die roten Originaltokens — die im Prototyp gültigen Überschreibungen (weiß, 1px, Petrol) stehen oben in diesem README und im `<style>`-Block der HTML-Datei. |
| `modernist-readme.md` | Leitfaden des Design-Systems (Prinzipien, Klassenübersicht). |

Abweichungen vom Design-System, bewusst und auf Wunsch: Grund weiß statt `#f3f2f2`, Linien 1px
statt 2px und heller, Akzent Petrol `#14756b` statt Rot `#ec3013`. Alles andere (Archivo, Radius 0,
flache Flächen, linksbündige Ausrichtung, Rampenlogik) folgt dem System.
