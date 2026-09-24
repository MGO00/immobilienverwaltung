"use server";

import { redirect } from "next/navigation";
import { DB_FEHLER_IMMOBILIEN_LIMIT, limitMeldung } from "@/lib/constants/tarife";
import { getTarifStatus } from "@/lib/data/tarif";
import { getCurrentAccountId } from "@/lib/supabase/account";
import { createClient } from "@/lib/supabase/server";
import { ladeFotoHoch } from "@/lib/supabase/foto";
import { immobilieSchema, type ImmobilieEingabe } from "@/lib/validation/immobilie";

export type ErstellenState = { error?: string; fieldErrors?: Record<string, string> };

export async function erstelleImmobilie(
  eingabe: ImmobilieEingabe,
  fotoFormData: FormData | null = null,
): Promise<ErstellenState> {
  const parsed = immobilieSchema.safeParse(eingabe);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { error: "Bitte prüf deine Eingaben.", fieldErrors };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/anmelden");
  }

  const accountId = await getCurrentAccountId(supabase, user.id);
  if (!accountId) {
    return { error: "Kein Konto gefunden. Bitte melde dich erneut an." };
  }

  // Tarifgrenze vorab prüfen (klare Meldung). Die Datenbank prüft beim Einfügen
  // noch einmal verbindlich, auch bei zwei gleichzeitigen Tabs.
  const tarifStatus = await getTarifStatus(supabase);
  if (tarifStatus.immobilien.erreicht) {
    return { error: limitMeldung(tarifStatus.tarif, "immobilien") };
  }

  const { data: property, error: propertyError } = await supabase
    .from("property")
    .insert({
      account_id: accountId,
      art: data.art,
      bezeichnung: data.bezeichnung,
      strasse_hausnummer: data.strasseHausnummer,
      plz: data.plz,
      ort: data.ort,
      bundesland: data.bundesland,
      baujahr: data.baujahr,
      grundstuecksflaeche_qm: data.grundstuecksflaecheQm,
      kaufdatum: data.kaufdatum,
      kaufpreis: data.kaufpreis,
      kaufnebenkosten_betrag: data.kaufnebenkostenBetrag,
      darlehen_betrag: data.ohneFinanzierung ? null : data.darlehenBetrag,
      sollzins_prozent: data.ohneFinanzierung ? null : data.sollzinsProzent,
      tilgung_prozent: data.ohneFinanzierung ? null : data.tilgungProzent,
      zinsbindung_bis: data.ohneFinanzierung ? null : data.zinsbindungBis,
    })
    .select("id")
    .single();

  if (propertyError?.code === DB_FEHLER_IMMOBILIEN_LIMIT) {
    return { error: limitMeldung(tarifStatus.tarif, "immobilien") };
  }
  if (propertyError || !property) {
    return { error: "Die Immobilie konnte nicht gespeichert werden. Bitte versuch es erneut." };
  }

  if (data.art === "mehrfamilienhaus") {
    const { error: unitsError } = await supabase.from("unit").insert(
      data.einheiten.map((e) => ({
        account_id: accountId,
        property_id: property.id,
        name: e.name,
        flaeche_qm: e.flaecheQm,
        kaltmiete_monat: e.kaltmieteMonat,
        status: e.status,
      })),
    );
    if (unitsError) {
      return { error: "Die Einheiten konnten nicht gespeichert werden." };
    }
  } else {
    // Der Datenbank-Trigger hat für Wohnung/Haus bereits automatisch eine
    // Einheit angelegt - jetzt mit den echten Werten aus dem Assistenten
    // befüllen (Name bleibt wie vom Trigger vergeben: "Wohnung"/"Haus").
    const { data: autoUnit } = await supabase
      .from("unit")
      .select("id")
      .eq("property_id", property.id)
      .limit(1)
      .maybeSingle();

    if (autoUnit) {
      await supabase
        .from("unit")
        .update({
          flaeche_qm: data.wohnflaecheQm,
          kaltmiete_monat: data.kaltmieteMonat ?? 0,
          status: data.status ?? "leer",
        })
        .eq("id", autoUnit.id);
    }
  }

  const kostenZeilen = Object.entries(data.laufendeKosten)
    .filter(([, betrag]) => betrag > 0)
    .map(([typ, betrag]) => ({
      account_id: accountId,
      property_id: property.id,
      typ,
      betrag_monat: betrag,
    }));

  if (kostenZeilen.length > 0) {
    await supabase.from("running_cost_item").insert(kostenZeilen);
  }

  // Ein Foto ist optional: schlägt der Upload fehl, wird die Immobilie
  // trotzdem angelegt. Das Foto lässt sich jederzeit über "Bearbeiten"
  // nachtragen.
  const foto = fotoFormData?.get("foto");
  if (foto instanceof File && foto.size > 0) {
    const { error, pfad } = await ladeFotoHoch(supabase, accountId, property.id, foto);
    if (!error && pfad) {
      await supabase.from("property").update({ foto_pfad: pfad }).eq("id", property.id);
    }
  }

  redirect(`/immobilien/${property.id}`);
}
