import type { SupabaseClient } from "@supabase/supabase-js";
import type { EinheitStatus, ObjektArt } from "@/lib/validation/immobilie";

export type EinheitZeile = {
  id: string;
  name: string;
  flaecheQm: number | null;
  kaltmieteMonat: number;
  status: EinheitStatus;
};

export type ImmobilieUebersicht = {
  id: string;
  art: ObjektArt;
  bezeichnung: string;
  ort: string | null;
  kaufpreis: number;
  kaufnebenkostenBetrag: number | null;
  darlehenBetrag: number | null;
  sollzinsProzent: number | null;
  tilgungProzent: number | null;
  einheiten: EinheitZeile[];
  laufendeKostenMonat: number;
};

// Für Übersicht und Objektkarten: eine Zeile pro Immobilie, inkl. Einheiten
// und der Summe der laufenden Kosten. RLS sorgt dafür, dass nur Immobilien
// des eigenen Kontos zurückkommen.
export async function getImmobilienUebersicht(supabase: SupabaseClient): Promise<ImmobilieUebersicht[]> {
  const { data, error } = await supabase
    .from("property")
    .select(
      "id, art, bezeichnung, ort, kaufpreis, kaufnebenkosten_betrag, darlehen_betrag, sollzins_prozent, tilgung_prozent, unit(id, name, flaeche_qm, kaltmiete_monat, status), running_cost_item(betrag_monat)",
    )
    .order("bezeichnung");

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    art: row.art,
    bezeichnung: row.bezeichnung,
    ort: row.ort,
    kaufpreis: Number(row.kaufpreis),
    kaufnebenkostenBetrag: row.kaufnebenkosten_betrag === null ? null : Number(row.kaufnebenkosten_betrag),
    darlehenBetrag: row.darlehen_betrag === null ? null : Number(row.darlehen_betrag),
    sollzinsProzent: row.sollzins_prozent === null ? null : Number(row.sollzins_prozent),
    tilgungProzent: row.tilgung_prozent === null ? null : Number(row.tilgung_prozent),
    einheiten: (row.unit ?? []).map((e) => ({
      id: e.id,
      name: e.name,
      flaecheQm: e.flaeche_qm === null ? null : Number(e.flaeche_qm),
      kaltmieteMonat: Number(e.kaltmiete_monat),
      status: e.status,
    })),
    laufendeKostenMonat: (row.running_cost_item ?? []).reduce(
      (summe: number, k: { betrag_monat: number }) => summe + Number(k.betrag_monat),
      0,
    ),
  }));
}
