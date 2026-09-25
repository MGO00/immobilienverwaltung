import { describe, expect, it } from "vitest";
import { formatEingabe, formatEingabeOptional, parseDeZahl, parseDeZahlDetails } from "./zahl";

describe("parseDeZahl", () => {
  it("liest Komma als Dezimalzeichen und Punkte davor als Tausendertrenner", () => {
    expect(parseDeZahl("189.000,50")).toBe(189000.5);
    expect(parseDeZahl("1.250.000,99")).toBe(1250000.99);
    expect(parseDeZahl("1234,56")).toBe(1234.56);
    expect(parseDeZahl("1,5")).toBe(1.5);
    expect(parseDeZahl("0,25")).toBe(0.25);
    expect(parseDeZahl(",5")).toBe(0.5);
  });

  it("liest Punkte vor genau drei Ziffern ohne Komma als Tausendertrenner", () => {
    expect(parseDeZahl("189.000")).toBe(189000);
    expect(parseDeZahl("1.500")).toBe(1500);
    expect(parseDeZahl("1.250.000")).toBe(1250000);
  });

  it("liest sonst einen einzelnen Punkt als Dezimalzeichen", () => {
    expect(parseDeZahl("3.5")).toBe(3.5);
    expect(parseDeZahl("1.50")).toBe(1.5);
    expect(parseDeZahl("3.5712")).toBe(3.5712);
    expect(parseDeZahl("0.500")).toBe(0.5);
    expect(parseDeZahl(".5")).toBe(0.5);
  });

  it("liest ganze Zahlen und entfernt Leerzeichen am Rand", () => {
    expect(parseDeZahl("0")).toBe(0);
    expect(parseDeZahl("189000")).toBe(189000);
    expect(parseDeZahl("  1,5  ")).toBe(1.5);
    expect(parseDeZahl("\t2026\n")).toBe(2026);
  });

  it("lehnt alles andere ab, statt still 0 oder eine andere Zahl zu liefern", () => {
    for (const text of [
      "",
      "   ",
      "abc",
      "1,2,3",
      "1.23.4",
      "1.234.5",
      "1..5",
      "1.23,4",
      "1,234.5",
      "5,",
      "5.",
      ",",
      ".",
      "1 000",
      "189 000",
      "1e5",
      "+5",
      "5 €",
      "3,5 %",
      "0x10",
      "Infinity",
      "NaN",
    ]) {
      expect(parseDeZahl(text), text).toBeNull();
    }
  });

  it("erlaubt ein Minus nur ausdrücklich", () => {
    expect(parseDeZahl("-5")).toBeNull();
    expect(parseDeZahl("-1,5")).toBeNull();
    expect(parseDeZahl("-5", { erlaubeMinus: true })).toBe(-5);
    expect(parseDeZahl("-1.500,5", { erlaubeMinus: true })).toBe(-1500.5);
    expect(parseDeZahl("-0", { erlaubeMinus: true })).toBe(0);
    expect(parseDeZahl("--5", { erlaubeMinus: true })).toBeNull();
    expect(parseDeZahl("-", { erlaubeMinus: true })).toBeNull();
  });
});

describe("parseDeZahlDetails", () => {
  it("zählt nur bedeutsame Nachkommastellen", () => {
    expect(parseDeZahlDetails("3,575")?.nachkommastellen).toBe(3);
    expect(parseDeZahlDetails("1,50")?.nachkommastellen).toBe(1);
    expect(parseDeZahlDetails("189.000")?.nachkommastellen).toBe(0);
    expect(parseDeZahlDetails("189.000,00")?.nachkommastellen).toBe(0);
    expect(parseDeZahlDetails("3.5")?.nachkommastellen).toBe(1);
  });
});

describe("formatEingabe", () => {
  it("zeigt Komma, keine Tausenderpunkte, keine überflüssigen Nullen", () => {
    expect(formatEingabe(1.5)).toBe("1,5");
    expect(formatEingabe(3.57)).toBe("3,57");
    expect(formatEingabe(3.6)).toBe("3,6");
    expect(formatEingabe(189000)).toBe("189000");
    expect(formatEingabe(189000.5)).toBe("189000,5");
    expect(formatEingabe(2)).toBe("2");
    expect(formatEingabe(0)).toBe("0");
  });

  it("entfernt Rechenreste aus Summen", () => {
    expect(formatEingabe(0.1 + 0.2)).toBe("0,3");
    expect(formatEingabe(1.005 * 3)).toBe("3,015");
  });

  it("lässt sich verlustfrei wieder einlesen", () => {
    for (const zahl of [0, 1.5, 3.57, 189000, 189000.5, 1250000.99, 0.25, 20]) {
      expect(parseDeZahl(formatEingabe(zahl))).toBe(zahl);
    }
  });

  it("zeigt Geldbeträge mit genau 2 Nachkommastellen, ganze Beträge ohne", () => {
    const betrag = { betrag: true };
    expect(formatEingabe(189000.5, betrag)).toBe("189000,50");
    expect(formatEingabe(180.4, betrag)).toBe("180,40");
    expect(formatEingabe(17142.55, betrag)).toBe("17142,55");
    expect(formatEingabe(189000, betrag)).toBe("189000");
    expect(formatEingabe(0, betrag)).toBe("0");
    expect(formatEingabe(718.7512, betrag)).toBe("718,75");
    expect(formatEingabe(0.1 + 0.2, betrag)).toBe("0,30");
    expect(formatEingabe(99.999, betrag)).toBe("100");
    expect(formatEingabeOptional(180.4, betrag)).toBe("180,40");
    expect(formatEingabeOptional(null, betrag)).toBe("");
  });

  it("lässt Prozente und Flächen ohne überflüssige Nullen", () => {
    expect(formatEingabe(3.5)).toBe("3,5");
    expect(formatEingabe(58.5)).toBe("58,5");
  });

  it("lässt sich auch als Betrag verlustfrei wieder einlesen", () => {
    for (const zahl of [0, 0.5, 180.4, 189000, 189000.5, 1250000.99, 17142.55]) {
      expect(parseDeZahl(formatEingabe(zahl, { betrag: true }))).toBe(zahl);
    }
  });

  it("macht aus fehlenden Werten ein leeres Feld", () => {
    expect(formatEingabeOptional(null)).toBe("");
    expect(formatEingabeOptional(undefined)).toBe("");
    expect(formatEingabeOptional(3.5)).toBe("3,5");
  });
});
