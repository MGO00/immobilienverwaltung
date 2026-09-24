import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sichererPfad } from "@/lib/weiterleitung";

// Ziel jedes Links in Registrierungs- und Passwort-Reset-Mails (siehe
// emailRedirectTo/redirectTo in registrieren/actions.ts und
// passwort-vergessen/actions.ts). Tauscht den Code aus dem Link gegen eine
// echte Sitzung, bevor zur eigentlichen Zielseite weitergeleitet wird - ohne
// diesen Schritt bleibt der Nutzer trotz gültigem Link abgemeldet.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Nur eigene Pfade, sonst ließe sich ein echter Link auf eine fremde Seite umlenken.
  const next = sichererPfad(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/anmelden`);
}
