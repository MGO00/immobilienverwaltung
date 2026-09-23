import {
  AKTIVE_STATUS,
  INTERESSENT_STATUS,
  type InteressentStatus,
} from "@/lib/constants/interessent";

export function zaehleAktive(interessenten: { status: InteressentStatus }[]): number {
  return interessenten.filter((i) => AKTIVE_STATUS.includes(i.status)).length;
}

export function zaehleNachStatus(
  interessenten: { status: InteressentStatus }[],
): Record<InteressentStatus, number> {
  const zaehler = Object.fromEntries(INTERESSENT_STATUS.map((s) => [s, 0])) as Record<InteressentStatus, number>;
  for (const i of interessenten) zaehler[i.status] += 1;
  return zaehler;
}

// Übernahme in den Bestand ab "besichtigt" oder "Angebot abgegeben", und nur
// einmal (danach steht der Verweis auf die Immobilie). Gleiche Regel wie in der
// Datenbankfunktion prospect_to_property().
export function kannUebernehmen(interessent: { status: InteressentStatus; propertyId: string | null }): boolean {
  return (
    interessent.propertyId === null &&
    (interessent.status === "besichtigt" || interessent.status === "angebot_abgegeben")
  );
}

// Per Klick im Stepper direkt setzbar: "beobachtet", "besichtigt", "Angebot
// abgegeben" und "abgelehnt". "gekauft" gibt es nur über die Übernahme (sonst
// entstünde ein gekaufter Interessent ohne Immobilie). Ein bereits übernommener
// oder gekaufter Interessent ist nicht mehr änderbar.
export function kannStatusSetzen(aktuell: InteressentStatus, neu: InteressentStatus): boolean {
  if (aktuell === "gekauft") return false;
  if (neu === "gekauft") return false;
  return aktuell !== neu;
}

// Prüft die Inserats-Adresse: nur http(s), keine Leerzeichen. Alles andere
// (z. B. "javascript:...") wird abgelehnt, weil der Link angeklickt wird.
export function istGueltigeInseratUrl(wert: string): boolean {
  if (wert.length > 2000 || /\s/.test(wert)) return false;
  try {
    const url = new URL(wert);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
