import { describe, expect, it } from "vitest";
import {
  mieterhoehungIndex,
  mieterhoehungMietspiegel,
  monatsanfangAb,
  monatsanfangNach,
  plusJahre,
  type MietspiegelEingabe,
} from "./mieterhoehung";

// Beispiel aus der Vorgabe: 600 €, 60 m², Vergleichsmiete 11 €/m² (→ 660 €),
// Miete vor drei Jahren 550 €.
const basis: MietspiegelEingabe = {
  mieteAktuell: 600,
  flaecheQm: 60,
  vergleichsmieteQm: 11,
  mieteVorDreiJahren: 550,
  kappungProzent: 15,
  letzteErhoehungAb: "2025-03-01",
  heute: "2025-09-15",
};

describe("Datums-Hilfen", () => {
  it("addiert Jahre, der 29.02. wird im Nicht-Schaltjahr zum 01.03.", () => {
    expect(plusJahre("2025-03-01", 1)).toBe("2026-03-01");
    expect(plusJahre("2024-02-29", 1)).toBe("2025-03-01");
    expect(plusJahre("2026-06-01", -3)).toBe("2023-06-01");
  });

  it("findet den Monatsanfang n Monate später, auch über den Jahreswechsel", () => {
    expect(monatsanfangNach("2026-03-15", 3)).toBe("2026-06-01");
    expect(monatsanfangNach("2025-11-30", 3)).toBe("2026-02-01");
    expect(monatsanfangNach("2026-01-31", 3)).toBe("2026-04-01");
    expect(monatsanfangNach("2025-12-10", 2)).toBe("2026-02-01");
  });

  it("nimmt einen Monatsanfang selbst, sonst den nächsten", () => {
    expect(monatsanfangAb("2026-03-01")).toBe("2026-03-01");
    expect(monatsanfangAb("2026-03-15")).toBe("2026-04-01");
  });
});

describe("mieterhoehungMietspiegel (§ 558 BGB)", () => {
  it("Kappungsgrenze greift: 15 % auf 550 € → 632,50 €", () => {
    const e = mieterhoehungMietspiegel(basis)!;
    expect(e.grenzeVergleichsmiete).toBe(660);
    expect(e.grenzeKappung).toBe(632.5);
    expect(e.greifendeGrenze).toBe("kappung");
    expect(e.erhoehungMoeglich).toBe(true);
    expect(e.neueMiete).toBe(632.5);
    expect(e.erhoehungEuro).toBe(32.5);
    expect(e.erhoehungProzent).toBeCloseTo(5.4167, 4);
    expect(e.mieteQmVorher).toBe(10);
    expect(e.mieteQmNachher).toBe(10.54);
  });

  it("Vergleichsmiete greift: 20 % → 660 € (bei Gleichstand gilt die Vergleichsmiete)", () => {
    const e = mieterhoehungMietspiegel({ ...basis, kappungProzent: 20 })!;
    expect(e.grenzeKappung).toBe(660);
    expect(e.greifendeGrenze).toBe("vergleichsmiete");
    expect(e.neueMiete).toBe(660);
    expect(e.erhoehungEuro).toBe(60);
    expect(e.erhoehungProzent).toBeCloseTo(10, 6);
  });

  it("keine Erhöhung, wenn die Miete schon auf dem Mietspiegel liegt", () => {
    const e = mieterhoehungMietspiegel({ ...basis, vergleichsmieteQm: 10 })!;
    expect(e.erhoehungMoeglich).toBe(false);
    expect(e.greifendeGrenze).toBe("vergleichsmiete");
    expect(e.neueMiete).toBe(600);
    expect(e.erhoehungEuro).toBe(0);
    expect(e.erhoehungProzent).toBe(0);
  });

  it("keine Erhöhung, wenn die Kappungsgrenze ausgeschöpft ist", () => {
    const e = mieterhoehungMietspiegel({ ...basis, mieteVorDreiJahren: 520 })!;
    expect(e.grenzeKappung).toBe(598);
    expect(e.erhoehungMoeglich).toBe(false);
    expect(e.greifendeGrenze).toBe("kappung");
  });

  it("Fristen: letzte Erhöhung 01.03.2025, heute 15.09.2025 → Zugang 01.03.2026, ab 01.06.2026", () => {
    const e = mieterhoehungMietspiegel(basis)!;
    expect(e.fruehesterZugang).toBe("2026-03-01");
    expect(e.zugang).toBe("2026-03-01");
    expect(e.wirksamAb).toBe("2026-06-01");
    expect(e.stichtagKappung).toBe("2023-06-01");
  });

  it("warnt bei zu frühem Zugang (nicht still verschoben) und rechnet mit dem frühesten", () => {
    expect(mieterhoehungMietspiegel(basis)!.zugangZuFrueh).toBe(true);
    const geplant = mieterhoehungMietspiegel({ ...basis, heute: "2025-09-15", geplanterZugang: "2025-12-01" })!;
    expect(geplant.zugangZuFrueh).toBe(true);
    expect(geplant.zugang).toBe("2026-03-01");
    expect(geplant.wirksamAb).toBe("2026-06-01");
  });

  it("Fristen: heute 10.07.2026 → Zugang 10.07.2026, ab 01.10.2026", () => {
    const e = mieterhoehungMietspiegel({ ...basis, heute: "2026-07-10" })!;
    expect(e.zugangZuFrueh).toBe(false);
    expect(e.zugang).toBe("2026-07-10");
    expect(e.wirksamAb).toBe("2026-10-01");
  });

  it("Fristen: Zugang im November → ab 1. Februar; Zugang am frühesten Tag ist erlaubt", () => {
    expect(mieterhoehungMietspiegel({ ...basis, heute: "2026-11-20" })!.wirksamAb).toBe("2027-02-01");
    const genau = mieterhoehungMietspiegel({ ...basis, heute: "2025-01-01", geplanterZugang: "2026-03-01" })!;
    expect(genau.zugangZuFrueh).toBe(false);
    expect(genau.wirksamAb).toBe("2026-06-01");
  });

  it("liefert kein Ergebnis ohne Wohnfläche", () => {
    expect(mieterhoehungMietspiegel({ ...basis, flaecheQm: 0 })).toBeNull();
  });
});

