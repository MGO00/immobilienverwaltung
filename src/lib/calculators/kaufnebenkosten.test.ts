import { describe, expect, it } from "vitest";
import { berechneKaufnebenkosten } from "./kaufnebenkosten";

// Beispiel aus der Design-README (Kaufpreis 189.000 €, Sachsen, mit Makler).
describe("berechneKaufnebenkosten", () => {
  it("berechnet alle vier Posten und die Summe wie im Design-Beispiel", () => {
    const ergebnis = berechneKaufnebenkosten(189000, 5.5, 1.5, 0.5, 3.57);

    expect(ergebnis.posten).toEqual([
      { bezeichnung: "Grunderwerbsteuer", satzProzent: 5.5, betrag: 10395.0 },
      { bezeichnung: "Notar", satzProzent: 1.5, betrag: 2835.0 },
      { bezeichnung: "Grundbuch", satzProzent: 0.5, betrag: 945.0 },
      { bezeichnung: "Makler", satzProzent: 3.57, betrag: 6747.3 },
    ]);
    expect(ergebnis.summe).toBe(20922.3);
    expect(ergebnis.anteilProzent).toBeCloseTo(11.07, 2);
    expect(ergebnis.gesamtinvestition).toBe(209922.3);
  });

  it("lässt den Maklerposten weg, wenn keine Maklerprovision anfällt", () => {
    const ergebnis = berechneKaufnebenkosten(189000, 5.5, 1.5, 0.5, null);

    expect(ergebnis.posten).toHaveLength(3);
    expect(ergebnis.posten.find((p) => p.bezeichnung === "Makler")).toBeUndefined();
    expect(ergebnis.summe).toBe(14175);
    expect(ergebnis.gesamtinvestition).toBe(203175);
  });

  it("gibt anteilProzent als null zurück, wenn der Kaufpreis 0 ist", () => {
    const ergebnis = berechneKaufnebenkosten(0, 5.5, 1.5, 0.5, 3.57);
    expect(ergebnis.anteilProzent).toBeNull();
    expect(ergebnis.summe).toBe(0);
  });
});
