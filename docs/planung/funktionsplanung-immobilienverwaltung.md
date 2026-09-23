# Projektplanung: Anwendung Immobilienverwaltung

Stand: 23.09.2026. Diese Datei fasst alle bisherigen Planungsentscheidungen zusammen, zur Weitergabe an die Gesamtplanung und als Referenz für die Umsetzung mit Claude Code. Ausführlichere Begründungen und Tabellen stehen im Dokument "Funktionsplanung Immobilienverwaltung" (Claude Docs).

## 1. Projektrahmen

- **Produkt:** Webanwendung zur Immobilienverwaltung mit integrierten Rechnern, Basisvariante (MVP) und späterem Abo-Ausbau (Free, Plus, Pro).
- **Zielgruppe:** private Kapitalanleger mit 1–5 Objekten, Markt nur Deutschland.
- **Objektarten:** Eigentumswohnung, Einfamilien-/Doppelhaus, Mehrfamilienhaus (mit einfacher Einheitenliste, jede Wohnung eine Zeile).
- **UI-Grundstruktur:** Übersicht mit Kennzahlen, Objekt hinzufügen, Detailseite mit Tabs, eigener Rechner-Bereich, Konto und Einstellungen.
- **Umsetzung:** Projekt liegt in VS Code, Umsetzung mit Claude Code. Kein Programmierhintergrund beim Gründer, Claude soll den Großteil der Umsetzung bauen. UI-Design mit Claude Design erarbeitet; Design-Handoff Runde 1 und Runde 2 liegen im Projekt unter `docs/design`.
- **Design-Entscheidungen (Runde 2):**
  - Foto-Bereich zunächst nur als Platzhalter, echter Foto-Upload folgt als eigener Schritt.
  - Negative Zahlen (z. B. Cashflow) überall neutral mit Minuszeichen darstellen, nicht rot.
  - Tilgungsplan wird monatlich statt jährlich gerechnet.
- **Anbieterwahl:** Anbieter müssen nicht aus der EU kommen; EU-Serverstandort und Auftragsverarbeitungsvertrag genügen.
- **Unternehmerischer Rahmen:** Gründung nebenberuflich, neben einer Tätigkeit als Beamter bei einer Berufsfeuerwehr. Nebentätigkeitsgenehmigung ist noch zu beantragen. Rechtsform vermutlich UG oder GmbH (kein Einzelunternehmen); eine vorgeschaltete Holding ist noch offen.
- **Marketing:** parallel zur Entwicklung geplant, SEO und Social Media nach dem Pareto-Prinzip. Die öffentlichen Rechnerseiten sind dafür der zentrale Hebel.

## 2. Tarife (Startwerte)

| | Free | Plus | Pro |
| --- | --- | --- | --- |
| Preis monatlich | 0 € | 7,90 € (Entwurf) | 14,90 € (Entwurf) |
| Preis jährlich | – | 79 € | 149 € |
| Objekte (Bestand) | 5 | 10 | unbegrenzt |
| Aktive Interessenten (Kaufprüfung) | 20 | 100 | unbegrenzt |
| Dokumentenspeicher | 200 MB | 2 GB | 20 GB |
| Basis-Analyse | ja | ja | ja |
| Erweiterte Analyse | – | ja | ja |
| Portfolio-Auswertung | – | – | ja |
| Sanierungsplaner | Maßnahmenliste | volle Planung | volle Planung |
| Mieter, Mietverhältnisse, Einnahmen/Ausgaben | ja | ja | ja |
| Erinnerungen | manuell | automatisch | automatisch |
| Wiederkehrende Buchungen, Mieteingangskontrolle | – | ja | ja |
| Jahresauswertung, PDF-Objektbericht | – | ja | ja |
| Nebenkostenabrechnung, Bankimport, Zugang für Dritte | – | – | ja |

Preise sind unbestätigte Startwerte (siehe offene Punkte). Interessenten zählen nicht auf die Objektgrenze; archivierte Interessenten zählen nicht auf das Interessenten-Limit. 14 Tage kostenlose Testphase für Plus vorgesehen, ohne Zahlungsdaten. Tarif-Logik (Limits, Funktionsfreigaben) soll von Anfang an als zentrale Einstellung gebaut werden, auch vor dem Start der Bezahlung.

## 3. Rechner

