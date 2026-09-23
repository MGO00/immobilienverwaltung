import type { SupabaseClient } from "@supabase/supabase-js";

export const FOTO_BUCKET = "property-photos";
export const FOTO_MAX_BYTES = 8 * 1024 * 1024;
export const FOTO_ERLAUBTE_TYPEN = ["image/jpeg", "image/png", "image/webp"] as const;
const FOTO_SIGNIERUNG_SEKUNDEN = 60 * 60;

export function fotoPfad(accountId: string, propertyId: string): string {
  return `${accountId}/${propertyId}`;
}

export function validiereFoto(file: File): string | null {
  if (!(FOTO_ERLAUBTE_TYPEN as readonly string[]).includes(file.type)) {
    return "Nur JPG, PNG oder WebP sind als Foto erlaubt.";
  }
  if (file.size > FOTO_MAX_BYTES) {
    return "Das Foto darf höchstens 8 MB groß sein.";
  }
  return null;
}

/** Validiert und lädt eine Foto-Datei serverseitig in den privaten Bucket hoch (überschreibt ein vorhandenes Foto). */
export async function ladeFotoHoch(
  supabase: SupabaseClient,
  accountId: string,
  propertyId: string,
  file: File,
): Promise<{ error?: string; pfad?: string }> {
  const validierungsFehler = validiereFoto(file);
  if (validierungsFehler) return { error: validierungsFehler };

  const pfad = fotoPfad(accountId, propertyId);
  const { error } = await supabase.storage.from(FOTO_BUCKET).upload(pfad, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) return { error: "Das Foto konnte nicht hochgeladen werden. Bitte versuch es erneut." };
  return { pfad };
}

/** Serverseitig erzeugte, befristete URL für den privaten Bucket. null wenn kein Foto hinterlegt ist oder das Signieren fehlschlägt. */
export async function erzeugeFotoUrl(supabase: SupabaseClient, pfad: string | null): Promise<string | null> {
  if (!pfad) return null;
  const { data, error } = await supabase.storage.from(FOTO_BUCKET).createSignedUrl(pfad, FOTO_SIGNIERUNG_SEKUNDEN);
  if (error || !data) return null;
  return data.signedUrl;
}
