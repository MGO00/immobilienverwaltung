"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { aktuellesPasswortStimmt } from "@/lib/supabase/passwort-pruefung";
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
