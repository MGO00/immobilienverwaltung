import { describe, expect, it } from "vitest";
import { FotoOrdnerFehler, leereFotoOrdner, listeAlleDateien, type StorageBucket } from "./foto-ordner";

// Nachgebildeter Storage-Bucket: Dateien als Pfadliste, optional mit Dateien,
// die sich "stillschweigend" nicht löschen lassen (wie bei einer fehlenden Zugriffsregel).
function fakeBucket(pfade: string[], opts: { geschuetzt?: string[]; removeFehler?: boolean; listFehler?: boolean } = {}) {
  const dateien = new Set(pfade);
  const bucket: StorageBucket = {
    async list(ordner, { limit, offset }) {
      if (opts.listFehler) return { data: null, error: new Error("x") };
      const prefix = ordner + "/";
      const eintraege = new Map<string, string | null>();
      for (const p of dateien) {
        if (!p.startsWith(prefix)) continue;
        const rest = p.slice(prefix.length);
        const [kopf, ...weiter] = rest.split("/");
        eintraege.set(kopf, weiter.length ? null : "id-" + kopf);
      }
      const alle = [...eintraege].sort().map(([name, id]) => ({ name, id }));
      return { data: alle.slice(offset, offset + limit), error: null };
    },
    async remove(liste) {
      if (opts.removeFehler) return { data: null, error: new Error("x") };
      for (const p of liste) if (!opts.geschuetzt?.includes(p)) dateien.delete(p);
      return { data: [], error: null };
    },
  };
  return { bucket, dateien };
}

const konto = "aaaa";

describe("listeAlleDateien", () => {
  it("findet auch Dateien in Unterordnern und über mehrere Seiten", async () => {
    const pfade = Array.from({ length: 230 }, (_, i) => `${konto}/foto-${String(i).padStart(3, "0")}`);
    pfade.push(`${konto}/unterordner/verwaist`);
    const { bucket } = fakeBucket([...pfade, "bbbb/fremd"]);
    const gefunden = await listeAlleDateien(bucket, konto);
    expect(gefunden).toHaveLength(231);
    expect(gefunden).toContain(`${konto}/unterordner/verwaist`);
    expect(gefunden).not.toContain("bbbb/fremd");
  });
});

describe("leereFotoOrdner", () => {
  it("löscht alle Dateien des Kontos und nur diese", async () => {
    const { bucket, dateien } = fakeBucket([`${konto}/haus-1`, `${konto}/verwaist`, "bbbb/haus-b"]);
    expect(await leereFotoOrdner(bucket, konto)).toBe(2);
    expect([...dateien]).toEqual(["bbbb/haus-b"]);
  });
  it("ein leerer Ordner ist ein Erfolg", async () => {
    const { bucket } = fakeBucket([]);
    expect(await leereFotoOrdner(bucket, konto)).toBe(0);
  });
  it("bricht ab, wenn Löschen einen Fehler meldet", async () => {
    const { bucket } = fakeBucket([`${konto}/haus-1`], { removeFehler: true });
    await expect(leereFotoOrdner(bucket, konto)).rejects.toBeInstanceOf(FotoOrdnerFehler);
  });
  it("bricht ab, wenn Dateien stillschweigend übrig bleiben (Nachkontrolle)", async () => {
    const { bucket } = fakeBucket([`${konto}/haus-1`, `${konto}/haus-2`], { geschuetzt: [`${konto}/haus-2`] });
    await expect(leereFotoOrdner(bucket, konto)).rejects.toThrow("1 Datei(en) konnten nicht gelöscht werden.");
  });
  it("bricht ab, wenn das Auflisten fehlschlägt", async () => {
    const { bucket } = fakeBucket([`${konto}/haus-1`], { listFehler: true });
    await expect(leereFotoOrdner(bucket, konto)).rejects.toBeInstanceOf(FotoOrdnerFehler);
  });
});
