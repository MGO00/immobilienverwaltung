export type LaufendeKostenTyp =
  | "hausgeld"
  | "instandhaltungsruecklage"
  | "grundsteuer"
  | "versicherung"
  | "instandhaltung"
  | "verwaltung_sonstiges";

export const LAUFENDE_KOSTEN_LABEL: Record<LaufendeKostenTyp, string> = {
  hausgeld: "Hausgeld (nicht umlagefähig)",
  instandhaltungsruecklage: "Instandhaltungsrücklage",
  grundsteuer: "Grundsteuer",
  versicherung: "Versicherung",
  instandhaltung: "Instandhaltung",
  verwaltung_sonstiges: "Verwaltung und Sonstiges",
};

// Welche Kostenposten der Assistent je Objektart abfragt. "Verwaltung und
// Sonstiges" gilt bewusst für alle Objektarten (im Prototyp fehlt das Feld
// komplett, obwohl die Beispieldaten es für das Mehrfamilienhaus zeigen).
export function laufendeKostenFelder(
  art: "eigentumswohnung" | "einfamilienhaus" | "mehrfamilienhaus",
): LaufendeKostenTyp[] {
  if (art === "eigentumswohnung") {
    return ["hausgeld", "instandhaltungsruecklage", "grundsteuer", "versicherung", "verwaltung_sonstiges"];
  }
  return ["grundsteuer", "versicherung", "instandhaltung", "verwaltung_sonstiges"];
}
