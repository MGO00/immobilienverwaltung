import { describe, expect, it } from "vitest";
import { sichererPfad } from "./weiterleitung";

describe("sichererPfad", () => {
  it("lässt eigene Pfade durch, auch mit Query", () => {
    expect(sichererPfad("/uebersicht")).toBe("/uebersicht");
    expect(sichererPfad("/passwort-zuruecksetzen")).toBe("/passwort-zuruecksetzen");
    expect(sichererPfad("/immobilien/neu?schritt=2")).toBe("/immobilien/neu?schritt=2");
  });

  it("lehnt fremde Adressen ab", () => {
    expect(sichererPfad("//boese.de")).toBe("/uebersicht");
    expect(sichererPfad("/\\boese.de")).toBe("/uebersicht");
    expect(sichererPfad("https://boese.de")).toBe("/uebersicht");
    expect(sichererPfad("@boese.de")).toBe("/uebersicht");
    expect(sichererPfad(".boese.de")).toBe("/uebersicht");
    expect(sichererPfad("/\t/boese.de")).toBe("/uebersicht");
    expect(sichererPfad("/ok\\..\\x")).toBe("/uebersicht");
  });

  it("nutzt den Standard ohne Angabe", () => {
    expect(sichererPfad(null)).toBe("/uebersicht");
    expect(sichererPfad("")).toBe("/uebersicht");
    expect(sichererPfad("boese.de", "/anmelden")).toBe("/anmelden");
  });
});
