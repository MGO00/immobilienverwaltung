"use server";

import { createClient } from "@/lib/supabase/server";

export type ResendState = { sent?: boolean; error?: string };

export async function resendConfirmationEmail(
  _prevState: ResendState,
  formData: FormData,
): Promise<ResendState> {
  const email = formData.get("email");
  if (typeof email !== "string" || !email) {
    return { error: "Die E-Mail-Adresse fehlt." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });

  if (error) {
    return { error: "Das hat nicht geklappt. Bitte versuch es erneut." };
  }

  return { sent: true };
}
