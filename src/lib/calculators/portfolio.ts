// Kennzahlen über alle Immobilien eines Kontos hinweg, für die Übersichtsseite.
import {
  annuitaetMonat,
  cashflowMonat,
  jahreskaltmiete,
  kaltmieteMonatVermietet,
  type EinheitFuerBerechnung,
} from "./immobilie";

export type ImmobilieFuerPortfolio = {
  kaufpreis: number;
  einheiten: EinheitFuerBerechnung[];
  laufendeKostenMonat: number;
  darlehenBetrag: number | null;
  sollzinsProzent: number | null;
  tilgungProzent: number | null;
};

export function gesamtwert(immobilien: { kaufpreis: number }[]): number {
  return immobilien.reduce((summe, i) => summe + i.kaufpreis, 0);
}

export function monatsmiete(immobilien: { einheiten: EinheitFuerBerechnung[] }[]): number {
  return immobilien.reduce(
    (summe, i) => summe + jahreskaltmiete(i.einheiten) / 12,
    0,
  );
}

// Ø Rendite (Portfolio) = Summe der Jahresmieten ÷ Summe der Kaufpreise.
export function portfolioRendite(immobilien: { kaufpreis: number; einheiten: EinheitFuerBerechnung[] }[]): number | null {
  const kaufpreisSumme = gesamtwert(immobilien);
  if (kaufpreisSumme <= 0) return null;
  const jahresmieteSumme = immobilien.reduce((summe, i) => summe + jahreskaltmiete(i.einheiten), 0);
  return jahresmieteSumme / kaufpreisSumme;
}

export function anzahlEinheiten(immobilien: { einheiten: EinheitFuerBerechnung[] }[]): number {
  return immobilien.reduce((summe, i) => summe + i.einheiten.length, 0);
}

export function cashflowMonatPortfolio(immobilien: ImmobilieFuerPortfolio[]): number {
  return immobilien.reduce((summe, i) => {
    const annuitaet = annuitaetMonat(i.darlehenBetrag, i.sollzinsProzent, i.tilgungProzent);
    return summe + cashflowMonat(kaltmieteMonatVermietet(i.einheiten), annuitaet, i.laufendeKostenMonat);
  }, 0);
}
