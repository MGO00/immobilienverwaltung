import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { grenzeFuer, limitErreicht, limitMeldung, TARIFE, type GrenzArt, type Tarif } from "./constants/tarife";

const MIGRATIONEN = path.join(__dirname, "../../supabase/migrations");
const DB_ART: Record<string, GrenzArt> = { immobilien: "immobilien", aktive_interessenten: "aktiveInteressenten" };

// Liest den TARIFE-Block aus der neuesten Migration, die einen enthält.
function tarifeAusDatenbank(): { datei: string; werte: Map<string, number | null> } {
  const dateien = readdirSync(MIGRATIONEN).filter((d) => d.endsWith(".sql")).sort();
  for (const datei of [...dateien].reverse()) {
    const sql = readFileSync(path.join(MIGRATIONEN, datei), "utf8");
    const block = sql.match(/-- TARIFE:BEGIN([\s\S]*?)-- TARIFE:END/);
    if (!block) continue;
    const werte = new Map<string, number | null>();
    for (const [, tarif, art, grenze] of block[1].matchAll(/\('(\w+)',\s*'(\w+)',\s*(\d+|null)\)/g)) {
      werte.set(`${tarif}/${art}`, grenze === "null" ? null : Number(grenze));
    }
    return { datei, werte };
  }
  throw new Error("Keine Migration mit TARIFE-Block gefunden.");
}

describe("Kopplung tarife.ts <-> Datenbank (tarif_grenze)", () => {
  const { datei, werte } = tarifeAusDatenbank();

  it(`jede Grenze aus tarife.ts steht identisch in ${datei}`, () => {
    for (const tarif of Object.keys(TARIFE) as Tarif[]) {
      for (const [dbArt, art] of Object.entries(DB_ART)) {
        expect(werte.has(`${tarif}/${dbArt}`), `${tarif}/${dbArt} fehlt in der Migration`).toBe(true);
        expect(werte.get(`${tarif}/${dbArt}`), `${tarif}/${dbArt}`).toBe(grenzeFuer(tarif, art));
      }
    }
  });

  it("die Datenbank kennt keine Tarife, die tarife.ts nicht kennt", () => {
    expect(werte.size).toBe(Object.keys(TARIFE).length * Object.keys(DB_ART).length);
  });
});

describe("Grenzen", () => {
  it("kostenlos: 5 Immobilien, 20 aktive Interessenten", () => {
    expect(grenzeFuer("kostenlos", "immobilien")).toBe(5);
    expect(grenzeFuer("kostenlos", "aktiveInteressenten")).toBe(20);
  });
  it("limitErreicht ab der Grenze, nie bei unbegrenzt", () => {
    expect(limitErreicht(4, 5)).toBe(false);
    expect(limitErreicht(5, 5)).toBe(true);
    expect(limitErreicht(6, 5)).toBe(true);
    expect(limitErreicht(10_000, null)).toBe(false);
  });
  it("Meldungen sind ehrlich und ohne Upgrade-Versprechen", () => {
    expect(limitMeldung("kostenlos", "immobilien")).toBe(
      "Du hast dein Limit von 5 Objekten im kostenlosen Tarif erreicht. Größere Tarife sind in Vorbereitung.",
    );
    expect(limitMeldung("kostenlos", "aktiveInteressenten")).toBe(
      "Du hast dein Limit von 20 aktiven Interessenten im kostenlosen Tarif erreicht. Größere Tarife sind in Vorbereitung.",
    );
    expect(limitMeldung("plus", "immobilien")).toContain("im Tarif Plus");
  });
});
