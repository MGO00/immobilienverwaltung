// Strenges Leeren des Foto-Ordners eines Kontos ({account_id}/ im Bucket
// property-photos) für die Kontolöschung. Erfasst ALLE Dateien im Ordner, nicht
// nur die in property.foto_pfad eingetragenen (auch verwaiste Dateien).
//
// Wichtig: Supabase meldet beim Löschen keinen Fehler, wenn eine Datei wegen
// einer Zugriffsregel nicht gelöscht wurde. Deshalb wird danach erneut
// aufgelistet: Nur ein wirklich leerer Ordner gilt als Erfolg.

// Der benötigte Ausschnitt des Supabase-Storage-Clients (zum Testen nachbildbar).
export type StorageBucket = {
  list: (
    pfad: string,
    optionen: { limit: number; offset: number },
  ) => Promise<{ data: { name: string; id: string | null }[] | null; error: unknown }>;
  remove: (pfade: string[]) => Promise<{ data: unknown; error: unknown }>;
};

const SEITE = 100;

export class FotoOrdnerFehler extends Error {}

// Listet alle Dateien unter "ordner" seitenweise und rekursiv (Einträge ohne id
// sind Unterordner).
export async function listeAlleDateien(bucket: StorageBucket, ordner: string): Promise<string[]> {
  const dateien: string[] = [];
  for (let offset = 0; ; offset += SEITE) {
    const { data, error } = await bucket.list(ordner, { limit: SEITE, offset });
    if (error || !data) throw new FotoOrdnerFehler("Auflisten fehlgeschlagen.");
    for (const eintrag of data) {
      const pfad = `${ordner}/${eintrag.name}`;
      if (eintrag.id === null) dateien.push(...(await listeAlleDateien(bucket, pfad)));
      else dateien.push(pfad);
    }
    if (data.length < SEITE) return dateien;
  }
}

// Löscht alle Dateien im Ordner und prüft danach, dass er leer ist.
// Wirft FotoOrdnerFehler, wenn etwas schiefgeht oder Dateien übrig bleiben.
export async function leereFotoOrdner(bucket: StorageBucket, ordner: string): Promise<number> {
  const dateien = await listeAlleDateien(bucket, ordner);
  for (let i = 0; i < dateien.length; i += SEITE) {
    const { error } = await bucket.remove(dateien.slice(i, i + SEITE));
    if (error) throw new FotoOrdnerFehler("Löschen fehlgeschlagen.");
  }
  const rest = await listeAlleDateien(bucket, ordner);
  if (rest.length > 0) throw new FotoOrdnerFehler(`${rest.length} Datei(en) konnten nicht gelöscht werden.`);
  return dateien.length;
}
