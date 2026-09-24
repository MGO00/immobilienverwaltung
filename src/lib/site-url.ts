// Öffentliche Adresse der App für Links in Mails (Registrierung, Passwort-Reset,
// E-Mail-Liste). Lokal ist http://localhost:3000 der Standard. Im Produktions-Build
// ohne NEXT_PUBLIC_SITE_URL gibt es bewusst einen Fehler: Sonst gingen Mails mit
// localhost-Links hinaus, ohne dass es jemand merkt.
export function siteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_SITE_URL ist nicht gesetzt. Ohne sie zeigen Links in Mails ins Leere.");
  }
  return "http://localhost:3000";
}
