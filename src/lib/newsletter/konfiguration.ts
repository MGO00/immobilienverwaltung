// Die E-Mail-Liste ist nur aktiv, wenn Secret-Key UND Mailversand eingerichtet sind.
// Sonst zeigt die Startseite die Karte gar nicht erst (es wird nichts gesammelt, bevor
// Mailversand und Datenschutzerklärung stehen). Einstellungen siehe .env.example.
export function newsletterKonfiguriert(): boolean {
  return Boolean(
    process.env.SUPABASE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SMTP_HOST &&
      process.env.MAIL_FROM,
  );
}
