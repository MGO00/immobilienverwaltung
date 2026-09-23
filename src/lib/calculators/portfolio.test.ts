import { describe, expect, it } from "vitest";
import {
  anzahlEinheiten,
  cashflowMonatPortfolio,
  gesamtwert,
  monatsmiete,
  portfolioRendite,
  type ImmobilieFuerPortfolio,
} from "./portfolio";

// Zwei synthetische Objekte: eines mit Finanzierung und vermieteter Einheit,
// eines ohne Finanzierung mit einer vermieteten und einer leeren Einheit.
const objektA: ImmobilieFuerPortfolio = {
  kaufpreis: 189000,
  einheiten: [{ kaltmieteMonat: 640, status: "vermietet" }],
  laufendeKostenMonat: 105,
  darlehenBetrag: 150000,
  sollzinsProzent: 3.8,
  tilgungProzent: 2.0,
};

const objektB: ImmobilieFuerPortfolio = {
  kaufpreis: 280000,
  einheiten: [
    { kaltmieteMonat: 1200, status: "vermietet" },
    { kaltmieteMonat: 900, status: "leer" },
  ],
  laufendeKostenMonat: 200,
  darlehenBetrag: null,
  sollzinsProzent: null,
  tilgungProzent: null,
};

const portfolio = [objektA, objektB];

describe("gesamtwert", () => {
  it("summiert die Kaufpreise aller Objekte", () => {
    expect(gesamtwert(portfolio)).toBe(469000);
  });
});

describe("monatsmiete", () => {
  it("summiert die Monatsmiete (nur vermietete Einheiten) über alle Objekte", () => {
    expect(monatsmiete(portfolio)).toBe(1840);
  });
});

describe("portfolioRendite", () => {
  it("Summe der Jahresmieten ÷ Summe der Kaufpreise", () => {
    expect(portfolioRendite(portfolio)).toBeCloseTo(0.047078, 5);
  });

  it("gibt null zurück ohne Objekte", () => {
    expect(portfolioRendite([])).toBeNull();
  });
});

describe("anzahlEinheiten", () => {
  it("zählt alle Einheiten über alle Objekte, auch leere", () => {
    expect(anzahlEinheiten(portfolio)).toBe(3);
  });
});

describe("cashflowMonatPortfolio", () => {
  it("summiert den Cashflow pro Objekt, mit und ohne Finanzierung", () => {
    // Objekt A: 640 − 725 (Annuität) − 105 = −190
    // Objekt B: 1200 − 0 (ohne Finanzierung) − 200 = 1000
    expect(cashflowMonatPortfolio(portfolio)).toBe(810);
  });
});
