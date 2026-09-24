// Grunderwerbsteuer je Bundesland, in Prozent des Kaufpreises. Eine Quelle für
// den Kaufnebenkosten-Rechner (Auswahlliste und Berechnung) und die Tabelle unter
// /ressourcen/grunderwerbsteuer. Stand siehe GRUNDERWERBSTEUER_STAND. Vor der
// Veröffentlichung gegen eine amtliche Quelle prüfen (siehe CLAUDE.md,
// "Vor der Veröffentlichung").
// Bremen bewusst mit 5,5 % (nicht den 5,0 % aus der README von Runde 1).
export const GRUNDERWERBSTEUER_PROZENT: Record<string, number> = {
  "Baden-Württemberg": 5.0,
  Bayern: 3.5,
  Berlin: 6.0,
  Brandenburg: 6.5,
  Bremen: 5.5,
  Hamburg: 5.5,
  Hessen: 6.0,
  "Mecklenburg-Vorpommern": 6.0,
  Niedersachsen: 5.0,
  "Nordrhein-Westfalen": 6.5,
  "Rheinland-Pfalz": 5.0,
  Saarland: 6.5,
  Sachsen: 5.5,
  "Sachsen-Anhalt": 5.0,
  "Schleswig-Holstein": 6.5,
  Thüringen: 5.0,
};

// Stand der Sätze (JJJJ-MM-TT). Bei jeder Änderung der Sätze mitziehen; die
// Tabelle zeigt ihn als "Stand: <Monat Jahr>" an.
export const GRUNDERWERBSTEUER_STAND = "2026-09-22";

export const BUNDESLAENDER = Object.keys(GRUNDERWERBSTEUER_PROZENT) as ReadonlyArray<
  keyof typeof GRUNDERWERBSTEUER_PROZENT
>;

// Notar-, Grundbuch- und Makler-Erfahrungswerte (keine Gesetzessätze wie die
// Grunderwerbsteuer, sondern bundesweit übliche Richtwerte für die Vorbefüllung
// im Kaufnebenkosten-Rechner — im Formular vom Nutzer änderbar).
// Stand: 2026-09-23. Vor der Veröffentlichung gegen aktuelle Marktwerte prüfen.
export const NOTAR_PROZENT_STANDARD = 1.5;
export const GRUNDBUCH_PROZENT_STANDARD = 0.5;
export const MAKLER_PROZENT_STANDARD = 3.57;

/** Steuersatz mit genau einer Nachkommastelle, z. B. formatSteuersatz(5) → "5,0 %". */
export function formatSteuersatz(satz: number): string {
  return `${satz.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
}

/** Stand-Datum als Monat und Jahr, z. B. "2026-09-22" → "September 2026". */
export function formatStandMonat(stand: string): string {
  const [jahr, monat] = stand.split("-").map(Number);
  return new Date(Date.UTC(jahr, monat - 1, 1)).toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function bundeslandLabel(bundesland: string): string {
  const satz = GRUNDERWERBSTEUER_PROZENT[bundesland];
  if (satz === undefined) {
    return bundesland;
  }
  return `${bundesland} · ${formatSteuersatz(satz)}`;
}
