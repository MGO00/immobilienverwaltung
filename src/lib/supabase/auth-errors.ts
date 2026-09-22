// Übersetzt bekannte Supabase-Auth-Fehlertexte (Englisch) in deutsche,
// nutzerverständliche Meldungen. Unbekannte Fehler bekommen eine neutrale
// Fallback-Meldung statt der rohen englischen Supabase-Meldung.
export function authErrorMessage(message: string): string {
  if (message.includes("already registered")) {
    return "Für diese E-Mail-Adresse besteht bereits ein Konto.";
  }
  if (message.includes("Password should be at least")) {
    return "Das Passwort muss mindestens 8 Zeichen lang sein.";
  }
  if (message.includes("Unable to validate email address")) {
    return "Bitte gib eine gültige E-Mail-Adresse ein.";
  }
  return "Das hat nicht geklappt. Bitte versuch es erneut.";
}
