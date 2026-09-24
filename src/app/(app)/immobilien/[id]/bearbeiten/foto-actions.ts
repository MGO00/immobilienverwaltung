"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { FOTO_BUCKET, ladeFotoHoch } from "@/lib/supabase/foto";

export type FotoActionState = { error?: string };

// Reihenfolge wie bei allen Server Actions: Zod → getUser() → Zugriff.
const propertyIdSchema = z.string().uuid();

function revalidiereFotoPfade(propertyId: string) {
  revalidatePath("/uebersicht");
  revalidatePath(`/immobilien/${propertyId}`);
  revalidatePath(`/immobilien/${propertyId}/bearbeiten`);
}

export async function fotoHochladen(propertyId: string, formData: FormData): Promise<FotoActionState> {
  const file = formData.get("foto");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Bitte wähl ein Foto aus." };
  }
  if (!propertyIdSchema.safeParse(propertyId).success) return { error: "Immobilie nicht gefunden." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  // Liefert die Zeile nichts zurück (Immobilie existiert nicht oder gehört
  // nicht zum eigenen Konto, RLS greift), wird sofort abgebrochen - es wird
  // nie mit einer leeren/ungültigen account_id weitergemacht.
  const { data: property, error: propertyError } = await supabase
    .from("property")
    .select("account_id")
    .eq("id", propertyId)
    .maybeSingle();

  if (propertyError || !property) {
    return { error: "Immobilie nicht gefunden." };
  }

  const { error, pfad } = await ladeFotoHoch(supabase, property.account_id, propertyId, file);
  if (error || !pfad) return { error };

  const { error: updateError } = await supabase.from("property").update({ foto_pfad: pfad }).eq("id", propertyId);
  if (updateError) return { error: "Das Foto wurde hochgeladen, konnte aber nicht gespeichert werden." };

  revalidiereFotoPfade(propertyId);
  return {};
}

export async function fotoEntfernen(propertyId: string): Promise<FotoActionState> {
  if (!propertyIdSchema.safeParse(propertyId).success) return { error: "Immobilie nicht gefunden." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { data: property, error: propertyError } = await supabase
    .from("property")
    .select("foto_pfad")
    .eq("id", propertyId)
    .maybeSingle();

  if (propertyError || !property) {
    return { error: "Immobilie nicht gefunden." };
  }

  if (property.foto_pfad) {
    await supabase.storage.from(FOTO_BUCKET).remove([property.foto_pfad]);
  }

  const { error: updateError } = await supabase.from("property").update({ foto_pfad: null }).eq("id", propertyId);
  if (updateError) return { error: "Das Foto konnte nicht entfernt werden." };

  revalidiereFotoPfade(propertyId);
  return {};
}
