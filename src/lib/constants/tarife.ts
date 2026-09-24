// Tarife und ihre Grenzen — zentrale Einstellung.
//
// Die Werte stehen ZWEIMAL: hier (für Anzeige, Zähler und Buttons) und in der
// Datenbankfunktion tarif_grenze() (für die echte, nicht umgehbare Prüfung per
// Trigger). Beide Stellen immer gemeinsam ändern, per neuer Migration mit
// TARIFE-Block. src/lib/tarife.test.ts vergleicht beide automatisch.
// Aktuell wird nur "kostenlos" vergeben; plus/pro sind vorbereitet (Werte aus
// docs/planung/funktionsplanung-immobilienverwaltung.md, noch unbestätigt).

export const TARIFE = {
  kostenlos: { label: "kostenlos", immobilien: 5, aktiveInteressenten: 20 },
  plus: { label: "Plus", immobilien: 10, aktiveInteressenten: 100 },
  pro: { label: "Pro", immobilien: null, aktiveInteressenten: null },
} as const satisfies Record<string, { label: string; immobilien: number | null; aktiveInteressenten: number | null }>;

export type Tarif = keyof typeof TARIFE;
export type GrenzArt = "immobilien" | "aktiveInteressenten";

export const STANDARD_TARIF: Tarif = "kostenlos";

export function istTarif(wert: unknown): wert is Tarif {
  return typeof wert === "string" && wert in TARIFE;
}

// null = unbegrenzt
export function grenzeFuer(tarif: Tarif, art: GrenzArt): number | null {
  return TARIFE[tarif][art];
}

export function limitErreicht(anzahl: number, grenze: number | null): boolean {
  return grenze !== null && anzahl >= grenze;
}

function tarifText(tarif: Tarif): string {
  return tarif === "kostenlos" ? "im kostenlosen Tarif" : `im Tarif ${TARIFE[tarif].label}`;
}

// Ehrlich formuliert: kein Verweis auf einen Upgrade-Weg, den es noch nicht gibt.
export function limitMeldung(tarif: Tarif, art: GrenzArt): string {
  const grenze = grenzeFuer(tarif, art);
  const was = art === "immobilien" ? "Objekten" : "aktiven Interessenten";
  return `Du hast dein Limit von ${grenze} ${was} ${tarifText(tarif)} erreicht. Größere Tarife sind in Vorbereitung.`;
}

// Fehlercodes der Datenbank-Trigger (Migration 20260924120000_tarife.sql).
export const DB_FEHLER_IMMOBILIEN_LIMIT = "TL001";
export const DB_FEHLER_INTERESSENTEN_LIMIT = "TL002";
