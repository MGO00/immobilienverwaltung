import type { SupabaseClient } from "@supabase/supabase-js";

export const FOTO_BUCKET = "property-photos";
export const FOTO_MAX_BYTES = 8 * 1024 * 1024;
// Obergrenze für den eigentlichen Upload nach dem Verkleinern im Browser. Fotos gehen per
// Server Action an den Server, und Vercel nimmt höchstens 4,5 MB pro Anfrage an (dazu
// passt serverActions.bodySizeLimit in next.config.ts); 4 MB lassen Platz für den Rest.
export const FOTO_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;
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

/** Prüfung der hochzuladenden (bereits verkleinerten) Datei: zusätzlich höchstens FOTO_UPLOAD_MAX_BYTES. */
export function validiereFotoUpload(file: File): string | null {
  const fehler = validiereFoto(file);
  if (fehler) return fehler;
  if (file.size > FOTO_UPLOAD_MAX_BYTES) {
    return "Das Foto ist auch verkleinert noch zu groß. Bitte wähle ein anderes Foto.";
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
  const validierungsFehler = validiereFotoUpload(file);
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
