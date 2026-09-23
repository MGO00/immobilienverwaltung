// Grunderwerbsteuer je Bundesland, in Prozent des Kaufpreises.
// Stand: 2026-09-22. Vor der Veröffentlichung gegen eine amtliche Quelle
// prüfen (siehe CLAUDE.md, "Vor der Veröffentlichung").
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

export function bundeslandLabel(bundesland: string): string {
  const satz = GRUNDERWERBSTEUER_PROZENT[bundesland];
  if (satz === undefined) {
    return bundesland;
  }
  return `${bundesland} · ${satz.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
}
