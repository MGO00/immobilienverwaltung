import { describe, expect, it } from "vitest";
import { begrenzeLeerstandProzent, kaltmieteNachLeerstand } from "./leerstand";
import { cashflowMonat } from "./immobilie";

// Beispiel aus dem Cashflow-Rechner: Kaltmiete 640 €, Kosten 105 €, Rate 725 €.
describe("kaltmieteNachLeerstand", () => {
  it("mindert die Kaltmiete um den Leerstand", () => {
    expect(kaltmieteNachLeerstand(640, 5)).toBe(608);
    expect(kaltmieteNachLeerstand(1000, 10)).toBe(900);
  });

  it("lässt die Kaltmiete ohne Angabe oder bei 0 % unverändert", () => {
    expect(kaltmieteNachLeerstand(640, null)).toBe(640);
    expect(kaltmieteNachLeerstand(640, 0)).toBe(640);
  });

  it("ergibt bei 100 % keine Einnahmen", () => {
    expect(kaltmieteNachLeerstand(640, 100)).toBe(0);
  });

  it("rundet auf ganze Cent", () => {
    expect(kaltmieteNachLeerstand(100.01, 7)).toBe(93.01);
  });

  it("begrenzt ungültige Werte auf 0–100", () => {
    expect(kaltmieteNachLeerstand(640, -10)).toBe(640);
    expect(kaltmieteNachLeerstand(640, 250)).toBe(0);
    expect(kaltmieteNachLeerstand(640, Number.NaN)).toBe(640);
  });

  it("wird vor cashflowMonat angewendet: Cashflow sinkt um den Leerstand", () => {
    const ohne = cashflowMonat(640, 725, 105);
    const mit = cashflowMonat(kaltmieteNachLeerstand(640, 5), 725, 105);
    expect(ohne).toBe(-190);
    expect(mit).toBe(-222);
  });
});

describe("begrenzeLeerstandProzent", () => {
  it("gibt gültige Werte unverändert zurück", () => {
    expect(begrenzeLeerstandProzent(12.5)).toBe(12.5);
  });
});
