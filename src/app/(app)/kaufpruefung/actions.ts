"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAccountId } from "@/lib/supabase/account";
import { interessentSchema, type InteressentEingabe } from "@/lib/validation/interessent";

export type InteressentFormState = { error?: string; fieldErrors?: Record<string, string> };

function zuSpalten(daten: InteressentEingabe) {
  return {
    art: daten.art,
    bezeichnung: daten.bezeichnung,
    strasse_hausnummer: daten.strasseHausnummer,
    plz: daten.plz,
    ort: daten.ort,
    bundesland: daten.bundesland,
    kaufpreis: daten.kaufpreis,
    flaeche_qm: daten.flaecheQm,
    kaltmiete_monat: daten.kaltmieteMonat,
    darlehen_betrag: daten.darlehenBetrag,
    sollzins_prozent: daten.sollzinsProzent,
    tilgung_prozent: daten.tilgungProzent,
    inserat_url: daten.inseratUrl,
  };
}

// Reihenfolge wie bei den anderen Server Actions: Zod → getUser() → Zugriff.
export async function interessentAnlegen(eingabe: InteressentEingabe): Promise<InteressentFormState> {
  const parsed = interessentSchema.safeParse(eingabe);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Bitte prüf deine Eingaben.", fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/anmelden");

  const accountId = await getCurrentAccountId(supabase, user.id);
  if (!accountId) return { error: "Kein Konto gefunden. Bitte melde dich erneut an." };

  const { error } = await supabase.from("prospect").insert({ account_id: accountId, ...zuSpalten(parsed.data) });
  if (error) return { error: "Der Interessent konnte nicht gespeichert werden. Bitte versuch es erneut." };

  revalidatePath("/kaufpruefung");
  redirect("/kaufpruefung");
}
