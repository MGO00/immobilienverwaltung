"use server";

import { revalidatePath } from "next/cache";
import { createClient as createStatelessClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { passwortAendernSchema, profilSchema } from "@/lib/validation/einstellungen";

export type EinstellungenState = { error?: string; erfolg?: boolean };

// Reihenfolge wie bei allen Server Actions: Zod → getUser() → Zugriff.
export async function profilSpeichern(_vorher: EinstellungenState, formData: FormData): Promise<EinstellungenState> {
  const parsed = profilSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Bitte prüf deine Eingabe." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  // RLS (profile_update) erlaubt nur die eigene Zeile.
  const { data, error } = await supabase
    .from("profile")
    .update({ display_name: parsed.data.name })
    .eq("user_id", user.id)
    .select("user_id");
  if (error || !data || data.length === 0) return { error: "Das Profil konnte nicht gespeichert werden." };

  // Name steht auch im Nutzermenü jeder Seite.
  revalidatePath("/", "layout");
  return { erfolg: true };
}

// Supabase prüft das bisherige Passwort beim Ändern nicht selbst. Deshalb wird
// es hier vorher mit einem eigenen, zustandslosen Client geprüft: Dieser Client
// speichert keine Cookies, die bestehende Sitzung im Browser bleibt also
// unberührt. Die dabei entstehende Prüf-Sitzung wird sofort wieder beendet,
// und zwar nur diese eine (scope "local"), nicht die übrigen Sitzungen.
async function aktuellesPasswortStimmt(email: string, passwort: string): Promise<boolean> {
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

export async function passwortAendern(_vorher: EinstellungenState, formData: FormData): Promise<EinstellungenState> {
  const parsed = passwortAendernSchema.safeParse({
    aktuell: formData.get("aktuell"),
    neu: formData.get("neu"),
    wiederholung: formData.get("wiederholung"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Bitte prüf deine Eingaben." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Bitte melde dich erneut an." };

  if (!(await aktuellesPasswortStimmt(user.email, parsed.data.aktuell))) {
    // Neutral: kein Hinweis darauf, ob es am Passwort oder an einer Sperre lag.
    return { error: "Das aktuelle Passwort stimmt nicht." };
  }

  // Supabase beendet dabei alle ANDEREN Sitzungen dieses Nutzers (andere Geräte,
  // andere Browser); die aktuelle Sitzung bleibt bestehen. Die Erfolgsmeldung
  // sagt das ausdrücklich, damit niemand unbemerkt abgemeldet wird.
  const { error } = await supabase.auth.updateUser({ password: parsed.data.neu });
  if (error) {
    return {
      error: error.message.includes("should be different")
        ? "Das neue Passwort muss sich vom aktuellen unterscheiden."
        : "Das Passwort konnte nicht geändert werden. Bitte versuch es erneut.",
    };
  }
  return { erfolg: true };
}
