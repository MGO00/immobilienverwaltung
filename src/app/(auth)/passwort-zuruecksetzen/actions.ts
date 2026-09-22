"use server";

import { redirect } from "next/navigation";
import { authErrorMessage } from "@/lib/supabase/auth-errors";
import { createClient } from "@/lib/supabase/server";
import { newPasswordSchema } from "@/lib/validation/auth";

export type NewPasswordState = { error?: string };

export async function setNewPassword(
  _prevState: NewPasswordState,
  formData: FormData,
): Promise<NewPasswordState> {
  const parsed = newPasswordSchema.safeParse({ password: formData.get("password") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bitte prüf deine Eingabe." };
  }

  // Setzt eine gültige Recovery-Session voraus, die über den Link aus der
  // E-Mail (Aktion in passwort-vergessen/actions.ts) zustande kommt.
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { error: authErrorMessage(error.message) };
  }

  redirect("/uebersicht");
}
