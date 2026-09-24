import { describe, expect, it } from "vitest";
import { passwortAendernSchema, profilSchema } from "./einstellungen";

const meldung = (r: { success: boolean; error?: { issues: { message: string }[] } }) => r.error?.issues[0]?.message;

describe("profilSchema", () => {
  it("nimmt einen Namen an und entfernt Leerzeichen am Rand", () => {
    expect(profilSchema.parse({ name: "  Moritz  " }).name).toBe("Moritz");
  });
  it("lehnt leere und zu lange Namen ab", () => {
    expect(meldung(profilSchema.safeParse({ name: "   " }))).toBe("Bitte gib deinen Namen ein.");
    expect(profilSchema.safeParse({ name: "x".repeat(81) }).success).toBe(false);
  });
});

describe("passwortAendernSchema", () => {
  const gueltig = { aktuell: "altesPasswort1", neu: "neuesPasswort1", wiederholung: "neuesPasswort1" };
  it("nimmt eine gültige Änderung an", () => {
    expect(passwortAendernSchema.safeParse(gueltig).success).toBe(true);
  });
  it("verlangt das aktuelle Passwort", () => {
    expect(meldung(passwortAendernSchema.safeParse({ ...gueltig, aktuell: "" }))).toBe(
      "Bitte gib dein aktuelles Passwort ein.",
    );
  });
  it("verlangt mindestens 8 Zeichen", () => {
    expect(meldung(passwortAendernSchema.safeParse({ ...gueltig, neu: "kurz", wiederholung: "kurz" }))).toBe(
      "Das neue Passwort muss mindestens 8 Zeichen lang sein.",
    );
  });
  it("verlangt eine übereinstimmende Wiederholung", () => {
    expect(meldung(passwortAendernSchema.safeParse({ ...gueltig, wiederholung: "anderes123" }))).toBe(
      "Die beiden neuen Passwörter stimmen nicht überein.",
    );
  });
  it("verlangt ein anderes Passwort als das aktuelle", () => {
    expect(
      meldung(passwortAendernSchema.safeParse({ aktuell: "gleich12345", neu: "gleich12345", wiederholung: "gleich12345" })),
    ).toBe("Das neue Passwort muss sich vom aktuellen unterscheiden.");
  });
});
