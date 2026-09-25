import { z } from "zod";
import { parseDeZahl, parseDeZahlDetails } from "@/lib/zahl";

// Prüfregeln für Zahlenfelder. Dieselben Regeln nutzen die Formulare im Browser
// (pruefeZahl bzw. baustein.safeParse) und die Zod-Schemas der Server Actions
// (zahlFeld/pflichtZahlFeld). Eingelesen wird immer mit parseDeZahl aus src/lib/zahl.ts.

export type ZahlRegel = {
  /** Meldung, wenn das Feld leer ist. Ohne Angabe ist das Feld optional (leer = null). */
  pflicht?: string;
  /** Untergrenze (Standard 0). Negative Eingaben meldet schon das Einlesen. */
  min?: number;
  /** true: der Wert muss größer als min sein (z. B. Kaufpreis > 0). */
  minExklusiv?: boolean;
  minMeldung?: string;
  /** Obergrenze, als Zahl oder als Funktion (z. B. aktuelles Jahr + 5). */
  max?: number | (() => number);
  maxMeldung?: string;
  /** Höchstzahl der Nachkommastellen (gespeicherte Werte: 2, Datenbank numeric(…, 2)). */
  maxNachkomma?: number;
  ganzzahl?: boolean;
};

export const ZAHL_MELDUNG = {
  ungueltig: "Bitte eine Zahl eingeben, z. B. 1.250,50.",
  negativ: "Bitte keinen negativen Wert eingeben.",
  ganzzahl: "Bitte eine ganze Zahl eingeben.",
  nachkomma: (stellen: number) =>
    stellen === 0 ? "Bitte ohne Nachkommastellen eingeben." : `Bitte höchstens ${stellen} Nachkommastellen.`,
  zuKlein: "Der Wert ist zu klein.",
  zuGross: "Der Wert ist zu groß.",
};

export type ZahlPruefung = { ok: true; wert: number | null } | { ok: false; meldung: string };

/** Prüft einen Feldinhalt nach einer Regel. Leer ergibt wert null (oder die Pflicht-Meldung). */
export function pruefeZahl(text: string, regel: ZahlRegel): ZahlPruefung {
  if (text.trim() === "") {
    return regel.pflicht ? { ok: false, meldung: regel.pflicht } : { ok: true, wert: null };
  }

  const zahl = parseDeZahlDetails(text);
  if (!zahl) {
    const negativ = parseDeZahl(text, { erlaubeMinus: true }) !== null;
    return { ok: false, meldung: negativ ? ZAHL_MELDUNG.negativ : ZAHL_MELDUNG.ungueltig };
  }

  if (regel.ganzzahl && zahl.nachkommastellen > 0) return { ok: false, meldung: ZAHL_MELDUNG.ganzzahl };
  if (regel.maxNachkomma !== undefined && zahl.nachkommastellen > regel.maxNachkomma) {
    return { ok: false, meldung: ZAHL_MELDUNG.nachkomma(regel.maxNachkomma) };
  }

  const min = regel.min ?? 0;
  if (regel.minExklusiv ? zahl.wert <= min : zahl.wert < min) {
    return { ok: false, meldung: regel.minMeldung ?? ZAHL_MELDUNG.zuKlein };
  }
  const max = typeof regel.max === "function" ? regel.max() : regel.max;
  if (max !== undefined && zahl.wert > max) {
    return { ok: false, meldung: regel.maxMeldung ?? ZAHL_MELDUNG.zuGross };
  }

  return { ok: true, wert: zahl.wert };
}

/**
 * Meldung eines Zahlenfeld-Schemas für einen Feldinhalt (null = in Ordnung). Die
 * Formulare prüfen damit im Browser mit genau dem Schema, das auch der Server nutzt.
 */
export function zahlFehler(schema: z.ZodType<unknown, string>, text: string): string | null {
  const ergebnis = schema.safeParse(text);
  return ergebnis.success ? null : (ergebnis.error.issues[0]?.message ?? ZAHL_MELDUNG.ungueltig);
}

