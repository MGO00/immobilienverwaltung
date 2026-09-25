import { describe, expect, it } from "vitest";
import { kaufpreisRegel, pflichtZahlFeld, pruefeZahl, REGEL, ZAHL_MELDUNG, zahlFehler, zahlFeld, zahlWert } from "./zahl";

const meldung = (text: string, regel: Parameters<typeof pruefeZahl>[1]) => {
  const ergebnis = pruefeZahl(text, regel);
  return ergebnis.ok ? null : ergebnis.meldung;
};

describe("pruefeZahl", () => {
  it("liefert den eingelesenen Wert", () => {
    expect(pruefeZahl("189.000,50", REGEL.betrag)).toEqual({ ok: true, wert: 189000.5 });
    expect(pruefeZahl("3.5", REGEL.zins)).toEqual({ ok: true, wert: 3.5 });
    expect(pruefeZahl("1,5", REGEL.tilgung)).toEqual({ ok: true, wert: 1.5 });
  });

  it("behandelt leere Felder als null bzw. meldet Pflichtfelder", () => {
    expect(pruefeZahl("  ", REGEL.betrag)).toEqual({ ok: true, wert: null });
    expect(meldung("", kaufpreisRegel("Trag den Kaufpreis ein."))).toBe("Trag den Kaufpreis ein.");
  });

  it("meldet ungültige und negative Eingaben verständlich", () => {
    expect(meldung("1,2,3", REGEL.betrag)).toBe(ZAHL_MELDUNG.ungueltig);
    expect(meldung("abc", REGEL.betrag)).toBe(ZAHL_MELDUNG.ungueltig);
    expect(meldung("5 €", REGEL.betrag)).toBe(ZAHL_MELDUNG.ungueltig);
    expect(meldung("-5", REGEL.betrag)).toBe(ZAHL_MELDUNG.negativ);
  });

  it("fängt den Tausenderpunkt beim Zins über die Obergrenze ab", () => {
    expect(meldung("1.500", REGEL.zins)).toBe("Der Zins darf höchstens 20 % betragen.");
    expect(meldung("20", REGEL.zins)).toBeNull();
    expect(meldung("20,01", REGEL.zins)).toBe("Der Zins darf höchstens 20 % betragen.");
    expect(meldung("25", REGEL.tilgung)).toBe("Die Tilgung darf höchstens 20 % betragen.");
  });

  it("begrenzt gespeicherte Werte auf 2 Nachkommastellen, Rechner-Werte nicht", () => {
    expect(meldung("3,575", REGEL.zins)).toBe("Bitte höchstens 2 Nachkommastellen.");
    expect(meldung("3,50", REGEL.zins)).toBeNull();
    expect(meldung("1.250,505", REGEL.betrag)).toBe("Bitte höchstens 2 Nachkommastellen.");
    expect(pruefeZahl("3,575", REGEL.rechnerZins)).toEqual({ ok: true, wert: 3.575 });
    expect(pruefeZahl("3,57", REGEL.nebenkostenProzent)).toEqual({ ok: true, wert: 3.57 });
  });

  it("prüft die Grenzen der Rechner-Prozente", () => {
    expect(meldung("12", REGEL.nebenkostenProzent)).toBe("Der Wert darf höchstens 10 % betragen.");
    expect(meldung("100", REGEL.leerstandProzent)).toBeNull();
    expect(meldung("150", REGEL.leerstandProzent)).toBe("Der Leerstand darf höchstens 100 % betragen.");
  });

  it("verlangt beim Kaufpreis einen Wert über 0", () => {
    const regel = kaufpreisRegel("Trag den Kaufpreis ein.");
    expect(meldung("0", regel)).toBe("Trag den Kaufpreis ein.");
    expect(pruefeZahl("189.000", regel)).toEqual({ ok: true, wert: 189000 });
  });

  it("prüft Baujahr und Zinsbindung als ganze Zahlen mit Grenzen", () => {
    const naechstesJahr = new Date().getFullYear() + 1;
    expect(pruefeZahl(String(naechstesJahr), REGEL.baujahr)).toEqual({ ok: true, wert: naechstesJahr });
    expect(meldung("1998,5", REGEL.baujahr)).toBe(ZAHL_MELDUNG.ganzzahl);
    expect(meldung("1000", REGEL.baujahr)).toBe("Bitte ein Baujahr nach 1000 eingeben.");
    expect(meldung("3000", REGEL.baujahr)).toBe("Das Baujahr liegt zu weit in der Zukunft.");
    expect(meldung("0", REGEL.zinsbindungJahre)).toBe("Bitte mindestens 1 Jahr eingeben.");
    expect(meldung("41", REGEL.zinsbindungJahre)).toBe("Bitte höchstens 40 Jahre eingeben.");
    expect(pruefeZahl("10", REGEL.zinsbindungJahre)).toEqual({ ok: true, wert: 10 });
  });

  it("prüft die Grenzen der Datenbankspalten", () => {
    expect(meldung("10.000.000.000", REGEL.betrag)).toBe("Der Betrag ist zu groß.");
    expect(meldung("1.000.000", REGEL.flaeche)).toBe("Die Fläche ist zu groß.");
  });
});

describe("zahlFeld / pflichtZahlFeld (Zod)", () => {
  it("liest Text serverseitig mit denselben Regeln ein", () => {
    expect(zahlFeld(REGEL.zins).parse("3,5")).toBe(3.5);
    expect(zahlFeld(REGEL.zins).parse("")).toBeNull();
    expect(pflichtZahlFeld(kaufpreisRegel("Kaufpreis fehlt.")).parse("189.000,50")).toBe(189000.5);
  });

  it("gibt dieselbe Meldung wie im Browser zurück", () => {
    const ergebnis = zahlFeld(REGEL.zins).safeParse("1.500");
    expect(ergebnis.success).toBe(false);
    expect(ergebnis.error?.issues[0]?.message).toBe(meldung("1.500", REGEL.zins));

    const leer = pflichtZahlFeld(kaufpreisRegel("Kaufpreis fehlt.")).safeParse("");
    expect(leer.error?.issues[0]?.message).toBe("Kaufpreis fehlt.");
  });

  it("liefert für die Formulare Meldung bzw. Wert aus demselben Schema", () => {
    const zins = zahlFeld(REGEL.zins);
    expect(zahlFehler(zins, "1.500")).toBe("Der Zins darf höchstens 20 % betragen.");
    expect(zahlFehler(zins, "3,5")).toBeNull();
    expect(zahlWert(zins, "3,5")).toBe(3.5);
    expect(zahlWert(zins, "1.500")).toBeNull();
    expect(zahlWert(zins, "")).toBeNull();
  });

  it("nimmt keine Zahlen, nur Text an", () => {
    expect(zahlFeld(REGEL.betrag).safeParse(5).success).toBe(false);
  });
});
