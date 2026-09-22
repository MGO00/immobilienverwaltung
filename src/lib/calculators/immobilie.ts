// Reine Berechnungsfunktionen für eine einzelne Immobilie. Formeln siehe
// CLAUDE.md, "Fachliche Regeln und Rechner". Automatisierte Tests mit den
// Beispieldaten aus der Design-README folgen in Meilenstein 4.

export type EinheitStatus = "vermietet" | "selbstgenutzt" | "leer";

export type EinheitFuerBerechnung = {
  kaltmieteMonat: number;
  status: EinheitStatus;
};

// Nur vermietete Einheiten zählen; selbstgenutzt und leer zählen mit 0.
export function jahreskaltmiete(einheiten: EinheitFuerBerechnung[]): number {
  const monatssumme = einheiten
    .filter((e) => e.status === "vermietet")
    .reduce((summe, e) => summe + e.kaltmieteMonat, 0);
  return monatssumme * 12;
}

export function kaltmieteMonatVermietet(einheiten: EinheitFuerBerechnung[]): number {
  return einheiten.filter((e) => e.status === "vermietet").reduce((summe, e) => summe + e.kaltmieteMonat, 0);
}

export function bruttorendite(jahreskaltmieteWert: number, kaufpreis: number): number | null {
  if (kaufpreis <= 0) return null;
  return jahreskaltmieteWert / kaufpreis;
}

export function nettorendite(
  jahreskaltmieteWert: number,
  laufendeKostenJahr: number,
  gesamtinvestitionWert: number,
): number | null {
  if (gesamtinvestitionWert <= 0) return null;
  return ((jahreskaltmieteWert - laufendeKostenJahr) / gesamtinvestitionWert) * 100;
}

export function kaufpreisfaktor(kaufpreis: number, jahreskaltmieteWert: number): number | null {
  if (jahreskaltmieteWert <= 0) return null;
  return kaufpreis / jahreskaltmieteWert;
}

export function gesamtinvestition(kaufpreis: number, kaufnebenkostenBetrag: number | null): number {
  return kaufpreis + (kaufnebenkostenBetrag ?? 0);
}

// Eigenkapital wird nicht gespeichert, sondern aus Gesamtinvestition und
// gespeichertem Darlehen abgeleitet.
export function eigenkapital(gesamtinvestitionWert: number, darlehenBetrag: number | null): number {
  return gesamtinvestitionWert - (darlehenBetrag ?? 0);
}

export function beleihungsauslauf(darlehenBetrag: number | null, kaufpreis: number): number | null {
  if (!darlehenBetrag || kaufpreis <= 0) return null;
  return (darlehenBetrag / kaufpreis) * 100;
}

export function annuitaetMonat(
  darlehenBetrag: number | null,
  sollzinsProzent: number | null,
  tilgungProzent: number | null,
): number | null {
  if (!darlehenBetrag || sollzinsProzent === null || tilgungProzent === null) return null;
  return (darlehenBetrag * (sollzinsProzent + tilgungProzent)) / 100 / 12;
}

export function cashflowMonat(
  kaltmieteMonatWert: number,
  annuitaetMonatWert: number | null,
  laufendeKostenMonat: number,
): number {
  return kaltmieteMonatWert - (annuitaetMonatWert ?? 0) - laufendeKostenMonat;
}

export function leerstandsquote(einheiten: EinheitFuerBerechnung[]): number | null {
  if (einheiten.length === 0) return null;
  const leer = einheiten.filter((e) => e.status === "leer").length;
  return leer / einheiten.length;
}

export function wohnflaecheGesamt(einheiten: { flaecheQm: number | null }[]): number | null {
  const bekannt = einheiten.filter((e) => e.flaecheQm !== null);
  if (bekannt.length === 0) return null;
  return bekannt.reduce((summe, e) => summe + (e.flaecheQm ?? 0), 0);
}
