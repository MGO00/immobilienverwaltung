import { describe, expect, it } from "vitest";
import {
  annuitaetMonat,
  beleihungsauslauf,
  bruttorendite,
  cashflowMonat,
  eigenkapital,
  gesamtinvestition,
  jahreskaltmiete,
  kaltmieteMonatVermietet,
  kaufpreisfaktor,
  leerstandsquote,
  nettorendite,
  wohnflaecheGesamt,
  type EinheitFuerBerechnung,
} from "./immobilie";

// Durchgängiges Beispiel (bereits gegen die echte App verifiziert, siehe
// Meilenstein-3-Abschlusstest): ETW, Kaufpreis 189.000 €, Kaufnebenkosten
// 11.723 € (Gesamtinvestition 200.723 €), Darlehen 150.000 €, Sollzins 3,8 %,
// Tilgung 2,0 %, Kaltmiete 640 €/Monat, laufende Kosten 105 €/Monat
// (Hausgeld 62 + Rücklage 25 + Grundsteuer 10 + Versicherung 8).
const KAUFPREIS = 189000;
const GESAMTINVESTITION = 200723;
const DARLEHEN = 150000;
const SOLLZINS = 3.8;
const TILGUNG = 2.0;
const KALTMIETE_MONAT = 640;
const KOSTEN_MONAT = 105;
const JAHRESKALTMIETE = KALTMIETE_MONAT * 12; // 7680

const gemischteEinheiten: EinheitFuerBerechnung[] = [
  { kaltmieteMonat: KALTMIETE_MONAT, status: "vermietet" },
  { kaltmieteMonat: 800, status: "leer" },
  { kaltmieteMonat: 900, status: "selbstgenutzt" },
];

describe("jahreskaltmiete", () => {
  it("zählt nur vermietete Einheiten, leere und selbstgenutzte mit 0", () => {
    expect(jahreskaltmiete(gemischteEinheiten)).toBe(JAHRESKALTMIETE);
  });
});

describe("kaltmieteMonatVermietet", () => {
  it("summiert nur die Kaltmiete vermieteter Einheiten", () => {
    expect(kaltmieteMonatVermietet(gemischteEinheiten)).toBe(KALTMIETE_MONAT);
  });
});

describe("bruttorendite", () => {
  it("gibt einen Anteil zurück (kein Prozentwert) — 640 €/Monat auf 189.000 € Kaufpreis", () => {
    // Regressionsschutz: bruttorendite() rechnet NICHT ×100, anders als
    // nettorendite(). Die UI muss selbst ×100 rechnen (siehe Rendite-Rechner).
    expect(bruttorendite(JAHRESKALTMIETE, KAUFPREIS)).toBeCloseTo(0.040635, 5);
  });

  it("gibt null zurück, wenn der Kaufpreis 0 oder kleiner ist", () => {
    expect(bruttorendite(JAHRESKALTMIETE, 0)).toBeNull();
  });
});

describe("nettorendite", () => {
  it("rechnet bereits in Prozent — Jahreskaltmiete abzüglich laufender Kosten pro Jahr", () => {
    expect(nettorendite(JAHRESKALTMIETE, KOSTEN_MONAT * 12, GESAMTINVESTITION)).toBeCloseTo(3.1983, 3);
  });

  it("gibt null zurück, wenn die Gesamtinvestition 0 oder kleiner ist", () => {
    expect(nettorendite(JAHRESKALTMIETE, 1260, 0)).toBeNull();
  });
});

describe("kaufpreisfaktor", () => {
  it("Kaufpreis ÷ Jahreskaltmiete", () => {
    expect(kaufpreisfaktor(KAUFPREIS, JAHRESKALTMIETE)).toBeCloseTo(24.609375, 5);
  });

  it("gibt null zurück, wenn keine Jahreskaltmiete anfällt", () => {
    expect(kaufpreisfaktor(KAUFPREIS, 0)).toBeNull();
  });
});

describe("gesamtinvestition", () => {
  it("addiert Kaufpreis und Kaufnebenkosten", () => {
    expect(gesamtinvestition(KAUFPREIS, 11723)).toBe(GESAMTINVESTITION);
  });

  it("nimmt 0 an, wenn keine Kaufnebenkosten hinterlegt sind", () => {
    expect(gesamtinvestition(KAUFPREIS, null)).toBe(KAUFPREIS);
  });
});

describe("eigenkapital", () => {
  it("Gesamtinvestition minus Darlehen", () => {
    expect(eigenkapital(GESAMTINVESTITION, DARLEHEN)).toBe(50723);
  });

  it("entspricht der vollen Gesamtinvestition ohne Darlehen (kein Darlehen hinterlegt)", () => {
    expect(eigenkapital(GESAMTINVESTITION, null)).toBe(GESAMTINVESTITION);
  });
});

describe("beleihungsauslauf", () => {
  it("Darlehen ÷ Kaufpreis in Prozent", () => {
    expect(beleihungsauslauf(DARLEHEN, KAUFPREIS)).toBeCloseTo(79.36508, 4);
  });

  it("gibt 0 zurück bei einem Darlehen von genau 0 (kein Falsy-Bug)", () => {
    expect(beleihungsauslauf(0, KAUFPREIS)).toBe(0);
  });

  it("gibt null zurück ohne Darlehen", () => {
    expect(beleihungsauslauf(null, KAUFPREIS)).toBeNull();
  });
});

describe("annuitaetMonat", () => {
  it("Darlehen × (Zins % + Tilgung %) ÷ 12", () => {
    expect(annuitaetMonat(DARLEHEN, SOLLZINS, TILGUNG)).toBe(725);
  });

  it("gibt 0 zurück bei einem Darlehen von genau 0 (kein Falsy-Bug)", () => {
    expect(annuitaetMonat(0, SOLLZINS, TILGUNG)).toBe(0);
  });

  it("gibt null zurück ohne Darlehen", () => {
    expect(annuitaetMonat(null, SOLLZINS, TILGUNG)).toBeNull();
  });
});

describe("cashflowMonat", () => {
  it("Kaltmiete minus Annuität minus laufende Kosten", () => {
    expect(cashflowMonat(KALTMIETE_MONAT, 725, KOSTEN_MONAT)).toBe(-190);
  });

  it("ignoriert die Annuität, wenn ohne Finanzierung gekauft wurde", () => {
    expect(cashflowMonat(KALTMIETE_MONAT, null, KOSTEN_MONAT)).toBe(535);
  });
});

describe("leerstandsquote", () => {
  it("Anteil leerer Einheiten an allen Einheiten", () => {
    expect(leerstandsquote(gemischteEinheiten)).toBeCloseTo(1 / 3, 5);
  });

  it("gibt null zurück ohne Einheiten", () => {
    expect(leerstandsquote([])).toBeNull();
  });
});

describe("wohnflaecheGesamt", () => {
  it("summiert die bekannten Flächen, ignoriert unbekannte", () => {
    expect(wohnflaecheGesamt([{ flaecheQm: 55 }, { flaecheQm: null }, { flaecheQm: 30 }])).toBe(85);
  });

  it("gibt null zurück, wenn keine Fläche bekannt ist", () => {
    expect(wohnflaecheGesamt([{ flaecheQm: null }])).toBeNull();
  });
});
