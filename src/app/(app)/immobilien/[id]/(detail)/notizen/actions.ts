"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAccountId } from "@/lib/supabase/account";
import { createClient } from "@/lib/supabase/server";
import { notizSchema } from "@/lib/validation/immobilie";

export type NotizState = { error?: string };

export async function notizHinzufuegen(propertyId: string, _prev: NotizState, formData: FormData): Promise<NotizState> {
  const parsed = notizSchema.safeParse({ text: formData.get("text") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Die Notiz darf nicht leer sein." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const accountId = await getCurrentAccountId(supabase, user.id);
  if (!accountId) return { error: "Kein Konto gefunden." };

  const { error } = await supabase.from("note").insert({
    account_id: accountId,
    property_id: propertyId,
    text: parsed.data.text,
  });

  if (error) return { error: "Die Notiz konnte nicht gespeichert werden." };

  revalidatePath(`/immobilien/${propertyId}/notizen`);
  return {};
}
