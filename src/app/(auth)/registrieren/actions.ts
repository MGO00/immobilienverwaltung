"use server";

import { redirect } from "next/navigation";
import { authErrorMessage } from "@/lib/supabase/auth-errors";
import { siteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";
import { signUpSchema } from "@/lib/validation/auth";

export type SignUpState = { error?: string };

export async function signUp(_prevState: SignUpState, formData: FormData): Promise<SignUpState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bitte prüf deine Eingaben." };
  }

  const { name, email, password } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name },
      emailRedirectTo: `${siteUrl()}/auth/confirm?next=/uebersicht`,
    },
  });

  if (error) {
    return { error: authErrorMessage(error.message) };
  }

  redirect(`/email-bestaetigen?email=${encodeURIComponent(email)}`);
}