Jeder Rechner läuft in zwei Modi mit identischer Rechenlogik: ohne Login leer und ohne Speicherung (SEO), im Objekt vorbefüllt mit Stammdaten und mit speicherbaren Ergebnissen.

### Basis-Analyse (Free)
- **Kaufnebenkosten:** Kaufpreis, Bundesland, Notar/Grundbuch (~2 %), Makler → Grunderwerbsteuer nach Bundesland, Nebenkosten in € und %, Gesamtinvestition.
- **Rendite:** Kaufpreis, Nebenkosten, Jahreskaltmiete, nicht umlagefähige Kosten, Leerstand % → Brutto-/Nettorendite, Kaufpreisfaktor.
- **Finanzierung/Tilgungsplan:** Darlehen, Sollzins, anfängliche Tilgung, Zinsbindung, optional Sondertilgung → Monatsrate, Zins/Tilgung je Jahr, Restschuld, Gesamtzinsen, Jahr der Volltilgung. Monatliche Rechnung (Design-Entscheidung).
- **Cashflow (einfach):** Kaltmiete − Leerstand − nicht umlagefähige Kosten − Instandhaltungsrücklage − Kapitaldienst → Cashflow vor Steuer, monatlich/jährlich.
- **Mieterhöhung:** aktuelle Miete, letztes Erhöhungsdatum, Vergleichsmiete (Nutzereingabe), Erhöhungsart → zulässiger Betrag (Kappungsgrenze 20 %/15 % in drei Jahren), frühester Zeitpunkt, Index-/Staffelregeln. Hinweis "keine Rechtsberatung" Pflicht.

### Erweiterte Analyse (ab Plus)
- Steuerwirkung mit AfA (Orientierung, keine Steuerberatung; AfA-Sätze vor Start prüfen)
- Eigenkapitalrendite (Cashflow, Tilgung, Wertsteigerung getrennt)
- Maximaler Kaufpreis bei Zielrendite
- Anschlussfinanzierung mit Zinsszenarien
- Sensitivitätsanalyse
- Mehrere Szenarien je Objekt, mit Vergleichsansicht

### Portfolio-Auswertung (Pro)
Gesamtcashflow, Gesamtrestschuld, durchschnittliche Rendite und Beleihung über alle Bestandsobjekte.

### Später / SEO
Instandhaltungsrücklage, Modernisierungsumlage, Mietausfall/Leerstand; reine SEO-Rechner: Miete vs. Kaufen, Wohnflächenberechnung.

### Objektversion – zusätzliche Funktionen
Vorbefüllung aus Stammdaten mit Rückschreiben, ein gespeicherter Stand je Rechner (Free) bzw. mehrere Szenarien (Plus), Kennzahlen automatisch im Dashboard, Verknüpfung der Rechner untereinander (Nebenkosten → Rendite → Cashflow), Plausibilitätshinweise. Ab Plus: Verlauf (geplant vs. tatsächlich), Kopplung an Sanierungsplaner, Erinnerungen aus Rechnerwerten, PDF-Objektbericht.

## 4. Kaufprüfung und Sanierungsplaner

**Kaufprüfung (Basisvariante):** Interessenten-Objekte mit Status (beobachtet, besichtigt, Angebot abgegeben, gekauft, abgelehnt), Felder für Bezeichnung/Adresse, Objektart, Kaufpreis, Fläche, erwartete Miete, geplante Finanzierung, optional Inserats-Link. Basis-Analyse im Free-Tarif, mehrere Szenarien und Vergleich ab Plus. Eigener Dashboard-Bereich, getrennt vom Bestand. Überführung in den Bestand bei Status "gekauft" per Statuswechsel; bei erreichtem Objektlimit Upgrade-Hinweis.

**Sanierungsplaner (eigener Tab je Objekt):**
- Free: Maßnahme mit Bezeichnung, geschätzten Kosten, Status (geplant, beauftragt, erledigt), Kostensumme je Objekt.
- Ab Plus: zusätzlich Gewerk, Priorität, Zeitplan, Budget vs. Ist-Kosten mit Puffer, Angebote/Handwerker-Vergleich, Belege, Wirkung auf Rendite/Cashflow, Modernisierungsumlage (§ 559 BGB), steuerliche Einordnungshinweise (Erhaltungsaufwand/Herstellungskosten, anschaffungsnaher Aufwand innerhalb von drei Jahren), Links zu Förderprogrammen (nicht selbst berechnet).

## 5. Verwaltung

