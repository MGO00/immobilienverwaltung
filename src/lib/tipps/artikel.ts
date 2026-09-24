import { formatDate } from "@/lib/format";

// Datenform eines Artikels in "Tipps & Tricks" (laut Handoff Runde 4, Schritt 2).
// Es gibt noch keine Artikel: Die erste Artikelseite entsteht mit dem ersten echten
// Artikel. Keine öffentliche Seite mit Blindtext (siehe CLAUDE.md).
export type ArtikelStatus = "in Vorbereitung" | "veröffentlicht";

export type ArtikelAbschnitt =
  | { art: "absatz"; text: string }
  | { art: "zwischenueberschrift"; text: string }
  | { art: "liste"; punkte: string[] };

export type VerwandterInhalt = {
  // z. B. "Rechner 02" oder "Ressource"
  art: string;
  titel: string;
  href: string;
};

export type Artikel = {
  titel: string;
  slug: string;
  // JJJJ-MM-TT
  datum?: string;
  lesedauerMinuten?: number;
  teaser?: string;
  bild?: { src: string; alt: string };
  einleitung: string;
  abschnitte: ArtikelAbschnitt[];
  verwandt: VerwandterInhalt[];
  status: ArtikelStatus;
};

/** Meta-Zeile eines Artikels: Datum TT.MM.JJJJ und "N Min. Lesezeit" (fehlende Angaben entfallen). */
export function artikelMeta(artikel: Pick<Artikel, "datum" | "lesedauerMinuten">): string[] {
  const teile: string[] = [];
  if (artikel.datum) {
    const [jahr, monat, tag] = artikel.datum.split("-").map(Number);
    teile.push(formatDate(new Date(jahr, monat - 1, tag)));
  }
  if (artikel.lesedauerMinuten) {
    teile.push(`${artikel.lesedauerMinuten} Min. Lesezeit`);
  }
  return teile;
}
