"use server";

import { siteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";
import { emailSchema } from "@/lib/validation/auth";

export type ForgotPasswordState = { error?: string; sent?: boolean };

export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: "Bitte gib eine gültige E-Mail-Adresse ein." };
  }

  const supabase = await createClient();

  // Antwort bewusst immer neutral/erfolgreich: Supabase verrät ohnehin nicht,
  // ob zu der Adresse ein Konto existiert - passt zum Text unten.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl()}/auth/confirm?next=/passwort-zuruecksetzen`,
  });

  return { sent: true };
}
