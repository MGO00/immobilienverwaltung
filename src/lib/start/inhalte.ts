// Inhalte der öffentlichen Startseite (Runde 4, Schritt 1). Die Texte folgen dem
// Design-Handoff (docs/design/runde-4/), aber mit den freigegebenen Korrekturen:
// nichts versprechen, was die App nicht kann (siehe CLAUDE.md, "Design",
// "Weitere Fälle, Startseite"). Mit [Platzhalter] markierte Texte müssen vor dem
// Livegang durch echte Angaben ersetzt werden (CLAUDE.md, "Vor der Veröffentlichung").

export const START_RECHNER = [
  {
    nr: "01",
    titel: "Kaufnebenkosten",
    text: "Grunderwerbsteuer nach Bundesland, Notar, Grundbuch und Makler in Euro.",
    href: "/rechner/kaufnebenkosten",
  },
  {
    nr: "02",
    titel: "Rendite",
    text: "Brutto- und Nettorendite sowie Kaufpreisfaktor aus Miete und Gesamtkosten.",
    href: "/rechner/rendite",
  },
  {
    nr: "03",
    titel: "Finanzierung",
    text: "Annuität, Restschuld am Ende der Zinsbindung und Tilgungsplan pro Jahr.",
    href: "/rechner/finanzierung",
  },
  {
    nr: "04",
    titel: "Cashflow",
    text: "Miete minus Rate und laufende Kosten, monatlich und auf das Jahr gerechnet.",
    href: "/rechner/cashflow",
  },
] as const;

export const START_SCHRITTE = [
  {
    nr: "1",
    titel: "Rechnen",
    text: "Probier die Rechner ohne Konto aus. Deine Eingaben werden nicht gespeichert.",
  },
  {
    nr: "2",
    titel: "Konto anlegen",
    text: "Kostenlos, mit E-Mail-Adresse. Ergebnisse des Kaufnebenkosten-Rechners kannst du direkt einer Immobilie zuordnen.",
  },
  {
    nr: "3",
    titel: "Immobilie erfassen",
    text: "In drei Schritten: Objekt, Kauf und Finanzierung, Miete und Kosten. Ein Foto ist optional.",
  },
  {
    nr: "4",
    titel: "Überblick behalten",
    text: "Miete, Rendite und Cashflow je Objekt und für alle Objekte zusammen auf einer Seite.",
  },
] as const;

export const START_FAQ = [
  {
    frage: "Ist die App kostenlos?",
    antwort:
      "Die Rechner nutzt du ohne Konto und ohne Kosten. Das Konto ist im kostenlosen Tarif nutzbar. Bezahltarife sind für später geplant.",
  },
  {
    frage: "Brauche ich ein Konto für die Rechner?",
    antwort:
      "Nein. Ohne Konto werden deine Eingaben aber nicht gespeichert. Mit Konto kannst du Ergebnisse des Kaufnebenkosten-Rechners einer Immobilie zuordnen.",
  },
  {
    frage: "Werden meine Daten sicher gespeichert?",
    antwort: "[Platzhalter] Angaben zu Serverstandort, Verschlüsselung und Aufbewahrung folgen.",
  },
  {
    frage: "Wie genau sind die Ergebnisse?",
    antwort:
      "Alle Rechner rechnen vor Steuern. Der Finanzierungsrechner rechnet monatlich, wie bei einer Bank üblich. Die Ergebnisse sind keine Steuer- oder Anlageberatung.",
  },
  {
    frage: "Wie lösche ich mein Konto?",
    antwort: "[Platzhalter] Der genaue Ablauf zur Kontolöschung folgt mit den Rechtstexten.",
  },
] as const;

export const START_FAQ_KONTAKT = "[Platzhalter] Kontaktadresse folgt mit dem Impressum.";
