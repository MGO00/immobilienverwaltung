import { describe, expect, it } from "vitest";
import { artikelMeta } from "./artikel";

describe("Artikel-Meta-Zeile", () => {
  it("zeigt Datum als TT.MM.JJJJ und die Lesedauer", () => {
    expect(artikelMeta({ datum: "2026-10-05", lesedauerMinuten: 6 })).toEqual(["05.10.2026", "6 Min. Lesezeit"]);
  });

  it("lässt fehlende Angaben weg", () => {
    expect(artikelMeta({})).toEqual([]);
    expect(artikelMeta({ lesedauerMinuten: 4 })).toEqual(["4 Min. Lesezeit"]);
  });
});
