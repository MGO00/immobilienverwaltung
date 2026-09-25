// Einlesen und Vorbefüllen von Zahlenfeldern in deutscher Schreibweise. EINE Quelle
// für Browser (Formulare, Rechner) und Server (Zod-Bausteine in
// src/lib/validation/zahl.ts), damit beide exakt gleich rechnen.
//
// Regeln (siehe CLAUDE.md, Fachliche Regeln, Zahleneingabe):
// - Mit Komma: Komma ist Dezimalzeichen, Punkte davor sind Tausendertrenner in
//   korrekten Dreiergruppen ("189.000,50" → 189000.5).
// - Ohne Komma: Punkte vor genau drei Ziffern sind Tausendertrenner ("189.000" →
//   189000, "1.250.000" → 1250000); die erste Gruppe beginnt nicht mit 0.
// - Sonst ist ein einzelner Punkt Dezimalzeichen ("3.5" → 3.5, "0.500" → 0.5).
// - Alles andere ist ungültig (null) — nie still 0 und nie still eine andere Zahl.
//   Bewusst ungültig: Leerzeichen innen ("189 000"), Einheiten ("€", "%"), "1e5", "+5".

const GRUPPIERT = "[1-9]\\d{0,2}(?:\\.\\d{3})+";
const MIT_KOMMA = new RegExp(`^(?:(${GRUPPIERT})|(\\d*)),(\\d+)$`);
const NUR_GRUPPIERT = new RegExp(`^${GRUPPIERT}$`);
const MIT_PUNKT = /^(\d*)\.(\d+)$/;
const GANZZAHL = /^\d+$/;

export type DeZahl = { wert: number; nachkommastellen: number };

function ausTeilen(minus: boolean, ganz: string, nachkomma: string): DeZahl {
  const wert = Number(`${ganz || "0"}.${nachkomma || "0"}`);
  return {
    // "-0" nicht als eigene Zahl zurückgeben.
    wert: minus && wert !== 0 ? -wert : wert,
    // Nullen am Ende zählen nicht: "1,50" hat eine Nachkommastelle.
    nachkommastellen: nachkomma.replace(/0+$/, "").length,
  };
}

/** Wie parseDeZahl, liefert zusätzlich die Zahl der (bedeutsamen) Nachkommastellen. */
export function parseDeZahlDetails(text: string, { erlaubeMinus = false } = {}): DeZahl | null {
  let rest = text.trim();
  const minus = rest.startsWith("-");
  if (minus) {
    if (!erlaubeMinus) return null;
    rest = rest.slice(1);
  }
  if (rest === "") return null;

  const komma = MIT_KOMMA.exec(rest);
  if (komma) {
    const ganz = (komma[1] ?? komma[2] ?? "").replaceAll(".", "");
    return ausTeilen(minus, ganz, komma[3]);
  }
  if (NUR_GRUPPIERT.test(rest)) return ausTeilen(minus, rest.replaceAll(".", ""), "");
  const punkt = MIT_PUNKT.exec(rest);
  if (punkt) return ausTeilen(minus, punkt[1], punkt[2]);
  if (GANZZAHL.test(rest)) return ausTeilen(minus, rest, "");
  return null;
}

/**
 * Liest eine Zahl in deutscher Schreibweise ein. null bei leerer oder ungültiger
 * Eingabe. Ein führendes Minus ist nur mit erlaubeMinus zulässig (fachlich derzeit
 * nirgends).
 */
export function parseDeZahl(text: string, optionen: { erlaubeMinus?: boolean } = {}): number | null {
  return parseDeZahlDetails(text, optionen)?.wert ?? null;
}

export type EingabeFormat = {
  /** Geldbetrag: ganze Beträge ohne, alle anderen mit genau 2 Nachkommastellen. */
  betrag?: boolean;
};

/**
 * Wert für die Vorbefüllung eines Eingabefelds: Komma als Dezimalzeichen, ohne
 * Tausenderpunkte (einfach weiterzutippen). Vorher gerundet, damit Rechenreste aus
 * Summen nie im Feld stehen.
 * - Standard (Prozente, Flächen): ohne überflüssige Nullen, höchstens 4 Stellen.
 *   3.5 → "3,5", 58.5 → "58,5", 2 → "2".
 * - { betrag: true }: auf Cent gerundet; ganze Beträge ohne, sonst genau 2
 *   Nachkommastellen. 189000 → "189000", 189000.5 → "189000,50", 180.4 → "180,40".
 */
export function formatEingabe(zahl: number, { betrag = false }: EingabeFormat = {}): string {
  if (betrag) {
    const cent = Math.round(zahl * 100) / 100;
    if (cent === 0) return "0";
    return (Number.isInteger(cent) ? String(cent) : cent.toFixed(2)).replace(".", ",");
  }
  const gerundet = Math.round(zahl * 10000) / 10000;
  return String(Object.is(gerundet, -0) ? 0 : gerundet).replace(".", ",");
}

/** formatEingabe für optionale Werte: null wird zum leeren Feld. */
export function formatEingabeOptional(zahl: number | null | undefined, format: EingabeFormat = {}): string {
  return zahl === null || zahl === undefined ? "" : formatEingabe(zahl, format);
}
