import type { SupabaseClient } from "@supabase/supabase-js";
import type { InteressentStatus } from "@/lib/constants/interessent";
import type { ObjektArt } from "@/lib/validation/immobilie";

export type Interessent = {
  id: string;
  art: ObjektArt;
  bezeichnung: string;
  strasseHausnummer: string | null;
  plz: string | null;
  ort: string | null;
  bundesland: string | null;
  kaufpreis: number;
  flaecheQm: number | null;
  kaltmieteMonat: number | null;
  darlehenBetrag: number | null;
  sollzinsProzent: number | null;
  tilgungProzent: number | null;
  inseratUrl: string | null;
  status: InteressentStatus;
  notiz: string | null;
  propertyId: string | null;
  // Bezeichnung der daraus entstandenen Immobilie, falls sie noch existiert.
  propertyBezeichnung: string | null;
};

const SPALTEN =
  "id, art, bezeichnung, strasse_hausnummer, plz, ort, bundesland, kaufpreis, flaeche_qm, kaltmiete_monat, darlehen_betrag, sollzins_prozent, tilgung_prozent, inserat_url, status, notiz, property_id, property(bezeichnung)";

const zuZahl = (wert: string | number | null): number | null => (wert === null ? null : Number(wert));

function zuInteressent(row: Record<string, any>): Interessent { // eslint-disable-line @typescript-eslint/no-explicit-any
  // Der eingebettete Datensatz kommt je nach Beziehung als Objekt oder Liste.
  const property = Array.isArray(row.property) ? row.property[0] : row.property;
  return {
    id: row.id,
    art: row.art,
    bezeichnung: row.bezeichnung,
    strasseHausnummer: row.strasse_hausnummer,
    plz: row.plz,
    ort: row.ort,
    bundesland: row.bundesland,
    kaufpreis: Number(row.kaufpreis),
    flaecheQm: zuZahl(row.flaeche_qm),
    kaltmieteMonat: zuZahl(row.kaltmiete_monat),
    darlehenBetrag: zuZahl(row.darlehen_betrag),
    sollzinsProzent: zuZahl(row.sollzins_prozent),
    tilgungProzent: zuZahl(row.tilgung_prozent),
    inseratUrl: row.inserat_url,
    status: row.status,
    notiz: row.notiz,
    propertyId: row.property_id,
    propertyBezeichnung: property?.bezeichnung ?? null,
  };
}

// RLS sorgt dafür, dass nur Interessenten des eigenen Kontos zurückkommen.
export async function getInteressenten(supabase: SupabaseClient): Promise<Interessent[]> {
  const { data, error } = await supabase.from("prospect").select(SPALTEN).order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(zuInteressent);
}

export async function getInteressent(supabase: SupabaseClient, id: string): Promise<Interessent | null> {
  const { data, error } = await supabase.from("prospect").select(SPALTEN).eq("id", id).maybeSingle();
  if (error || !data) return null;
  return zuInteressent(data);
}
