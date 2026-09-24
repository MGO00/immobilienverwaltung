"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { einheitStatusSchema, objektArtSchema } from "@/lib/validation/immobilie";
import { z } from "zod";
import { BUNDESLAENDER } from "@/lib/constants/steuersaetze";
import { FOTO_BUCKET } from "@/lib/supabase/foto";

const bearbeitenSchema = z.object({
  id: z.string().uuid(),
  art: objektArtSchema,
  bezeichnung: z.string().min(1, "Gib der Immobilie eine Bezeichnung."),
  strasseHausnummer: z.string().nullable(),
  plz: z.string().nullable(),
  ort: z.string().nullable(),
  bundesland: z.enum(BUNDESLAENDER as unknown as [string, ...string[]]).nullable(),
  baujahr: z.number().int().gt(1000).nullable(),
  grundstuecksflaecheQm: z.number().min(0).nullable(),
  wohnflaecheQm: z.number().min(0).nullable(),
  kaufdatum: z.string().nullable(),
  kaufpreis: z.number().gt(0, "Trag den Kaufpreis ein — ohne ihn lässt sich keine Rendite rechnen."),
  kaufnebenkostenBetrag: z.number().min(0).nullable(),
  ohneFinanzierung: z.boolean(),
  darlehenBetrag: z.number().min(0).nullable(),
  sollzinsProzent: z.number().min(0).nullable(),
  tilgungProzent: z.number().min(0).nullable(),
  zinsbindungBis: z.string().nullable(),
  kaltmieteMonat: z.number().min(0).nullable(),
  status: einheitStatusSchema.nullable(),
  laufendeKosten: z.record(z.string(), z.number().min(0)),
});

export type BearbeitenState = { error?: string };

export async function immobilieAktualisieren(eingabe: z.infer<typeof bearbeitenSchema>): Promise<BearbeitenState> {
  const parsed = bearbeitenSchema.safeParse(eingabe);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bitte prüf deine Eingaben." };
  }
  const data = parsed.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { error: propertyError } = await supabase
    .from("property")
    .update({
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
    .eq("id", data.id);

  if (propertyError) {
    return { error: "Die Immobilie konnte nicht gespeichert werden. Bitte versuch es erneut." };
  }

  if (data.art !== "mehrfamilienhaus") {
    const { data: einzigeEinheit } = await supabase
      .from("unit")
      .select("id")
      .eq("property_id", data.id)
      .limit(1)
      .maybeSingle();

    if (einzigeEinheit) {
      await supabase
        .from("unit")
        .update({
          flaeche_qm: data.wohnflaecheQm,
          kaltmiete_monat: data.kaltmieteMonat ?? 0,
          status: data.status ?? "leer",
        })
        .eq("id", einzigeEinheit.id);
    }
  }

  // Laufende Kosten werden komplett neu geschrieben (löschen + einfügen) -
  // einfacher als abzugleichen, welcher Posten sich geändert hat. Für den
  // seltenen Fall eines Fehlers zwischen den beiden Schritten bleibt die
  // Zugriffsregel (RLS) unverändert bestehen; ein erneuter Speicherversuch
  // stellt den vollständigen Stand wieder her.
  await supabase.from("running_cost_item").delete().eq("property_id", data.id);
  const accountRow = await supabase.from("property").select("account_id").eq("id", data.id).single();
  const accountId = accountRow.data?.account_id;
  const kostenZeilen = Object.entries(data.laufendeKosten)
    .filter(([, betrag]) => betrag > 0)
    .map(([typ, betrag]) => ({
      account_id: accountId,
      property_id: data.id,
      typ,
      betrag_monat: betrag,
    }));
  if (accountId && kostenZeilen.length > 0) {
    await supabase.from("running_cost_item").insert(kostenZeilen);
  }

  revalidatePath(`/immobilien/${data.id}`);
  redirect(`/immobilien/${data.id}`);
}

export async function immobilieLoeschen(propertyId: string): Promise<{ error?: string }> {
  if (!z.string().uuid().safeParse(propertyId).success) {
    return { error: "Die Immobilie konnte nicht gelöscht werden. Bitte versuch es erneut." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  // Die Datenbank-Kaskade beim Löschen der Immobilie betrifft nur andere
  // Tabellenzeilen, nicht die Foto-Datei im Storage - die muss hier explizit
  // entfernt werden. Schlägt das fehl, wird trotzdem gelöscht: eine im
  // Ausnahmefall verwaiste Datei ist das kleinere Problem als eine blockierte
  // Löschung.
  const { data: property } = await supabase.from("property").select("foto_pfad").eq("id", propertyId).maybeSingle();
  if (property?.foto_pfad) {
    await supabase.storage.from(FOTO_BUCKET).remove([property.foto_pfad]);
  }

  const { error } = await supabase.from("property").delete().eq("id", propertyId);
  if (error) {
    return { error: "Die Immobilie konnte nicht gelöscht werden. Bitte versuch es erneut." };
  }
  redirect("/uebersicht");
}
