// Reine Regeln der E-Mail-Liste (ohne Datenbank, ohne Versand), damit sie sich
// testen lassen.

export const BESTAETIGUNG_GUELTIG_STUNDEN = 48;
// Für dieselbe Adresse wird frühestens nach dieser Zeit eine neue Mail geschickt.
export const MAIL_SPERRE_MINUTEN = 10;
// Obergrenze neuer Bestätigungsmails pro Stunde insgesamt (Schutz davor, dass die
// Anmeldung als Mail-Schleuder missbraucht wird).
export const MAX_BESTAETIGUNGSMAILS_PRO_STUNDE = 30;
// Nachweis, welcher Hinweistext bei der Anmeldung galt.
export const EINWILLIGUNG_TEXT_VERSION = "v1";

export type VorhandenerEintrag = {
  status: "pending" | "confirmed" | "unsubscribed";
  confirmationSentAt: Date | null;
} | null;

export type AnmeldeEntscheidung =
  | "anlegen_und_senden"
  | "erneut_senden"
  | "nichts_senden"
  | "limit_erreicht";

export function entscheideAnmeldung(
  vorhanden: VorhandenerEintrag,
  jetzt: Date,
  bestaetigungsmailsLetzteStunde: number,
): AnmeldeEntscheidung {
  // Schon bestätigt: keine Mail (und nach außen sieht es genauso aus wie sonst).
  if (vorhanden?.status === "confirmed") return "nichts_senden";

  // Innerhalb der Sperrfrist keine zweite Mail an dieselbe Adresse.
  if (vorhanden?.status === "pending" && vorhanden.confirmationSentAt) {
    const vergangenMs = jetzt.getTime() - vorhanden.confirmationSentAt.getTime();
    if (vergangenMs < MAIL_SPERRE_MINUTEN * 60 * 1000) return "nichts_senden";
  }

  if (bestaetigungsmailsLetzteStunde >= MAX_BESTAETIGUNGSMAILS_PRO_STUNDE) return "limit_erreicht";

  // Abgemeldete Adressen brauchen eine neue Bestätigung wie ein neuer Eintrag.
  return vorhanden ? "erneut_senden" : "anlegen_und_senden";
}

export function ablaufZeitpunkt(jetzt: Date): Date {
  return new Date(jetzt.getTime() + BESTAETIGUNG_GUELTIG_STUNDEN * 60 * 60 * 1000);
}

export function istAbgelaufen(ablauf: Date | null, jetzt: Date): boolean {
  return ablauf === null || ablauf.getTime() <= jetzt.getTime();
}
