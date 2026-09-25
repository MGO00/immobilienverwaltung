import { describe, expect, it } from "vitest";
import { immobilieSchema, type ImmobilieEingabe } from "./immobilie";

// Beispiel aus der Design-README (Eigentumswohnung), so wie es aus dem Formular
// kommt: Zahlenfelder als Text in deutscher Schreibweise.
const gueltig: ImmobilieEingabe = {
  art: "eigentumswohnung",
  bezeichnung: "ETW Südvorstadt",
  strasseHausnummer: null,
  plz: null,
  ort: "Leipzig",
  bundesland: "Sachsen",
  baujahr: "1998",
  grundstuecksflaecheQm: "",
  wohnflaecheQm: "58,5",
  kaufdatum: null,
  kaufpreis: "189.000",
  kaufnebenkostenBetrag: "17.142,50",
  ohneFinanzierung: false,
  darlehenBetrag: "150.000",
  sollzinsProzent: "3,5",
  tilgungProzent: "2.0",
  zinsbindungBis: null,
  kaltmieteMonat: "690",
  status: "vermietet",
  einheiten: [],
  laufendeKosten: { hausgeld: "180,40", grundsteuer: "" },
};

const meldungen = (eingabe: ImmobilieEingabe) => {
  const ergebnis = immobilieSchema.safeParse(eingabe);
  return ergebnis.success ? [] : ergebnis.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`);
};

describe("immobilieSchema (Zahlen als Text)", () => {
  it("liest alle Zahlenfelder in deutscher Schreibweise ein", () => {
    const daten = immobilieSchema.parse(gueltig);
    expect(daten).toMatchObject({
      baujahr: 1998,
      grundstuecksflaecheQm: null,
      wohnflaecheQm: 58.5,
      kaufpreis: 189000,
      kaufnebenkostenBetrag: 17142.5,
      darlehenBetrag: 150000,
      sollzinsProzent: 3.5,
      tilgungProzent: 2,
      kaltmieteMonat: 690,
      laufendeKosten: { hausgeld: 180.4, grundsteuer: 0 },
    });
  });

  it("liest Einheiten beim Mehrfamilienhaus, leere Kaltmiete zählt als 0", () => {
    const daten = immobilieSchema.parse({
      ...gueltig,
      art: "mehrfamilienhaus",
      kaltmieteMonat: "",
      status: null,
      einheiten: [
        { name: "EG links", flaecheQm: "62,4", kaltmieteMonat: "1.150", status: "vermietet" },
        { name: "DG", flaecheQm: "", kaltmieteMonat: "", status: "leer" },
      ],
    });
    expect(daten.einheiten).toEqual([
      { name: "EG links", flaecheQm: 62.4, kaltmieteMonat: 1150, status: "vermietet" },
      { name: "DG", flaecheQm: null, kaltmieteMonat: 0, status: "leer" },
    ]);
  });

  it("fängt einen Tausenderpunkt beim Zins über die Obergrenze ab", () => {
    expect(meldungen({ ...gueltig, sollzinsProzent: "1.500" })).toEqual([
      "sollzinsProzent: Der Zins darf höchstens 20 % betragen.",
    ]);
  });

  it("meldet ungültige Zahlen am richtigen Feld statt still 0 zu speichern", () => {
    expect(meldungen({ ...gueltig, kaufnebenkostenBetrag: "1,2,3" })).toEqual([
      "kaufnebenkostenBetrag: Bitte eine Zahl eingeben, z. B. 1.250,50.",
    ]);
    expect(meldungen({ ...gueltig, laufendeKosten: { hausgeld: "abc" } })).toEqual([
      "laufendeKosten: Bitte eine Zahl eingeben, z. B. 1.250,50.",
    ]);
    expect(meldungen({ ...gueltig, tilgungProzent: "2,555" })).toEqual([
      "tilgungProzent: Bitte höchstens 2 Nachkommastellen.",
    ]);
  });

  it("verlangt Kaufpreis und bei Wohnung/Haus eine Kaltmiete", () => {
    expect(meldungen({ ...gueltig, kaufpreis: "" })).toEqual([
      "kaufpreis: Trag den Kaufpreis ein — ohne ihn lässt sich keine Rendite rechnen.",
    ]);
    expect(meldungen({ ...gueltig, kaufpreis: "0" })).toEqual([
      "kaufpreis: Trag den Kaufpreis ein — ohne ihn lässt sich keine Rendite rechnen.",
    ]);
    expect(meldungen({ ...gueltig, kaltmieteMonat: "" })).toEqual(["kaltmieteMonat: Trag die Kaltmiete ein."]);
  });

  it("nimmt keine Zahlen mehr direkt an (nur Text, eingelesen mit parseDeZahl)", () => {
    expect(immobilieSchema.safeParse({ ...gueltig, kaufpreis: 189000 }).success).toBe(false);
  });
});
