import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Öffentliche Pfade sind bewusst als Allowlist gepflegt statt als Liste
// geschützter Pfade: Jede künftige neue Route (z. B. /immobilien/...) ist so
// automatisch geschützt, ohne dass diese Datei angepasst werden muss.
const PUBLIC_PATHS = [
  "/anmelden",
  "/registrieren",
  "/passwort-vergessen",
  "/email-bestaetigen",
  "/passwort-zuruecksetzen",
  "/auth/confirm",
];

// Öffentlich erreichbare Seiten (ohne Login, für Marketing/SEO): die Startseite
// "/", die Rechnerseiten, Ressourcen und Tipps & Tricks. Bewusst
// als exakte Pfade statt mit startsWith: Sonst wäre jede künftige Route unter
// /rechner (z. B. ein weiterer Rechner) automatisch öffentlich. Die
// Objektbezüge (?immobilie=...) bleiben trotzdem an die Anmeldung gebunden,
// siehe die jeweiligen Seiten.
const PUBLIC_EXACT_PATHS = [
  "/",
  "/rechner",
  "/rechner/kaufnebenkosten",
  "/rechner/rendite",
  "/rechner/finanzierung",
  "/rechner/cashflow",
  "/rechner/mieterhoehung",
  // Link-Seiten aus der Bestätigungsmail der E-Mail-Liste (Besucher ohne Konto).
  "/newsletter/bestaetigen",
  "/newsletter/abmelden",
  // Ressourcen und Tipps & Tricks (Runde 4, Schritt 2), ebenfalls einzeln und exakt:
  // Künftige Artikelseiten unter /tipps/... sind damit nicht automatisch öffentlich.
  "/ressourcen",
  "/ressourcen/grunderwerbsteuer",
  "/ressourcen/glossar",
  "/tipps",
];

// Angemeldete Nutzer sollen nicht zurück zu Anmelden/Registrieren können.
// /passwort-zuruecksetzen bleibt bewusst ausgenommen: Nach Klick auf den
// Recovery-Link aus der E-Mail setzt Supabase eine temporäre Session, und
// genau dann muss dieser Screen trotzdem erreichbar sein.
const AUTH_ONLY_PATHS = ["/anmelden", "/registrieren"];

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  const normalizedPath = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  const isPublicPath =
    PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath)) ||
    PUBLIC_EXACT_PATHS.includes(normalizedPath);

  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL("/anmelden", request.url));
  }

  // Startseite: nur für Besucher ohne Anmeldung. Angemeldete gehen direkt zur
  // Übersicht (schon hier im Proxy, damit die Startseite gar nicht erst lädt).
  if (user && normalizedPath === "/") {
    return NextResponse.redirect(new URL("/uebersicht", request.url));
  }

  if (user && AUTH_ONLY_PATHS.some((authOnlyPath) => path.startsWith(authOnlyPath))) {
    return NextResponse.redirect(new URL("/uebersicht", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
