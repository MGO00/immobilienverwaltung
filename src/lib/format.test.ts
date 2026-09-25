import { describe, expect, it } from "vitest";
import { formatArea, formatCurrency, formatDate, formatDezimal, formatPercent } from "./format";

describe("formatCurrency", () => {
  it("formatiert positive Beträge mit zwei Nachkommastellen", () => {
    expect(formatCurrency(1234.5)).toBe("1.234,50 €");
  });

  it("formatiert negative Beträge mit echtem Minuszeichen (U+2212), nicht mit Bindestrich", () => {
    const ergebnis = formatCurrency(-165);
    expect(ergebnis).toBe("−165,00 €");
    expect(ergebnis).not.toContain("-");
  });

  it("rundet auf ganze Beträge, wenn decimals=0 übergeben wird", () => {
    expect(formatCurrency(209922.3, 0)).toBe("209.922 €");
  });
});

describe("formatPercent", () => {
  it("formatiert Prozentwerte mit Komma", () => {
    expect(formatPercent(4.06)).toBe("4,06 %");
  });

  it("nutzt das echte Minuszeichen bei negativen Prozentwerten", () => {
    expect(formatPercent(-1.5)).toBe("−1,50 %");
  });

  it("formatiert mit wählbarer Stellenzahl (Renditen mit 1, Leerstandsquote mit 0)", () => {
    expect(formatPercent(5.2631, 1)).toBe("5,3 %");
    expect(formatPercent(0, 1)).toBe("0,0 %");
    expect(formatPercent(33.333, 0)).toBe("33 %");
  });
});

describe("formatDezimal", () => {
  it("formatiert den Kaufpreisfaktor mit Komma und einer Stelle", () => {
    expect(formatDezimal(18.46, 1)).toBe("18,5");
    expect(formatDezimal(22.8, 1)).toBe("22,8");
    expect(formatDezimal(1234.56, 1)).toBe("1.234,6");
  });
});

describe("formatArea", () => {
  it("formatiert Quadratmeter", () => {
    expect(formatArea(58)).toBe("58 m²");
  });

  it("zeigt Nachkommastellen statt still zu runden", () => {
    expect(formatArea(58.5)).toBe("58,5 m²");
    expect(formatArea(72.25)).toBe("72,25 m²");
    expect(formatArea(1234)).toBe("1.234 m²");
  });
});

describe("formatDate", () => {
  it("formatiert im Format TT.MM.JJJJ", () => {
    expect(formatDate(new Date(2026, 8, 23))).toBe("23.09.2026");
  });
});
