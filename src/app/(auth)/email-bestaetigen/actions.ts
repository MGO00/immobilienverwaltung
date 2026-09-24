"use server";

import { createClient } from "@/lib/supabase/server";
import { emailSchema } from "@/lib/validation/auth";

export type ResendState = { sent?: boolean; error?: string };

export async function resendConfirmationEmail(
  _prevState: ResendState,
  formData: FormData,
): Promise<ResendState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bitte gib eine gültige E-Mail-Adresse ein." };
  }
  const { email } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });

  if (error) {
    return { error: "Das hat nicht geklappt. Bitte versuch es erneut." };
  }

  return { sent: true };
}