Liegt vollständig im Free-Tarif; Komfortfunktionen (Automatik, Auswertung, Bericht) ab Plus.

- **Mietverhältnisse:** je Einheit ein oder mehrere (aktuell/historisch), Mietbeginn/-ende, Kaltmiete, Nebenkostenvorauszahlung, Kaution, Mietart (normal/Index/Staffel) mit Terminen. Kein Mietverhältnis = Leerstand.
- **Mieter:** Name, E-Mail, Telefon, optional frühere Anschrift; n:m-Verknüpfung zum Mietverhältnis. Mit Namen und Kontaktdaten erfasst (bewusste Entscheidung). Keine Felder für Einkommen, Schufa, Ausweisdaten.
- **Einnahmen/Ausgaben:** Buchung mit Datum, Betrag, Kategorie (nach Anlage V), Objekt/Einheit, Notiz, Beleg; Merkmal "umlagefähig" für spätere Nebenkostenabrechnung.
- **Ab Plus:** wiederkehrende Buchungen mit manueller Eingangsbestätigung (Mieteingangskontrolle), Jahresauswertung (Soll/Ist, Anlage-V-Gliederung, kein Steuer-Export), PDF-Objektbericht.
- **Dokumente:** Upload PDF/Bilder, Zuordnung zu Objekt/Einheit/Mietverhältnis/Sanierungsmaßnahme, feste Kategorien, Speicherlimit je Tarif.
- **Erinnerungen:** manuell (Free) bzw. automatisch aus Daten (ab Plus): Zinsbindungsende, mögliche Mieterhöhung, Indexmiete-Prüfung, Staffelstufen, Mietvertragsende, Abrechnungsfristen. E-Mail und In-App.
- **Später (Pro):** Nebenkostenabrechnung, Bankimport, Vorlagen für Mieterhöhungsschreiben, Zugang für Steuerberater/Partner, Steuer-Export.

## 6. Datenschutz und Datenmodell

Da Mieterdaten im Free-Tarif liegen, gelten die DSGVO-Pflichten ab dem Start der Mieterverwaltung (Auftragsverarbeiter-Rolle):

- Auftragsverarbeitungsvertrag mit jedem Nutzer (Pflichtschritt bei Registrierung)
- AV-Verträge mit Hosting, Datenbank, E-Mail-Versand; EU-Serverstandort
- Verzeichnis der Verarbeitungstätigkeiten, dokumentierte technische Schutzmaßnahmen
- Löschkonzept für Mieterkontaktdaten nach Mietende; Buchungen/Belege getrennt wegen Aufbewahrungsfristen
- Datenschutzerklärung, Datenexport, Kontolöschung
- Datensparsamkeit (keine Einkommens-/Schufa-/Ausweisdaten)
- Vor Start: Prüfung von Vertrag und Löschkonzept durch Datenschutzberater/Anwalt

**Grundstruktur des Datenmodells:**

```
Konto → Objekt (Bestand oder Interessent, Statusfeld)
  Objekt → Einheit → Mietverhältnis ↔ Mieter
  Objekt → Darlehen
  Objekt → Sanierungsmaßnahme
  Objekt → Buchung
  Objekt → Dokument
```

Prinzipien: Interessent und Bestand in einer Objektstruktur (Statuswechsel statt Kopie bei Kauf); Darlehen als eigene Tabelle je Objekt; Mieter als eigene Tabelle mit n:m-Verknüpfung; Buchungen/Dokumente/Erinnerungen/Sanierungsmaßnahmen hängen am Objekt.

## 7. Bauabfolge

Empfohlen: Schritte 1–7 zuerst starten (öffentlicher Launch), Verwaltung danach.

1. Grundgerüst: Projekt, Datenbank (EU-Standort), Login, Konto
2. Datenmodell: Objekt (Bestand/Interessent), Einheit, Mietverhältnis, Darlehen
3. Tarif-Logik als zentrale Einstellung (Limits, Funktionsfreigaben; Bezahlung folgt später)
4. Oberfläche aus Design-Handoff: Dashboard, Objekt anlegen, Detailseite mit Tabs
5. Rechnerlogik als eigenes, automatisch getestetes Modul
6. Öffentliche Rechnerseiten für Suchmaschinen
7. Kaufprüfung und Sanierungsliste (Kosten, Status)
8. **8a** (danach): Einnahmen/Ausgaben, Erinnerungen, Jahresübersicht (kaum Personenbezug)
9. **8b** (danach): Mieter mit Namen/Kontaktdaten, Dokumente, inkl. AV-Vertrag und Löschkonzept
10. Plus-/Pro-Funktionen und Bezahlung

