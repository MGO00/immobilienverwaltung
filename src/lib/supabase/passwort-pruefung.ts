import "server-only";
import { createClient as createStatelessClient } from "@supabase/supabase-js";

// Supabase prüft ein bisheriges Passwort nicht von selbst (weder beim Ändern des
// Passworts noch beim Löschen des Kontos). Deshalb wird es hier mit einem
// eigenen, zustandslosen Client geprüft: Dieser Client speichert keine Cookies,
// die bestehende Sitzung im Browser bleibt also unberührt. Die dabei entstehende
// Prüf-Sitzung wird sofort wieder beendet, und zwar nur diese eine (scope
// "local"). Jede Prüfung zählt beim Anmelde-Limit von Supabase mit.
export async function aktuellesPasswortStimmt(email: string, passwort: string): Promise<boolean> {
  const pruefClient = createStatelessClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
  const { data, error } = await pruefClient.auth.signInWithPassword({ email, password: passwort });
  if (error || !data.session) return false;
  await pruefClient.auth.signOut({ scope: "local" });
  return true;
}
