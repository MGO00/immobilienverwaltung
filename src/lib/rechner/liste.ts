// Die EINE Liste aller Rechner. Aus ihr entstehen die Karten auf /rechner und im
// Rechner-Tab der Detailseite, die Kacheln der Startseite (START_RECHNER), die
// Glossar-Links und alle Texte, die die Anzahl der Rechner nennen ("Fünf Rechner …").
// Ein neuer Rechner wird nur hier eingetragen; keine Zahl fest in Texte schreiben.
export const RECHNER_LISTE = [
  {
    nr: "01",
    slug: "kaufnebenkosten",
    titel: "Kaufnebenkosten",
    karte: "Grunderwerbsteuer, Notar, Grundbuch und Makler auf einen Blick.",
    start: "Grunderwerbsteuer nach Bundesland, Notar, Grundbuch und Makler in Euro.",
    mitInteressent: true,
  },
  {
    nr: "02",
    slug: "rendite",
    titel: "Rendite",
    karte: "Brutto- und Nettorendite sowie Kaufpreisfaktor.",
    start: "Brutto- und Nettorendite sowie Kaufpreisfaktor aus Miete und Gesamtkosten.",
    mitInteressent: true,
  },
  {
    nr: "03",
    slug: "finanzierung",
    titel: "Finanzierung",
    karte: "Annuität, Beleihungsauslauf und Tilgungsplan.",
    start: "Annuität, Restschuld am Ende der Zinsbindung und Tilgungsplan pro Jahr.",
    mitInteressent: true,
  },
  {
    nr: "04",
    slug: "cashflow",
    titel: "Cashflow",
    karte: "Miete, laufende Kosten und Finanzierung zusammen.",
    start: "Miete minus Rate und laufende Kosten, monatlich und auf das Jahr gerechnet.",
    mitInteressent: true,
  },
  {
    nr: "05",
    slug: "mieterhoehung",
    titel: "Mieterhöhung",
    karte: "Erhöhung nach Mietspiegel oder Indexmiete, mit Kappungsgrenze und Fristen.",
    start: "Neue Miete nach Mietspiegel oder Indexmiete, mit Kappungsgrenze und dem Datum, ab dem sie gilt.",
    // Ein Interessent aus der Kaufprüfung hat noch keinen Mietvertrag, der sich erhöhen ließe.
    mitInteressent: false,
  },
] as const;

export type RechnerEintrag = (typeof RECHNER_LISTE)[number];

const ZAHLWORT = ["null", "ein", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn"];

/** Anzahl der Rechner als Wort: "fünf", mit gross = true "Fünf". */
export function rechnerAnzahl(gross = false): string {
  const wort = ZAHLWORT[RECHNER_LISTE.length] ?? String(RECHNER_LISTE.length);
  return gross ? wort.charAt(0).toUpperCase() + wort.slice(1) : wort;
}

/** "Kaufnebenkosten, Rendite, Finanzierung, Cashflow und Mieterhöhung" */
export function rechnerAufzaehlung(): string {
  const titel = RECHNER_LISTE.map((r) => r.titel);
  return titel.length > 1 ? `${titel.slice(0, -1).join(", ")} und ${titel.at(-1)}` : titel.join("");
}