describe("mieterhoehungIndex (§ 557b BGB)", () => {
  const index = {
    mieteAktuell: 800,
    indexAlt: 117.8,
    indexNeu: 121.3,
    letzteAnpassungAb: "2024-07-01",
    heute: "2025-09-10",
  };

  it("800 € × 121,3 ÷ 117,8 = 823,77 €", () => {
    const e = mieterhoehungIndex(index)!;
    expect(e.neueMiete).toBe(823.77);
    expect(e.aenderungEuro).toBe(23.77);
    expect(e.aenderungProzent).toBeCloseTo(2.9711, 4);
  });

  it("fallender Index senkt die Miete", () => {
    const e = mieterhoehungIndex({ ...index, indexAlt: 121.3, indexNeu: 117.8 })!;
    expect(e.neueMiete).toBe(776.92);
    expect(e.aenderungEuro).toBe(-23.08);
    expect(e.aenderungProzent).toBeLessThan(0);
  });

  it("Zugang im September → ab 1. November, im Dezember → ab 1. Februar", () => {
    const september = mieterhoehungIndex(index)!;
    expect(september.wirksamAb).toBe("2025-11-01");
    expect(september.sperrjahrGreift).toBe(false);
    expect(mieterhoehungIndex({ ...index, heute: "2025-12-15" })!.wirksamAb).toBe("2026-02-01");
  });

  it("Sperrjahr: letzte Anpassung 01.03.2025, Zugang 10.11.2025 → nicht 01.01.2026, sondern 01.03.2026", () => {
    const e = mieterhoehungIndex({ ...index, letzteAnpassungAb: "2025-03-01", geplanterZugang: "2025-11-10" })!;
    expect(e.wirksamNachZugang).toBe("2026-01-01");
    expect(e.wirksamAb).toBe("2026-03-01");
    expect(e.sperrjahrGreift).toBe(true);
    expect(e.sichererZugangAb).toBe("2026-03-01");
  });

  it("Sperrjahr endet mitten im Monat → erst ab dem nächsten Monatsanfang", () => {
    const e = mieterhoehungIndex({ ...index, letzteAnpassungAb: "2025-03-15", geplanterZugang: "2025-12-01" })!;
    expect(e.wirksamNachZugang).toBe("2026-02-01");
    expect(e.wirksamAb).toBe("2026-04-01");
    expect(e.sperrjahrGreift).toBe(true);
  });

  it("liefert kein Ergebnis bei Index 0", () => {
    expect(mieterhoehungIndex({ ...index, indexAlt: 0 })).toBeNull();
  });
});