/** Wert eines Zahlenfeld-Schemas für einen Feldinhalt; null, wenn leer oder ungültig. */
export function zahlWert(schema: z.ZodType<number | null, string>, text: string): number | null {
  const ergebnis = schema.safeParse(text);
  return ergebnis.success ? ergebnis.data : null;
}

/** Optionales Zahlenfeld für Zod: Text rein, number | null raus. */
export function zahlFeld(regel: ZahlRegel) {
  return z.string().transform((text, ctx): number | null => {
    const ergebnis = pruefeZahl(text, regel);
    if (!ergebnis.ok) {
      ctx.addIssue({ code: "custom", message: ergebnis.meldung });
      return z.NEVER;
    }
    return ergebnis.wert;
  });
}

/** Pflicht-Zahlenfeld für Zod: Text rein, number raus. Die Regel braucht eine pflicht-Meldung. */
export function pflichtZahlFeld(regel: ZahlRegel & { pflicht: string }) {
  return z.string().transform((text, ctx): number => {
    const ergebnis = pruefeZahl(text, regel);
    if (!ergebnis.ok || ergebnis.wert === null) {
      ctx.addIssue({ code: "custom", message: ergebnis.ok ? regel.pflicht : ergebnis.meldung });
      return z.NEVER;
    }
    return ergebnis.wert;
  });
}

// ---- Feste Regeln, einmal definiert und überall wiederverwendet ----

// Grenzen der Datenbankspalten: numeric(12, 2) für Beträge, numeric(8, 2) für Flächen.
const BETRAG_MAX = 9_999_999_999.99;
const FLAECHE_MAX = 999_999.99;

export const REGEL = {
  betrag: { maxNachkomma: 2, max: BETRAG_MAX, maxMeldung: "Der Betrag ist zu groß." },
  flaeche: { maxNachkomma: 2, max: FLAECHE_MAX, maxMeldung: "Die Fläche ist zu groß." },
  zins: { maxNachkomma: 2, max: 20, maxMeldung: "Der Zins darf höchstens 20 % betragen." },
  tilgung: { maxNachkomma: 2, max: 20, maxMeldung: "Die Tilgung darf höchstens 20 % betragen." },
  baujahr: {
    ganzzahl: true,
    min: 1000,
    minExklusiv: true,
    minMeldung: "Bitte ein Baujahr nach 1000 eingeben.",
    max: () => new Date().getFullYear() + 5,
    maxMeldung: "Das Baujahr liegt zu weit in der Zukunft.",
  },
  // Nur in Rechnern (nicht gespeichert): beliebig viele Nachkommastellen.
  nebenkostenProzent: { max: 10, maxMeldung: "Der Wert darf höchstens 10 % betragen." },
  leerstandProzent: { max: 100, maxMeldung: "Der Leerstand darf höchstens 100 % betragen." },
  rechnerBetrag: { max: BETRAG_MAX, maxMeldung: "Der Betrag ist zu groß." },
  rechnerZins: { max: 20, maxMeldung: "Der Zins darf höchstens 20 % betragen." },
  rechnerTilgung: { max: 20, maxMeldung: "Die Tilgung darf höchstens 20 % betragen." },
  zinsbindungJahre: {
    ganzzahl: true,
    min: 1,
    minMeldung: "Bitte mindestens 1 Jahr eingeben.",
    max: 40,
    maxMeldung: "Bitte höchstens 40 Jahre eingeben.",
  },
} satisfies Record<string, ZahlRegel>;

/** Kaufpreis (Pflicht, größer 0) mit der jeweiligen Meldung des Formulars. */
export function kaufpreisRegel(meldung: string): ZahlRegel & { pflicht: string } {
  return {
    ...REGEL.betrag,
    pflicht: meldung,
    min: 0,
    minExklusiv: true,
    minMeldung: meldung,
  };
}
