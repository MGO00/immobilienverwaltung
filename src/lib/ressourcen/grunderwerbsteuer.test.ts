import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GrunderwerbsteuerTabelle } from "@/components/website/grunderwerbsteuer-tabelle";
import {
  GRUNDERWERBSTEUER_PROZENT,
  GRUNDERWERBSTEUER_STAND,
  bundeslandLabel,
  formatStandMonat,
  formatSteuersatz,
} from "@/lib/constants/steuersaetze";
import { grunderwerbsteuerStandText, grunderwerbsteuerZeilen } from "./grunderwerbsteuer";

// Zellen <td> der gerenderten Tabelle als [Bundesland, Satz]-Paare.
function tabellenZeilen(html: string): [string, string][] {
  const zellen = [...html.matchAll(/<td[^>]*>([^<]*)<\/td>/g)].map((treffer) => treffer[1]);
  const paare: [string, string][] = [];
  for (let i = 0; i < zellen.length; i += 2) paare.push([zellen[i], zellen[i + 1]]);
  return paare;
}

describe("Grunderwerbsteuer-Tabelle", () => {
  it("hat genau die 16 Bundesländer der Konstante, jedes genau einmal", () => {
    const zeilen = grunderwerbsteuerZeilen();
    expect(zeilen).toHaveLength(16);
    expect(new Set(zeilen.map((z) => z.bundesland))).toEqual(new Set(Object.keys(GRUNDERWERBSTEUER_PROZENT)));
  });

  it("verwendet genau die Sätze der Konstante", () => {
    for (const zeile of grunderwerbsteuerZeilen()) {
      expect(zeile.satz).toBe(GRUNDERWERBSTEUER_PROZENT[zeile.bundesland]);
      expect(zeile.satzText).toBe(formatSteuersatz(GRUNDERWERBSTEUER_PROZENT[zeile.bundesland]));
    }
  });

  it("ist alphabetisch sortiert", () => {
    const namen = grunderwerbsteuerZeilen().map((z) => z.bundesland);
    expect(namen[0]).toBe("Baden-Württemberg");
    expect(namen.at(-1)).toBe("Thüringen");
    expect(namen).toEqual([...namen].sort((a, b) => a.localeCompare(b, "de")));
  });

  it("zeigt in der gerenderten Tabelle alle 16 Länder mit dem Satz aus der Konstante", () => {
    const html = renderToStaticMarkup(createElement(GrunderwerbsteuerTabelle));
    const zeilen = tabellenZeilen(html);
    expect(zeilen).toHaveLength(16);
    for (const [land, satzText] of zeilen) {
      expect(GRUNDERWERBSTEUER_PROZENT[land]).toBeDefined();
      expect(satzText).toBe(formatSteuersatz(GRUNDERWERBSTEUER_PROZENT[land]));
    }
    expect(html).toContain(grunderwerbsteuerStandText());
  });

  it("formatiert Satz und Stand wie im Handoff", () => {
    expect(formatSteuersatz(5)).toBe("5,0 %");
    expect(formatSteuersatz(3.5)).toBe("3,5 %");
    expect(formatStandMonat("2026-09-22")).toBe("September 2026");
    expect(grunderwerbsteuerStandText()).toBe(
      `Stand: ${formatStandMonat(GRUNDERWERBSTEUER_STAND)}, Angaben ohne Gewähr`
    );
  });

  it("nutzt im Rechner dieselbe Formatierung (Bremen 5,5 %)", () => {
    expect(bundeslandLabel("Bremen")).toBe("Bremen · 5,5 %");
    const bremen = grunderwerbsteuerZeilen().find((z) => z.bundesland === "Bremen");
    expect(bremen?.satzText).toBe("5,5 %");
  });
});
