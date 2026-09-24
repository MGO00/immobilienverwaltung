"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAccountId } from "@/lib/supabase/account";
import { z } from "zod";
import { AKTIVE_STATUS, type InteressentStatus } from "@/lib/constants/interessent";
import { DB_FEHLER_IMMOBILIEN_LIMIT, DB_FEHLER_INTERESSENTEN_LIMIT, limitMeldung } from "@/lib/constants/tarife";
import { getTarifStatus } from "@/lib/data/tarif";
import { kannStatusSetzen } from "@/lib/interessent-regeln";
import {
  interessentNotizSchema,
  interessentSchema,
  interessentStatusSchema,
  type InteressentEingabe,
} from "@/lib/validation/interessent";

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

  // Tarifgrenze vorab (klare Meldung); die Datenbank prüft verbindlich nach.
  const tarifStatus = await getTarifStatus(supabase);
  if (tarifStatus.aktiveInteressenten.erreicht) {
    return { error: limitMeldung(tarifStatus.tarif, "aktiveInteressenten") };
  }

  const { data: neu, error } = await supabase
    .from("prospect")
    .insert({ account_id: accountId, ...zuSpalten(parsed.data) })
    .select("id")
    .single();
  if (error?.code === DB_FEHLER_INTERESSENTEN_LIMIT) {
    return { error: limitMeldung(tarifStatus.tarif, "aktiveInteressenten") };
  }
  if (error || !neu) return { error: "Der Interessent konnte nicht gespeichert werden. Bitte versuch es erneut." };

  revalidatePath("/kaufpruefung");
  redirect(`/kaufpruefung/${neu.id}`);
}

export type InteressentAktionState = { error?: string; erfolg?: boolean };

const idSchema = z.string().uuid();

