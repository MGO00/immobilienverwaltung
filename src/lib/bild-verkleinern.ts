import { FOTO_UPLOAD_MAX_BYTES } from "@/lib/supabase/foto";

// Stufen, falls das Bild im Originalformat zu groß bleibt (z. B. PNG): als JPEG mit
// schrittweise geringerer Qualität neu kodieren, bis es unter maxBytes liegt.
const JPEG_QUALITAETEN = [0.85, 0.75, 0.65, 0.5];

/**
 * Verkleinert ein Bild im Browser, falls die längere Kante maxKante überschreitet
 * (z. B. unbearbeitete Handyfotos) oder die Datei größer als maxBytes ist (Upload-Grenze,
 * siehe FOTO_UPLOAD_MAX_BYTES). Bleibt das Bild innerhalb beider Grenzen, wird die
 * Originaldatei unverändert zurückgegeben. Gelingt es nicht, unter maxBytes zu kommen,
 * wird das kleinste Ergebnis zurückgegeben; die Größe prüft danach validiereFotoUpload().
 */
export async function verkleinereBildFallsNoetig(
  file: File,
  maxKante = 1920,
  qualitaet = 0.85,
  maxBytes = FOTO_UPLOAD_MAX_BYTES,
): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const laengsteKante = Math.max(bitmap.width, bitmap.height);

  if (laengsteKante <= maxKante && file.size <= maxBytes) {
    bitmap.close();
    return file;
  }

  const skalierung = Math.min(1, maxKante / laengsteKante);
  const breite = Math.round(bitmap.width * skalierung);
  const hoehe = Math.round(bitmap.height * skalierung);

  const kodiere = (typ: string, q: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = breite;
    canvas.height = hoehe;
    const context = canvas.getContext("2d");
    if (!context) return Promise.resolve(null);
    if (typ === "image/jpeg") {
      // JPEG kennt keine Transparenz: weißer statt schwarzer Hintergrund.
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, breite, hoehe);
    }
    context.drawImage(bitmap, 0, 0, breite, hoehe);
    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, typ, q));
  };

  try {
    let blob = await kodiere(file.type, qualitaet);
    let typ = file.type;
    for (const q of JPEG_QUALITAETEN) {
      if (blob && blob.size <= maxBytes) break;
      const versuch = await kodiere("image/jpeg", q);
      if (versuch && (!blob || versuch.size < blob.size)) {
        blob = versuch;
        typ = "image/jpeg";
      }
    }
    if (!blob) return file;
    return new File([blob], file.name, { type: typ });
  } finally {
    bitmap.close();
  }
}