Rechnerlogik mit automatischen Tests absichern, insbesondere Mieterhöhung und Tilgungsplan. Start wird als Analyse- und Kaufprüfungstool für Kapitalanleger kommuniziert, Verwaltung als angekündigt.

## 8. Die ersten 90 Tage nach dem Start

Ziel: begründete Entscheidung über den nächsten Ausbau anhand von Kennzahlen. Messung wird am Tag 1 eingerichtet.

| Zeitraum | Ziel | Maßnahmen |
| --- | --- | --- |
| Tage 1–30 | Erste Nutzer legen ein Objekt an | Search Console/Indexierung, 10–20 Testnutzer + Interviews, E-Mail-Liste starten |
| Tage 31–60 | Erstes Signal zur Zahlungsbereitschaft | Onboarding verbessern, SEO-Artikel je Rechner, Social Media (Pareto), Warteliste "Plus ansehen" |
| Tage 61–90 | Entscheidung über nächsten Ausbau | Kennzahlen auswerten, Entscheidungsregeln anwenden |

**Kennzahlen (Startannahmen):** Registrierung 2–5 % der Besucher, Aktivierung (Objekt angelegt) ≥ 40 % der Konten, Rückkehr nach 30 Tagen ≥ 20 %, Warteliste Plus 5–10 % der aktivierten Nutzer.

**Entscheidungsregeln:** wenig Besucher → Kanalproblem, Inhalte verstärken; Besucher ohne Registrierung → Positionierung prüfen; Registrierung ohne Aktivierung → Onboarding vereinfachen; gute Aktivierung/Rückkehr → Verwaltung/Plus bauen; gute Nutzung ohne Warteliste-Interesse → Analyse nachschärfen vor Plus-Ausbau.

## 9. Analyse-Setup

Zweigleisig: Web-Analyse-Tool (EU-Hosting/Selbst-Hosting) für öffentliche Seiten, eigene Datenbank für alles hinter dem Login.

- **Tool-Kandidaten:** Plausible, Matomo, Umami, PostHog (EU-Cloud). Empfehlung für den Start: Plausible oder Umami (einfach, cookie-frei möglich).
- **Ereignisse:** `rechner_genutzt` (mit Rechnername), `registrierung_gestartet`, `registrierung_abgeschlossen`, `plus_warteliste`.
- **Aus der Datenbank:** Aktivierung (Konto mit ≥1 Objekt), Rückkehr (Anmeldung in den letzten 30 Tagen).
- **Zusätzlich:** Search Console für Suchbegriffe/Rankings/Indexierung.
- **Einrichtung:** Konto + AV-Vertrag beim Tool, Tracking-Code einbauen, Ereignisse definieren, Search Console verbinden, Testauslösung prüfen.
- **Datenschutz:** möglichst ohne Cookies/Personenbezug (Prüfung nötig, ob Einwilligungsbanner entfällt), keine E-Mail/Namen an das Tool, keine Session-Aufzeichnungen. Teil der Datenschutzprüfung vor Start der Mieterverwaltung.

## 10. Offene Punkte

- [ ] Preise und Limits (7,90 €/14,90 €, 10 Objekte Plus, 20 aktive Interessenten Free) gegen Wettbewerber prüfen und bestätigen
- [ ] AfA-Sätze und Grunderwerbsteuersätze je Bundesland vor Live-Gang gegen aktuelle Vorschriften prüfen
- [ ] Auftragsverarbeitungsvertrag und Löschkonzept anwaltlich prüfen lassen (vor Start der Mieterverwaltung)
- [ ] Rechtsform und Umsatzsteuer mit Steuerberater klären; Nebentätigkeitsgenehmigung beantragen
- [ ] Zahlungsdienstleister für Abos auswählen
- [ ] Design-Runde 2 vollständig in die Oberfläche übernehmen
- [ ] Konkrete Speicher- und Interessenten-Limits für Plus/Pro final festlegen
- [ ] Holding-Frage vor Gründung klären

---
*Ausführliche Tabellen, Formeln und Begründungen: Claude-Docs-Dokument "Funktionsplanung Immobilienverwaltung".*
