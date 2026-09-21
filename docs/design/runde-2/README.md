# Handoff: Immobilienverwaltung (Web-App für private Vermieter)

## Overview
Eine Web-App, in der private Vermieter ihre Immobilien erfassen und die Wirtschaftlichkeit
rechnen. Vier Bereiche: **Übersicht** (Portfolio auf einen Blick), **Detailseite pro Objekt**
(sechs Tabs), **Rechner** (vier Rechner: Kaufnebenkosten, Rendite, Finanzierung, Cashflow)
und **Einstellungen**. Dazu die Anlage einer Immobilie als dreistufiger Assistent und die
Auth-Screens (Anmelden, Registrieren, Passwort vergessen, E-Mail bestätigen).

Sprache durchgehend Deutsch, Du-Form. Währung Euro, deutsches Zahlenformat
(`1.234,56 €`), Datum `TT.MM.JJJJ`.

## About the Design Files
Die Dateien in diesem Bundle sind **Design-Referenzen in HTML** — Prototypen, die
Aussehen und Verhalten zeigen. Sie sind **kein Produktionscode zum Kopieren**. Die
Aufgabe ist, diese Designs in der bestehenden Umgebung des Ziel-Codebases
nachzubauen (React, Vue, SwiftUI, native o. ä.) und dabei deren etablierte Muster,
Komponenten und Bibliotheken zu verwenden. Existiert noch keine Umgebung, wähle das
für das Projekt passendste Framework und setze die Designs dort um.

Der Prototyp liegt als ein einziges Design-Component-File vor. Die Logik darin
(`class Component`) zeigt die **Rechenregeln** und **Zustandsübergänge** — die sind
inhaltlich verbindlich und sollten 1:1 übernommen werden. Die Markup-Struktur ist
Referenz für Layout und Hierarchie, nicht für die Komponentenarchitektur.

Der Prototyp hat oben eine schwarze **Prototyp-Leiste** (Desktop/Mobil, 3 Objekte/Leer,
Normal/Lädt/Fehler, Screen-Auswahl). Die ist ein Werkzeug zum Durchschalten der
Zustände und gehört **nicht** in das Produkt.

## Fidelity
**High-fidelity.** Farben, Typografie, Abstände, Zustände und Texte sind final.
Die UI sollte pixelgenau mit den Bibliotheken und Mustern des Zielcodebases
nachgebaut werden. Alle Zahlen im Prototyp sind aus den Beispieldaten **gerechnet**,
nicht eingetippt — die Formeln stehen unter „Rechenregeln".

## Design-Sprache
Der Look ist bewusst reduziert und dokumentarisch:

- **Weißer Grund.** Keine grauen Kartenflächen, keine Farbflächen als Dekoration.
- **Eine Linienstärke.** 1 px, `--color-divider`. Blöcke tragen in der Regel nur eine
  **obere Trennlinie**, keinen geschlossenen Rahmen; Inhalt sitzt links am Raster
  (`padding-left: 0`). Ausnahme: die Objekt- und Einheitenkarten (siehe unten).
- **Kein Schatten** außer bei schwebendem Chrome (Popover, Dialog): `--shadow-lg`.
- **Akzent sparsam.** Petrol `#14756b` nur für die primäre Aktion, Links und die
  **eine** Hauptzahl je Rechner. Tabs, Tags, Zurück-Links und Auswahlzustände laufen
  in Tinte `#201e1d`.
- **Typografie zurückhaltend.** Überschriften Semibold (600), nicht Extrabold; H1 25 px.
- **Tabellarische Ziffern** überall, wo Zahlen untereinander stehen: `.num` mit
  `font-variant-numeric: tabular-nums`.
- **Runde Ecken nur bei Karten.** Das Design-System setzt `--radius-*: 0`; die Objekt-
  und Einheitenkarten weichen bewusst mit `border-radius: 10px` ab, Status-Pillen mit
  `999px`.

## Screens / Views

### 1. Übersicht (`screen: "uebersicht"`)
**Zweck:** Portfolio auf einen Blick, Einstieg in ein Objekt.

**Layout:** Sidebar 232 px links (Desktop), Inhalt `max-width: 1180px`,
`padding: var(--space-8) var(--space-6)`.

