// Die Kontolöschung braucht den Secret-Key (Nutzer löschen geht nur mit
// Admin-Rechten). Ohne Schlüssel zeigen die Einstellungen statt des Buttons
// einen Hinweis, damit nie ein halber Ablauf startet.
export function kontoloeschungVerfuegbar(): boolean {
  return Boolean(process.env.SUPABASE_SECRET_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);
}
