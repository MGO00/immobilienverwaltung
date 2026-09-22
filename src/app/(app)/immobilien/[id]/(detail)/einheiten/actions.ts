"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAccountId } from "@/lib/supabase/account";
import { createClient } from "@/lib/supabase/server";
import { einheitStatusSchema } from "@/lib/validation/immobilie";
import { z } from "zod";

const einheitEingabeSchema = z.object({
  propertyId: z.string().uuid(),
  name: z.string().min(1, "Bitte eine Bezeichnung für die Einheit angeben."),
  flaecheQm: z.number().min(0).nullable(),
  kaltmieteMonat: z.number().min(0),
  status: einheitStatusSchema,
});

export type EinheitActionState = { error?: string };

export async function einheitHinzufuegen(eingabe: z.infer<typeof einheitEingabeSchema>): Promise<EinheitActionState> {
  const parsed = einheitEingabeSchema.safeParse(eingabe);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bitte prüf deine Eingaben." };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const accountId = await getCurrentAccountId(supabase, user.id);
  if (!accountId) return { error: "Kein Konto gefunden." };

  const { error } = await supabase.from("unit").insert({
    account_id: accountId,
    property_id: data.propertyId,
    name: data.name,
    flaeche_qm: data.flaecheQm,
    kaltmiete_monat: data.kaltmieteMonat,
    status: data.status,
  });

  if (error) return { error: "Die Einheit konnte nicht gespeichert werden." };

  revalidatePath(`/immobilien/${data.propertyId}`);
  return {};
}

const einheitAendernSchema = einheitEingabeSchema.extend({ id: z.string().uuid() });

export async function einheitAendern(eingabe: z.infer<typeof einheitAendernSchema>): Promise<EinheitActionState> {
  const parsed = einheitAendernSchema.safeParse(eingabe);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bitte prüf deine Eingaben." };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("unit")
    .update({
      name: data.name,
      flaeche_qm: data.flaecheQm,
      kaltmiete_monat: data.kaltmieteMonat,
      status: data.status,
    })
    .eq("id", data.id);

  if (error) return { error: "Die Einheit konnte nicht gespeichert werden." };

  revalidatePath(`/immobilien/${data.propertyId}`);
  return {};
}
