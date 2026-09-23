import type { SupabaseClient } from "@supabase/supabase-js";
import type { EinheitStatus, ObjektArt } from "@/lib/validation/immobilie";
import type { LaufendeKostenTyp } from "@/lib/constants/laufende-kosten";
import { erzeugeFotoUrl } from "@/lib/supabase/foto";

export type ImmobilieDetail = {
  id: string;
  art: ObjektArt;
  bezeichnung: string;
  strasseHausnummer: string | null;
  plz: string | null;
  ort: string | null;
  bundesland: string | null;
  baujahr: number | null;
  grundstuecksflaecheQm: number | null;
  kaufdatum: string | null;
  kaufpreis: number;
  kaufnebenkostenBetrag: number | null;
  darlehenBetrag: number | null;
  sollzinsProzent: number | null;
  tilgungProzent: number | null;
  zinsbindungBis: string | null;
  fotoUrl: string | null;
};

export async function getImmobilie(supabase: SupabaseClient, id: string): Promise<ImmobilieDetail | null> {
  const { data, error } = await supabase.from("property").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    art: data.art,
    bezeichnung: data.bezeichnung,
    strasseHausnummer: data.strasse_hausnummer,
    plz: data.plz,
    ort: data.ort,
    bundesland: data.bundesland,
    baujahr: data.baujahr,
    grundstuecksflaecheQm: data.grundstuecksflaeche_qm === null ? null : Number(data.grundstuecksflaeche_qm),
    kaufdatum: data.kaufdatum,
    kaufpreis: Number(data.kaufpreis),
    kaufnebenkostenBetrag: data.kaufnebenkosten_betrag === null ? null : Number(data.kaufnebenkosten_betrag),
    darlehenBetrag: data.darlehen_betrag === null ? null : Number(data.darlehen_betrag),
    sollzinsProzent: data.sollzins_prozent === null ? null : Number(data.sollzins_prozent),
    tilgungProzent: data.tilgung_prozent === null ? null : Number(data.tilgung_prozent),
    zinsbindungBis: data.zinsbindung_bis,
    fotoUrl: await erzeugeFotoUrl(supabase, data.foto_pfad),
  };
}

export type EinheitZeile = {
  id: string;
  name: string;
  flaecheQm: number | null;
  kaltmieteMonat: number;
  status: EinheitStatus;
};

export async function getEinheiten(supabase: SupabaseClient, propertyId: string): Promise<EinheitZeile[]> {
  const { data } = await supabase
    .from("unit")
    .select("id, name, flaeche_qm, kaltmiete_monat, status")
    .eq("property_id", propertyId)
    .order("name");

  return (data ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    flaecheQm: e.flaeche_qm === null ? null : Number(e.flaeche_qm),
    kaltmieteMonat: Number(e.kaltmiete_monat),
    status: e.status,
  }));
}

export type LaufenderKostenZeile = { id: string; typ: LaufendeKostenTyp; betragMonat: number };

export async function getLaufendeKosten(
  supabase: SupabaseClient,
  propertyId: string,
): Promise<LaufenderKostenZeile[]> {
  const { data } = await supabase
    .from("running_cost_item")
    .select("id, typ, betrag_monat")
    .eq("property_id", propertyId);

  return (data ?? []).map((k) => ({ id: k.id, typ: k.typ, betragMonat: Number(k.betrag_monat) }));
}

export type NotizZeile = { id: string; text: string; createdAt: string };

export async function getNotizen(supabase: SupabaseClient, propertyId: string): Promise<NotizZeile[]> {
  const { data } = await supabase
    .from("note")
    .select("id, text, created_at")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((n) => ({ id: n.id, text: n.text, createdAt: n.created_at }));
}
