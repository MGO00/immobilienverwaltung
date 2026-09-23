"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const eingabeSchema = z.object({
  propertyId: z.string().uuid(),
  betrag: z.number().min(0),
});

export type KaufnebenkostenUebernehmenState = { error?: string; erfolg?: boolean };

export async function kaufnebenkostenUebernehmen(
  propertyId: string,
  betrag: number,
): Promise<KaufnebenkostenUebernehmenState> {
  const parsed = eingabeSchema.safeParse({ propertyId, betrag });
  if (!parsed.success) {
    return { error: "Der Betrag konnte nicht übernommen werden." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { error } = await supabase
    .from("property")
    .update({ kaufnebenkosten_betrag: parsed.data.betrag })
    .eq("id", parsed.data.propertyId);

  if (error) return { error: "Die Kaufnebenkosten konnten nicht gespeichert werden." };

  revalidatePath(`/immobilien/${parsed.data.propertyId}`);
  revalidatePath(`/immobilien/${parsed.data.propertyId}/kauf-und-finanzierung`);
  revalidatePath("/uebersicht");
  return { erfolg: true };
}
