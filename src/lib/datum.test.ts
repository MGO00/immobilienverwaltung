import { describe, expect, it } from "vitest";
import { formatIsoDatum, lokalesIsoDatum } from "./datum";

describe("lokalesIsoDatum", () => {
  it("nimmt das lokale Datum, auch kurz nach Mitternacht", () => {
    expect(lokalesIsoDatum(new Date(2026, 2, 1, 0, 30))).toBe("2026-03-01");
    expect(lokalesIsoDatum(new Date(2026, 11, 31, 23, 59))).toBe("2026-12-31");
  });
});

describe("formatIsoDatum", () => {
  it("formatiert TT.MM.JJJJ", () => {
    expect(formatIsoDatum("2026-06-01")).toBe("01.06.2026");
  });
});
