import { describe, expect, it } from "vitest";
import {
  darlehenAusEigenkapital,
  tilgungsanteilAusRate,
  tilgungsplanJaehrlich,
  tilgungsplanMonatlich,
} from "./finanzierung";

describe("darlehenAusEigenkapital", () => {
  it("Gesamtinvestition minus Eigenkapital", () => {
    expect(darlehenAusEigenkapital(209922.3, 40000)).toBeCloseTo(169922.3, 2);
  });

  it("wird nicht negativ, wenn das Eigenkapital die Gesamtinvestition übersteigt", () => {
    expect(darlehenAusEigenkapital(200000, 250000)).toBe(0);
  });
});

describe("tilgungsplanMonatlich", () => {
  // Handrechenbares Beispiel: 100.000 € Darlehen, 4 % Zins, 2 % Tilgung.
  // Monatsrate = 100.000 × 6 % ÷ 12 = 500 €/Monat, Monatszins = 4 % ÷ 12.
  const plan = tilgungsplanMonatlich(100000, 4, 2, 12, new Date(2026, 0, 1));

  it("rechnet den ersten Monat exakt nach: Zinsanteil, Tilgungsanteil, Restschuld", () => {
    expect(plan[0]).toEqual({
      monatIndex: 0,
      jahr: 2026,
      monatImJahr: 1,
      zinsanteil: 333.33,
      tilgungsanteil: 166.67,
      restschuldNachher: 99833.33,
    });
  });

  it("liefert für jeden Monat des ersten Jahres den richtigen Kalendermonat", () => {
    expect(plan.map((m) => m.monatImJahr)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(plan.every((m) => m.jahr === 2026)).toBe(true);
  });

  it("die Restschuld nach 12 Monaten stimmt mit einer unabhängigen, geschlossenen Annuitätenformel überein", () => {
    // Referenzformel (nicht aus dem Produktivcode importiert):
    // B_n = P·(1+i)^n − A·((1+i)^n − 1) / i
    const p = 100000;
    const rate = 500;
    const i = 4 / 100 / 12;
    const n = 12;
    const referenzRestschuld = p * Math.pow(1 + i, n) - rate * ((Math.pow(1 + i, n) - 1) / i);

    expect(plan[11].restschuldNachher).toBeCloseTo(referenzRestschuld, 1);
  });

  it("kappt die letzte Rate, damit die Restschuld nie negativ wird", () => {
    // Darlehen, das mit dieser Rate in weniger als der angefragten Laufzeit getilgt ist.
    const kurzerPlan = tilgungsplanMonatlich(1000, 4, 100, 12, new Date(2026, 0, 1));
    expect(kurzerPlan.every((m) => m.restschuldNachher >= 0)).toBe(true);
    expect(kurzerPlan[kurzerPlan.length - 1].restschuldNachher).toBe(0);
  });

  it("plausibler erster Monat für das Design-Beispiel (169.922 €, 3,6 % Zins, 2,0 % Tilgung)", () => {
    const designPlan = tilgungsplanMonatlich(169922, 3.6, 2.0, 120, new Date(2026, 0, 1));
    expect(designPlan[0].zinsanteil).toBeCloseTo(509.77, 1);
    expect(designPlan.at(-1)!.restschuldNachher).toBeLessThan(169922);
  });
});

describe("tilgungsplanJaehrlich", () => {
  it("aggregiert nach Kalenderjahr und kennzeichnet Teiljahre über die Monatsanzahl", () => {
    const planMonatlich = tilgungsplanMonatlich(50000, 4, 2, 18, new Date(2026, 6, 1)); // Start: Juli 2026
    const jahre = tilgungsplanJaehrlich(planMonatlich);

    expect(jahre).toHaveLength(2);
    expect(jahre[0]).toMatchObject({ jahr: 2026, monate: 6 });
    expect(jahre[1]).toMatchObject({ jahr: 2027, monate: 12 });

    // Die Restschuld am Jahresende entspricht der Restschuld nach dem letzten Monat dieses Jahres.
    expect(jahre[0].restschuldEnde).toBe(planMonatlich[5].restschuldNachher);
    expect(jahre[1].restschuldEnde).toBe(planMonatlich[17].restschuldNachher);
  });
});

describe("tilgungsanteilAusRate", () => {
  it("isoliert den Tilgungsanteil aus einer bekannten Monatsrate", () => {
    // 700 € Rate, 169.922 € Darlehen, 3,6 % Zins → Zinsanteil ≈ 509,77 €.
    expect(tilgungsanteilAusRate(700, 169922, 3.6)).toBeCloseTo(190.23, 1);
  });

  it("gibt null zurück, wenn Darlehen oder Zins unbekannt sind", () => {
    expect(tilgungsanteilAusRate(700, null, null)).toBeNull();
  });
});
