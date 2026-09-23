// Kaufprüfung: Status der Interessenten. Die Reihenfolge ist die der Pipeline
// (beobachtet → besichtigt → Angebot abgegeben → gekauft), "abgelehnt" ist der
// Sonderfall daneben.
export const INTERESSENT_STATUS = [
  "beobachtet",
  "besichtigt",
  "angebot_abgegeben",
  "gekauft",
  "abgelehnt",
] as const;

export type InteressentStatus = (typeof INTERESSENT_STATUS)[number];

export const INTERESSENT_STATUS_LABEL: Record<InteressentStatus, string> = {
  beobachtet: "beobachtet",
  besichtigt: "besichtigt",
  angebot_abgegeben: "Angebot abgegeben",
  gekauft: "gekauft",
  abgelehnt: "abgelehnt",
};

// Zählen auf das (noch nicht erzwungene) Limit; gekaufte und abgelehnte
// Interessenten sind archiviert und zählen nicht mit (siehe
// docs/planung/funktionsplanung-immobilienverwaltung.md). Das Limit ist
// aktuell rein informativ, die Tarif-Logik entsteht erst mit eigenem Auftrag.
export const AKTIVE_INTERESSENTEN_LIMIT = 20;
export const AKTIVE_STATUS: readonly InteressentStatus[] = ["beobachtet", "besichtigt", "angebot_abgegeben"];
