import { describe, expect, it } from "vitest";
import { beispielrechnungKaufnebenkosten } from "./beispielrechnung";

// Die Zahlen aus dem Design-Handoff der Startseite (Runde 4).
describe("beispielrechnungKaufnebenkosten", () => {
  const b = beispielrechnungKaufnebenkosten();

  it("Grunderwerbsteuer Bayern 3,5 % von 189.000 €", () => {
    expect(b.grunderwerbsteuer.satzProzent).toBe(3.5);
    expect(b.grunderwerbsteuer.betrag).toBe(6615);
  });
  it("Notar und Grundbuch zusammen 2,0 % = 3.780 €", () => {
    expect(b.notarGrundbuch.satzProzent).toBe(2);
    expect(b.notarGrundbuch.betrag).toBe(3780);
  });
  it("Makler 3,57 % = 6.747,30 €", () => {
    expect(b.makler.satzProzent).toBe(3.57);
    expect(b.makler.betrag).toBe(6747.3);
  });
  it("Summe 17.142,30 € und 9,07 % des Kaufpreises", () => {
    expect(b.summe).toBe(17142.3);
    expect(b.anteilProzent).not.toBeNull();
    expect(b.anteilProzent!.toFixed(2)).toBe("9.07");
  });
});
