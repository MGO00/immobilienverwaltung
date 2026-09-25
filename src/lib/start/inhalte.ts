// Inhalte der öffentlichen Startseite (Runde 4, Schritt 1). Die Texte folgen dem
// Design-Handoff (docs/design/runde-4/), aber mit den freigegebenen Korrekturen:
// nichts versprechen, was die App nicht kann (siehe CLAUDE.md, "Design",
// "Weitere Fälle, Startseite"). Mit [Platzhalter] markierte Texte müssen vor dem
// Livegang durch echte Angaben ersetzt werden (CLAUDE.md, "Vor der Veröffentlichung").

import { RECHNER_LISTE } from "@/lib/rechner/liste";

// Kacheln der Startseite: aus der einen Rechnerliste (src/lib/rechner/liste.ts), Texte dort.
export const START_RECHNER = RECHNER_LISTE.map((rechner) => ({
  nr: rechner.nr,
  titel: rechner.titel,
  text: rechner.start,
  href: `/rechner/${rechner.slug}`,
}));

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
    antwort:
      "In den Einstellungen unter „Konto“ kannst du dein Konto selbst löschen. Dabei werden alle deine Daten dauerhaft entfernt.",
  },
] as const;

export const START_FAQ_KONTAKT = "[Platzhalter] Kontaktadresse folgt mit dem Impressum.";
