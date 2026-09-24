import {
  GRUNDERWERBSTEUER_PROZENT,
  GRUNDERWERBSTEUER_STAND,
  formatStandMonat,
  formatSteuersatz,
} from "@/lib/constants/steuersaetze";

export type GrunderwerbsteuerZeile = {
  bundesland: string;
  satz: number;
  satzText: string;
};

// Zeilen der Tabelle unter /ressourcen/grunderwerbsteuer, direkt aus derselben
// Konstante wie der Kaufnebenkosten-Rechner (nie separat eingetippt).
export function grunderwerbsteuerZeilen(): GrunderwerbsteuerZeile[] {
  return Object.entries(GRUNDERWERBSTEUER_PROZENT)
    .map(([bundesland, satz]) => ({ bundesland, satz, satzText: formatSteuersatz(satz) }))
    .sort((a, b) => a.bundesland.localeCompare(b.bundesland, "de"));
}

export function grunderwerbsteuerStandText(): string {
  return `Stand: ${formatStandMonat(GRUNDERWERBSTEUER_STAND)}, Angaben ohne Gewähr`;
}
