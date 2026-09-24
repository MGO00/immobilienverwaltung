import { describe, expect, it } from "vitest";
import { START_RECHNER } from "@/lib/start/inhalte";
import { GLOSSAR, glossarGruppen, glossarId } from "./glossar";
import { RESSOURCEN_KARTEN } from "./inhalte";

describe("Glossar", () => {
  it("hat sieben Einträge in den Gruppen B, K, N, T, Z", () => {
    expect(GLOSSAR).toHaveLength(7);
    const gruppen = glossarGruppen();
    expect(gruppen.map((g) => g.buchstabe)).toEqual(["B", "K", "N", "T", "Z"]);
    expect(gruppen.flatMap((g) => g.eintraege.map((e) => e.begriff))).toEqual([
      "Beleihungsauslauf",
      "Bruttorendite",
      "Kaufpreisfaktor",
      "Nettorendite",
      "Nicht umlagefähige Kosten",
      "Tilgung",
      "Zinsbindung",
    ]);
  });

  it("vergibt eindeutige Anker-IDs ohne Umlaute", () => {
    expect(glossarId("Kaufpreisfaktor")).toBe("glossar-kaufpreisfaktor");
    expect(glossarId("Nicht umlagefähige Kosten")).toBe("glossar-nicht-umlagefaehige-kosten");
    const ids = glossarGruppen().flatMap((g) => g.eintraege.map((e) => e.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^glossar-[a-z0-9-]+$/);
  });

  it("verlinkt jeden Eintrag auf einen vorhandenen Rechner mit Nummer", () => {
    const pfade = START_RECHNER.map((r) => r.href);
    const eintraege = glossarGruppen().flatMap((g) => g.eintraege);
    for (const eintrag of eintraege) expect(pfade).toContain(eintrag.href);
    const kaufpreisfaktor = eintraege.find((e) => e.begriff === "Kaufpreisfaktor");
    expect(kaufpreisfaktor?.linkText).toBe("Zum Rechner 02 · Rendite");
    expect(kaufpreisfaktor?.href).toBe("/rechner/rendite");
  });

  it("zählt die Werte auf den Ressourcen-Karten aus den Daten", () => {
    expect(RESSOURCEN_KARTEN.map((k) => k.meta)).toEqual(["Tabelle · 16 Bundesländer", "Glossar · 7 Begriffe"]);
  });
});
