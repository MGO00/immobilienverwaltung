/**
 * Verkleinert ein Bild im Browser, falls die längere Kante maxKante überschreitet
 * (z. B. unbearbeitete Handyfotos). Bleibt das Bild innerhalb des Limits, wird die
 * Originaldatei unverändert zurückgegeben.
 */
export async function verkleinereBildFallsNoetig(file: File, maxKante = 1920, qualitaet = 0.85): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const laengsteKante = Math.max(bitmap.width, bitmap.height);

  if (laengsteKante <= maxKante) {
    bitmap.close();
    return file;
  }

  const skalierung = maxKante / laengsteKante;
  const breite = Math.round(bitmap.width * skalierung);
  const hoehe = Math.round(bitmap.height * skalierung);

  const canvas = document.createElement("canvas");
  canvas.width = breite;
  canvas.height = hoehe;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }
  context.drawImage(bitmap, 0, 0, breite, hoehe);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, file.type, qualitaet));
  if (!blob) return file;

  return new File([blob], file.name, { type: file.type });
}
