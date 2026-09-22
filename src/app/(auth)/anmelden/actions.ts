"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInSchema } from "@/lib/validation/auth";

export type SignInState = { error?: string };

// Immer dieselbe generische Meldung, egal ob E-Mail oder Passwort falsch ist
// (kein Verrat, welcher Teil stimmt) - siehe Prototyp und CLAUDE.md.
const GENERIC_ERROR = "E-Mail oder Passwort stimmt nicht. Bitte prüf deine Eingabe und versuch es erneut.";

export async function signIn(_prevState: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: GENERIC_ERROR };
  }

  redirect("/uebersicht");
}
