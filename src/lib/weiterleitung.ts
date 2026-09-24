// Prüft das Weiterleitungsziel aus Links in Mails (?next=… in /auth/confirm).
// Erlaubt sind nur eigene Pfade: genau ein "/" am Anfang, kein "//" und kein
// Backslash (Browser behandeln "/\" teils wie "//", also wie eine fremde Adresse),
// keine Steuerzeichen (Browser entfernen z. B. Tabs, aus "/\t/x" würde "//x").
// Alles andere, etwa "@boese.de" (ergäbe https://eigene-seite@boese.de), fällt
// auf den Standard zurück.
export function sichererPfad(next: string | null, standard = "/uebersicht"): string {
  if (!next) return standard;
  if (!next.startsWith("/") || next.startsWith("//")) return standard;
  if (next.includes("\\")) return standard;
  if (/[\x00-\x1f\x7f]/.test(next)) return standard;
  return next;
}