- **Seitenkopf** (`.pagehead`, flex, `align-items: flex-end`, `space-between`):
  links H1 „Übersicht" (25 px / 600) und darunter 13 px `--color-neutral-700`
  „Stand 19.09.2026 · alle Werte in Euro"; rechts Primärbutton
  „Immobilie hinzufügen" mit Plus-Icon (16 px).
- **Kennzahlenreihe** (`.kpis`): `grid-template-columns: repeat(5, minmax(0,1fr))`,
  oben und unten eine 1-px-Linie, je Spalte eine 1-px-Linie links (die erste nicht).
  Je Kennzahl: Label 10 px, `letter-spacing: 0.1em`, `uppercase`,
  `--color-neutral-700`, darunter die Zahl `font-heading` 600,
  `clamp(16px, 1.75cqi, 24px)`, `line-height: 1.05`, `white-space: nowrap`.
  **Keine** Hinweiszeile unter der Zahl.
  Reihenfolge: Objekte / Einheiten · Gesamtwert · Monatsmiete · Cashflow / Monat ·
  Ø Rendite.
- **Objektkarten** (`.objgrid`): `repeat(3, minmax(0,1fr))`, `gap: var(--space-4)`,
  `margin-top: var(--space-8)`. Je Karte: 1 px Rahmen, `border-radius: 10px`,
  weißer Grund, `overflow: hidden`, Hover `border-color: var(--color-neutral-400)`.
  Aufbau von oben:
  1. **Foto-Slot**, volle Breite, Höhe 132 px, eigene ID pro Objekt
     (`objektfoto-<id>`) — Drag-and-drop-Platzhalter, siehe „Assets".
  2. Klickbarer Textbereich (`padding: var(--space-4)`, `cursor: pointer`,
     öffnet die Detailseite): Name (`font-heading` 600, 16 px) mit Ort und Art
     darunter (12 px, `--color-neutral-700`), rechts die Einheitenzahl als
     Pille (`.tag-neutral`, `border-radius: 999px`, z. B. „3 Einheiten · 1 leer").
  3. Vier Datenzeilen (Label 12 px `--color-neutral-700` links, Wert
     `font-heading` 600 / 14 px rechts, `padding: 7px 0`, 1-px-Linie unten):
     Wert · Miete / Monat · Rendite · Cashflow / Monat.

**Leerzustand** (Prototyp-Schalter „Leer"): zentrierter Block, Titel
„Noch keine Immobilie erfasst", erklärender Satz, Primärbutton
„Erste Immobilie anlegen", darunter ein Verweis auf die Rechner.

### 2. Detailseite (`screen: "detail"`)
**Zweck:** Alles zu einem Objekt. Die ausführlichen Zahlen leben hier, nicht in der Übersicht.

**Kopf:** Zurück-Link „Alle Immobilien" (12 px, versal, Tinte), H1 = Objektname,
Unterzeile Adresse, rechts „Bearbeiten" (Sekundärbutton) und Kebab-Menü.
Darunter die **Tab-Leiste** (`.tabs`): Übersicht · Einheiten · Kauf und Finanzierung ·
Einnahmen und Ausgaben · Rechner · Notizen. Aktiver Tab: Tinte, 2 px Unterstrich,
inaktiv `--color-neutral-700`. Auf Mobil horizontal scrollbar (Scrollbar versteckt).

**Tab Übersicht:** Kennzahlenreihe wie auf der Übersichtsseite, darunter zweispaltig
(`.detail2`) links das **Objektfoto** (280 × 188 px, `border-radius: 10px`,
ID `objektfoto-<id>`) neben den **Stammdaten** als Label-Wert-Zeilen.

**Tab Einheiten:** **Karten nebeneinander**, `.ugrid` =
`repeat(3, minmax(0,1fr))`, `gap: var(--space-3)`; ab 1180 px zwei Spalten,
ab 860 px eine. Je Karte: 1 px Rahmen, `border-radius: 10px`, weiß,
`padding: var(--space-4)`, `gap: var(--space-3)`; Kopf mit Einheitenname
(`font-heading` 600, 16 px) und Status als Pille rechts
(`.tag-neutral`, `border-radius: 999px`, „vermietet" / „leer"); darunter drei
Datenzeilen (Fläche, Kaltmiete, je m² — bei Leerstand „—"); unten ein
Ghost-Button „Bearbeiten" (13 px, `padding-inline: 0`).
Darunter eine Summenzeile (`.duo3`): Einheiten, Gesamtfläche, Kaltmiete gesamt.

**Tab Kauf und Finanzierung:** Kaufpreis, Nebenkosten (mit Aufschlüsselung),
Gesamtinvestition, Eigenkapital, Darlehen, Zins, Tilgung, Rate, Restschuld.

**Tab Einnahmen und Ausgaben:** Einnahmen (Kaltmiete), Ausgaben (nicht umlagefähig,
Rücklage, Verwaltung, Versicherung), Rate, Ergebnis = Cashflow.

**Tab Rechner:** vier Karten, jede mit Nummer (01–04), Titel, einem Satz, dem
Vorbefüllungshinweis („Vorbefüllt: 640 € Kaltmiete") und Button „Rechner öffnen".
Öffnet den jeweiligen Rechner **mit den Objektdaten vorbefüllt**.

**Tab Notizen:** Textbereich plus Liste bestehender Notizen mit Datum.

### 3. Rechner-Startseite (`screen: "rechner"`)
Vier Einträge 01–04 als Liste mit Nummer, Titel, Beschreibung und
„Rechner öffnen". Alle vier sind funktionsfähig.

### 4. Rechner 01 — Kaufnebenkosten (`screen: "nebenkosten"`)
Zweispaltig (`.calcgrid` = `0.9fr 1.1fr`, `gap: var(--space-8)`): links Eingaben,
rechts Ergebnis. Eingaben: Kaufpreis, Bundesland (Select, 16 Länder),
Notar und Grundbuch (%), Makler (Toggle + %). Ergebnis: Tabelle der Positionen,
Summe als Hauptzahl in Petrol, Anteil am Kaufpreis, darunter die Fußnote.

### 5. Rechner 02 — Rendite (`screen: "rendite"`)
Eingaben: Kaufpreis, Kaufnebenkosten, Kaltmiete/Monat, nicht umlagefähige
Kosten/Monat. Ergebnis: Brutto- und Nettorendite (zwei Spalten, Brutto in Petrol),
darunter Jahreskaltmiete, laufende Kosten, Gesamtinvestition, Kaufpreisfaktor;
Einordnungstext; Fußnote.

### 6. Rechner 03 — Finanzierung (`screen: "finanzierung"`)
Eingaben: Kaufpreis, Nebenkosten, Eigenkapital, Sollzins, anfängliche Tilgung,
Zinsbindung (Jahre). Ergebnis: Rate pro Monat als Hauptzahl in Petrol,
Kennzahlentabelle (Gesamtinvestition, Darlehen, Beleihungsauslauf, Zins- und
Tilgungsanteil im 1. Monat, Restschuld, Zinssumme) und ein **Tilgungsplan**
(scrollbar, `max-height: 320px`) mit Jahr, Zins, Tilgung, Restschuld.

### 7. Rechner 04 — Cashflow (`screen: "cashflow"`)
Eingaben pro Monat: Kaltmiete, nicht umlagefähige Kosten, Instandhaltungsrücklage,
Verwaltung, Rate. Button „Rate aus Rechner 03 übernehmen (… €)".
Ergebnis: Zeilenaufstellung, Cashflow pro Monat als Hauptzahl (Petrol bei ≥ 0,
`--color-error` bei negativ) mit Jahreswert darunter, „Davon Tilgung",
Einordnungstext, Fußnote.

### 8. Immobilie anlegen — Assistent (`screen: "neu"`)
Drei Schritte mit Fortschrittsanzeige, `.wizgrid` = `1fr 300px`
(rechts eine Live-Vorschau der Karte).

- **Schritt 1 — Objekt:** Name, Art (Segmented: Wohnung / Haus / Mehrfamilienhaus),
  Adresse (`.adr` = `2.2fr 1fr` für Straße/Nummer, dann PLZ/Ort),
  **Foto (optional)** — Drag-and-drop-Slot 220 × 148 px, `border-radius: 10px`,
  daneben der Hinweis „Ein Querformat pro Objekt. Es erscheint später auf der
  Detailseite."; bei Haus/MFH zusätzlich Baujahr und Grundstücksfläche.
- **Schritt 2 — Einheiten:** Anzahl, je Einheit Name, Fläche, Kaltmiete, Status.
- **Schritt 3 — Kauf und Finanzierung:** Kaufpreis, Nebenkosten (Link in Rechner 01),
  Eigenkapital, Zins, Tilgung.

Abbrechen öffnet den **Verwerfen-Dialog** („Eingaben verwerfen?").

### 9. Bearbeiten (`screen: "bearbeiten"`)
Gleiche Felder wie der Assistent, einspaltig, plus Bereich **Löschen**:
Warnhinweis in `--color-error-bg` mit `--color-error-border`, Button
„Immobilie löschen" öffnet einen Bestätigungsdialog (keine Namenseingabe).

### 10. Einstellungen (`screen: "einstellungen"`)
`max-width: 620px`, vier Sektionen, jede mit oberer 1-px-Linie und
`padding-top: var(--space-6)`: **Profil** (Name, E-Mail, Speichern — nur aktiv nach
Änderung), **Passwort ändern** (aktuelles, neues, Wiederholung, Regelzeile),
**Tarif** („Kostenlos", Pille „Aktiv", Button „Tarife vergleichen" deaktiviert),
**Konto** (Hinweis zum Löschen per E-Mail, Button „Abmelden").

### 11. Auth-Screens
Zentrierte Spalte, `max-width: 400px`: **Anmelden** (E-Mail, Passwort mit
Sichtbarkeits-Umschalter, „Angemeldet bleiben", Fehlerzustand bei falschen Daten),
**Registrieren** (Name, E-Mail, Passwort mit Regelzeile, AGB-Checkbox),
**Passwort vergessen** (E-Mail, Bestätigungszustand), **E-Mail bestätigen**
(Hinweis, „E-Mail erneut senden").

## Interactions & Behavior

- **Navigation:** Sidebar (Desktop) bzw. Bottom-Nav (< 860 px): Übersicht, Rechner,
  Einstellungen. Nutzermenü oben rechts als Popover (Einstellungen, Abmelden);
  schließt bei Klick außerhalb und mit `Escape`.
- **Klick auf Objektkarte** → Detailseite, Tab „Übersicht". Der Foto-Bereich der
  Karte ist bewusst **nicht** klickbar (bleibt Ablagefläche).
- **Rechner aus dem Objekt** → Rechner öffnet vorbefüllt mit den Objektwerten.
- **Rate übernehmen** (Rechner 04) setzt die Rate aus den Werten von Rechner 03.
- **Eingaben** rechnen live bei `change`. Eingaben werden tolerant geparst:
  Tausendertrennzeichen `.` werden entfernt, `,` wird zum Dezimalpunkt,
  ungültige Eingabe ergibt 0.
- **Ladezustand:** Skeletons (`.skel`, Puls-Animation `skelpulse` 1,4 s
  `ease-in-out infinite`, Opazität 1 → 0,45).
- **Fehlerzustand:** Blocktext „Daten konnten nicht geladen werden" mit
  Button „Erneut versuchen".
- **Bestätigungen** sind Inline-Alerts oben im Inhalt (neutraler Grund
  `--color-neutral-100`, 1-px-Linie unten, Schließen-X), keine Toasts.
- **Speichern** zeigt 900 ms einen Ladezustand im Button, danach die Bestätigung.
- **Dialoge** (Verwerfen, Löschen): Overlay, `.dialog` mit `--shadow-lg`,
  Fokus auf der sicheren Aktion, `Escape` schließt.
- **Validierung:** Passwort mindestens 10 Zeichen und eine Ziffer; die Wiederholung
  muss übereinstimmen (Fehlerrand + Meldung); Speichern bleibt bis dahin deaktiviert.
  Pflichtfelder im Assistenten blockieren „Weiter".

**Responsive:** Container-Queries auf `.app`.
Bei ≤ 1180 px werden `.ugrid` zweispaltig und die Kennzahlen enger.
Bei ≤ 860 px: Sidebar aus, Bottom-Nav an, alle Raster einspaltig,
Kennzahlen als horizontal scrollbare Reihe (`flex: 0 0 46%`),
`.utable` bricht in Label-Wert-Zeilen um (`td::before { content: attr(data-label) }`).

## State Management
Ein Zustandsobjekt im Prototyp; in der echten App entsprechend Routing + Formularstate:

- `screen` — `uebersicht | detail | neu | bearbeiten | rechner | nebenkosten |
  rendite | finanzierung | cashflow | einstellungen | auth`
- `objektId`, `tab` (Detailtab), `wizSchritt` (1–3)
- `ladeZustand` — `normal | laedt | fehler`; `datenModus` — `beispiel | leer`
- `meldung` (Inline-Alert), `dialog` (offener Dialog), `menuOffen`
- Rechnerfelder je Rechner (`rKp`, `rNk`, … / `fKp`, `fZins`, … / `cMiete`, `cRate`, …)
- `authMode`, `authFehler`, `pwSichtbar`; Einstellungen: `setName`, `setMail`,
  `profilDirty`, `pwAlt`, `pwNeu`, `pwWdh`
- **Datenbedarf:** Objekte mit Einheiten (Name, Fläche, Kaltmiete, Status),
  Kaufdaten (Kaufpreis, Nebenkosten, Eigenkapital, Darlehen, Zins, Tilgung),
  laufenden Kosten und Notizen; Nutzerprofil; Bundesland-Steuersätze.

## Rechenregeln
Verbindlich, alles vor Steuern:

- **Kaufnebenkosten** = Kaufpreis × (Grunderwerbsteuer + Notar/Grundbuch + Makler).
  Grunderwerbsteuer nach Bundesland, Prozentwerte im Prototyp hinterlegt
  (u. a. Bayern 3,5 · Baden-Württemberg 5,0 · **Bremen 5,5** · NRW 6,5).
- **Gesamtinvestition** = Kaufpreis + Kaufnebenkosten.
- **Jahreskaltmiete** = Summe der Kaltmieten vermieteter Einheiten × 12.
- **Bruttorendite** = Jahreskaltmiete ÷ Kaufpreis × 100.
- **Nettorendite** = (Jahreskaltmiete − laufende Kosten p. a.) ÷ Gesamtinvestition × 100.
- **Kaufpreisfaktor** = Kaufpreis ÷ Jahreskaltmiete.
- **Darlehen** = Gesamtinvestition − Eigenkapital (nie negativ).
- **Beleihungsauslauf** = Darlehen ÷ Kaufpreis × 100.
- **Annuität p. a.** = Darlehen × (Sollzins + anfängliche Tilgung) ÷ 100;
  Rate/Monat = ÷ 12.
- **Tilgungsplan:** pro Jahr Zins = Restschuld × Sollzins, Tilgung = Annuität − Zins,
  Restschuld = Restschuld − Tilgung. **Jährliche Verrechnung** — gegenüber der
  monatlichen Rechnung einer Bank weicht das um etwa 1–2 % ab; das ist im Prototyp
  bewusst so und sollte bei der Umsetzung geprüft werden.
- **Cashflow/Monat** = Kaltmiete − nicht umlagefähige Kosten − Rücklage −
  Verwaltung − Rate. Negativ wird mit `−` und in `--color-error` dargestellt.
- **Davon Tilgung** = Rate − Restschuld × Sollzins ÷ 12 (nie negativ).
- **Ø Rendite** (Übersicht) = Summe Jahresmieten ÷ Summe Kaufpreise × 100.

Beim Runden: Geldbeträge in der Oberfläche ohne Dezimalstellen, Prozentwerte mit
zwei, Kaufpreisfaktor mit einer.

## Design Tokens

Basis ist das gebundene Design-System (`_ds/modernist-…/styles.css`, Schrift
**Archivo**). Der Prototyp überschreibt auf `.app` folgende Werte:

| Token | Wert |
| --- | --- |
| `--color-bg` | `#ffffff` |
| `--color-text` | `#201e1d` |
| `--color-divider` | `color-mix(in srgb, #201e1d 15%, transparent)` |
| `--color-accent` | `#14756b` |
| `--color-accent-100 … -900` | `#eaf5f3` `#cfe8e4` `#a3d3cc` `#5fb3a8` `#1f8b7e` `#0f6058` `#0a4a44` `#083831` `#062a25` |
| `--color-error` | `#b3261e` (6,5:1 auf Weiß) |
| `--color-error-bg` / `--color-error-border` | `#fdf3f2` / `#f0c9c5` |
| `--color-neutral-400 … -900` | `#c4c1c1` `#9b9797` `#7d7979` `#605d5d` `#444141` `#2d2b2b` |

Aus dem System übernommen:

- **Schrift:** `Archivo` für Überschriften und Text. Im Prototyp Überschriften
  **600** (statt der System-800). Grundtext 15 px / 1,55.
- **Typoskala:** H1 25 px · H2 19–21 px · H4 17 px · Text 15 px · sekundär 13 px ·
  Meta 12 px · Label versal 10–11 px mit `letter-spacing: 0.08–0.1em`.
- **Abstände:** 4 · 8 · 12 · 16 · 24 · 32 px (`--space-1 … --space-8`).
- **Radius:** System `0`. Abweichungen im Prototyp: Karten **10 px**,
  Status-Pillen **999 px**.
- **Schatten:** nur `--shadow-lg` für Popover und Dialog.
- **Kontrast:** Text ≥ 4,5:1. Sekundärtext daher `--color-neutral-700` (6,5:1);
  `--color-neutral-600` nur für Beschriftungen ab 12 px aufwärts in Versalien.

## Assets
- **Icons:** Inline-SVG, `stroke-width` 1,75–2,25, `stroke: currentColor`,
  Größen 14–18 px. Im Zielcodebase durch das dort etablierte Icon-Set ersetzen.
- **Objektfotos:** Es gibt **keine** gelieferten Bilder. Der Prototyp nutzt
  `image-slot.js` (`<image-slot>`) als Drag-and-drop-Platzhalter mit eigener ID
  pro Objekt. Im Produkt wird daraus ein echter **Bild-Upload**: ein Foto pro
  Objekt, Querformat, sichtbar auf der Objektkarte (volle Breite × 132 px) und auf
  der Detailseite (280 × 188 px). Zu klären: Dateigrößenlimit, Formate,
  Zuschnitt/Seitenverhältnis, Speicherort.
- **Schrift Archivo:** aus dem Design-System, im Zielprojekt über die dort
  übliche Font-Einbindung laden.

## Files
- `Immobilienverwaltung.dc.html` — der vollständige Prototyp (alle Screens, Logik,
  Rechenregeln, Beispieldaten)
- `image-slot.js` — der Bildplatzhalter, den der Prototyp verwendet
- `support.js` — Laufzeit des Prototyps (nur zum Öffnen der Datei im Browser nötig)
- `_ds/modernist-…/styles.css`, `_ds/modernist-…/_ds_bundle.js` — das gebundene
  Design-System
- `modernist-readme.md` — Beschreibung des Design-Systems
- `screenshots/` — Screenshots des aktuellen Stands (Stand 21.09.2026), Reihenfolge unten

### Screenshots

| Datei | Screen |
| --- | --- |
| `01-screen.png` | Übersicht — Kennzahlenreihe und Objektkarten |
| `02-screen.png` | Übersicht, Leerzustand |
| `03-screen.png` | Detailseite, Tab Übersicht |
| `04-screen.png` | Detailseite, Tab Einheiten — die Einheitenkarten |
| `05-screen.png` | Detailseite, Tab Kauf und Finanzierung |
| `06-screen.png` | Detailseite, Tab Einnahmen und Ausgaben |
| `07-screen.png` | Detailseite, Tab Rechner |
| `08-screen.png` | Detailseite, Tab Notizen |
| `09-screen.png` | Bearbeiten — unterer Teil mit dem Löschbereich |
| `10-screen.png` | Assistent, Schritt 1 (mit Foto-Feld) |
| `11-screen.png` | Rechner-Startseite |
| `12-screen.png` | Rechner 01 — Kaufnebenkosten |
| `13-screen.png` | Rechner 02 — Rendite |
| `14-screen.png` | Rechner 03 — Finanzierung |
| `15-screen.png` | Rechner 04 — Cashflow |
| `16-screen.png` | Einstellungen |
| `17-screen.png` | Anmelden |
| `18-screen.png` | Mobil — Übersicht |
| `19-screen.png` | Mobil — Detailseite |

Die Screenshots sind bei etwa 900 px Breite aufgenommen; dort greift schon die
zweispaltige Stufe (≤ 1180 px). Auf breiten Bildschirmen stehen Objekt- und
Einheitenkarten zu drei in einer Reihe.

**Öffnen:** `Immobilienverwaltung.dc.html` direkt im Browser. Über die schwarze
Prototyp-Leiste lassen sich alle Screens und Zustände durchschalten.
