import type { SupabaseClient } from "@supabase/supabase-js";
import { AKTIVE_STATUS } from "@/lib/constants/interessent";
import { grenzeFuer, istTarif, limitErreicht, STANDARD_TARIF, type Tarif } from "@/lib/constants/tarife";

export type TarifStatus = {
  tarif: Tarif;
  immobilien: { anzahl: number; grenze: number | null; erreicht: boolean };
  aktiveInteressenten: { anzahl: number; grenze: number | null; erreicht: boolean };
};

// Tarif des eigenen Kontos (RLS liefert nur das eigene Konto). Fällt im
// Zweifel auf "kostenlos" zurück — die echte Grenze setzt ohnehin die
// Datenbank durch, das hier ist nur für Anzeige und Buttons.
export async function getTarif(supabase: SupabaseClient): Promise<Tarif> {
  const { data } = await supabase.from("account").select("tarif").limit(1).maybeSingle();
  return istTarif(data?.tarif) ? data.tarif : STANDARD_TARIF;
}

// Einfache Zählabfragen über den Index auf account_id (head: true, es werden
// keine Zeilen übertragen, nur die Anzahl).
export async function getTarifStatus(supabase: SupabaseClient): Promise<TarifStatus> {
  const [tarif, immobilien, interessenten] = await Promise.all([
    getTarif(supabase),
    supabase.from("property").select("id", { count: "exact", head: true }),
    supabase.from("prospect").select("id", { count: "exact", head: true }).in("status", [...AKTIVE_STATUS]),
  ]);
  const anzahlImmobilien = immobilien.count ?? 0;
  const anzahlInteressenten = interessenten.count ?? 0;
  const grenzeImmobilien = grenzeFuer(tarif, "immobilien");
  const grenzeInteressenten = grenzeFuer(tarif, "aktiveInteressenten");
  return {
    tarif,
    immobilien: {
      anzahl: anzahlImmobilien,
      grenze: grenzeImmobilien,
      erreicht: limitErreicht(anzahlImmobilien, grenzeImmobilien),
    },
    aktiveInteressenten: {
      anzahl: anzahlInteressenten,
      grenze: grenzeInteressenten,
      erreicht: limitErreicht(anzahlInteressenten, grenzeInteressenten),
    },
  };
}