// Setzt den Status per Klick im Stepper. "gekauft" gibt es nur über die
// Übernahme in den Bestand (kannStatusSetzen), damit nie ein gekaufter
// Interessent ohne Immobilie entsteht.
export async function interessentStatusSetzen(id: string, status: InteressentStatus): Promise<InteressentAktionState> {
  const parsedId = idSchema.safeParse(id);
  const parsedStatus = interessentStatusSchema.safeParse(status);
  if (!parsedId.success || !parsedStatus.success) return { error: "Der Status konnte nicht geändert werden." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { data: aktuell } = await supabase.from("prospect").select("status").eq("id", parsedId.data).maybeSingle();
  if (!aktuell) return { error: "Interessent nicht gefunden." };
  if (!kannStatusSetzen(aktuell.status, parsedStatus.data)) {
    return { error: "Dieser Statuswechsel ist nicht möglich." };
  }

  // Wiederaufnahme (inaktiv -> aktiv) zählt auf das Limit aktiver Interessenten.
  const wirdAktiv = AKTIVE_STATUS.includes(parsedStatus.data) && !AKTIVE_STATUS.includes(aktuell.status);
  const tarifStatus = wirdAktiv ? await getTarifStatus(supabase) : null;
  if (tarifStatus?.aktiveInteressenten.erreicht) {
    return { error: limitMeldung(tarifStatus.tarif, "aktiveInteressenten") };
  }

  const { error } = await supabase.from("prospect").update({ status: parsedStatus.data }).eq("id", parsedId.data);
  if (error?.code === DB_FEHLER_INTERESSENTEN_LIMIT) {
    return { error: limitMeldung((tarifStatus ?? (await getTarifStatus(supabase))).tarif, "aktiveInteressenten") };
  }
  if (error) return { error: "Der Status konnte nicht geändert werden." };

  revalidatePath("/kaufpruefung");
  revalidatePath(`/kaufpruefung/${parsedId.data}`);
  return { erfolg: true };
}

export async function interessentNotizSpeichern(id: string, notiz: string): Promise<InteressentAktionState> {
  const parsedId = idSchema.safeParse(id);
  const parsedNotiz = interessentNotizSchema.safeParse({ notiz });
  if (!parsedId.success) return { error: "Die Notiz konnte nicht gespeichert werden." };
  if (!parsedNotiz.success) return { error: parsedNotiz.error.issues[0]?.message ?? "Die Notiz ist ungültig." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const text = parsedNotiz.data.notiz.trim();
  const { data, error } = await supabase
    .from("prospect")
    .update({ notiz: text === "" ? null : text })
    .eq("id", parsedId.data)
    .select("id");
  if (error || !data || data.length === 0) return { error: "Die Notiz konnte nicht gespeichert werden." };

  revalidatePath(`/kaufpruefung/${parsedId.data}`);
  return { erfolg: true };
}

export async function interessentAktualisieren(id: string, eingabe: InteressentEingabe): Promise<InteressentFormState> {
  const parsedId = idSchema.safeParse(id);
  const parsed = interessentSchema.safeParse(eingabe);
  if (!parsedId.success) return { error: "Der Interessent konnte nicht gespeichert werden." };
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

  // Status, Notiz und Verweis auf die Immobilie bleiben unberührt (nur die Stammdaten).
  const { data, error } = await supabase
    .from("prospect")
    .update(zuSpalten(parsed.data))
    .eq("id", parsedId.data)
    .select("id");
  if (error || !data || data.length === 0) {
    return { error: "Der Interessent konnte nicht gespeichert werden. Bitte versuch es erneut." };
  }

  revalidatePath("/kaufpruefung");
  revalidatePath(`/kaufpruefung/${parsedId.data}`);
  redirect(`/kaufpruefung/${parsedId.data}`);
}

// Löscht nur den Interessenten. Eine daraus entstandene Immobilie im Bestand
// bleibt bestehen (der Verweis liegt am Interessenten, nicht umgekehrt).
export async function interessentLoeschen(id: string): Promise<InteressentAktionState> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { error: "Der Interessent konnte nicht gelöscht werden." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const { data, error } = await supabase.from("prospect").delete().eq("id", parsedId.data).select("id");
  if (error || !data || data.length === 0) {
    return { error: "Der Interessent konnte nicht gelöscht werden. Bitte versuch es erneut." };
  }

  revalidatePath("/kaufpruefung");
  redirect("/kaufpruefung");
}

// Die eigentliche Übernahme passiert atomar in der Datenbankfunktion
// prospect_to_property() (Immobilie + Einheit + Status gekauft + Verweis in
// einer Transaktion). Sie prüft Status und Doppelübernahme selbst und läuft
// unter den Zugriffsregeln (RLS) des angemeldeten Nutzers.
export async function interessentInBestandUebernehmen(id: string): Promise<InteressentAktionState> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { error: "Die Übernahme ist nicht möglich." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  // Die Übernahme legt eine Immobilie an und zählt damit auf das Objektlimit.
  const tarifStatus = await getTarifStatus(supabase);
  if (tarifStatus.immobilien.erreicht) {
    return { error: limitMeldung(tarifStatus.tarif, "immobilien") };
  }

  const { data: neueImmobilieId, error } = await supabase.rpc("prospect_to_property", {
    p_prospect_id: parsedId.data,
  });
  if (error?.code === DB_FEHLER_IMMOBILIEN_LIMIT) {
    return { error: limitMeldung(tarifStatus.tarif, "immobilien") };
  }
  if (error || !neueImmobilieId) {
    // P0001 = eigene, deutsche Fehlermeldung der Datenbankfunktion.
    const meldung = error?.code === "P0001" ? error.message : "Die Übernahme ist fehlgeschlagen. Bitte versuch es erneut.";
    return { error: meldung };
  }

  revalidatePath("/kaufpruefung");
  revalidatePath(`/kaufpruefung/${parsedId.data}`);
  revalidatePath("/uebersicht");
  redirect(`/immobilien/${neueImmobilieId}`);
}
