import { formatDate } from "@/lib/format";

// Datum als ISO-Text ("2026-03-01") für Datumsfelder und Rechner.

/**
 * Das LOKALE Datum (Jahr, Monat, Tag aus getFullYear/getMonth/getDate). Bewusst nicht
 * über toISOString(): Das ist UTC und liefert zwischen 0 und 2 Uhr deutscher Zeit den Vortag.
 */
export function lokalesIsoDatum(datum: Date = new Date()): string {
  const monat = String(datum.getMonth() + 1).padStart(2, "0");
  const tag = String(datum.getDate()).padStart(2, "0");
  return `${datum.getFullYear()}-${monat}-${tag}`;
}

/** ISO-Text im deutschen Format TT.MM.JJJJ. */
export function formatIsoDatum(iso: string): string {
  const [jahr, monat, tag] = iso.split("-").map(Number);
  return formatDate(new Date(jahr, monat - 1, tag));
}
