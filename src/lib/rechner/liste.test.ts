import { describe, expect, it } from "vitest";
import { rechnerMetadata, startseiteMetadata } from "@/lib/seo/rechner";
import { START_RECHNER } from "@/lib/start/inhalte";
import { RECHNER_LISTE, rechnerAnzahl, rechnerAufzaehlung } from "./liste";

describe("Rechnerliste als einzige Quelle", () => {
  it("nennt Anzahl und Namen aus der Liste", () => {
    expect(RECHNER_LISTE).toHaveLength(5);
    expect(rechnerAnzahl()).toBe("fünf");
    expect(rechnerAnzahl(true)).toBe("Fünf");
    expect(rechnerAufzaehlung()).toBe("Kaufnebenkosten, Rendite, Finanzierung, Cashflow und Mieterhöhung");
  });

  it("vergibt fortlaufende Nummern und eindeutige Pfade", () => {
    expect(RECHNER_LISTE.map((r) => r.nr)).toEqual(["01", "02", "03", "04", "05"]);
    expect(new Set(RECHNER_LISTE.map((r) => r.slug)).size).toBe(RECHNER_LISTE.length);
  });

  it("baut die Startseiten-Kacheln aus der Liste", () => {
    expect(START_RECHNER.map((r) => r.href)).toEqual(RECHNER_LISTE.map((r) => `/rechner/${r.slug}`));
  });

  it("zeigt die Mieterhöhung nicht beim Interessenten", () => {
    expect(RECHNER_LISTE.filter((r) => !r.mitInteressent).map((r) => r.slug)).toEqual(["mieterhoehung"]);
  });

  it("schreibt in Beschreibungen keine veraltete Zahl", () => {
    const texte = [String(rechnerMetadata("uebersicht").description), String(startseiteMetadata().description)];
    for (const text of texte) {
      expect(text).not.toMatch(/\bvier\b/i);
      expect(text).toContain("Mieterhöhung");
    }
  });
});
