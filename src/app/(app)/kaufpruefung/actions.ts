"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAccountId } from "@/lib/supabase/account";
import { z } from "zod";
import type { InteressentStatus } from "@/lib/constants/interessent";
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

  const { data: neu, error } = await supabase
    .from("prospect")
    .insert({ account_id: accountId, ...zuSpalten(parsed.data) })
    .select("id")
    .single();
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

  const { error } = await supabase.from("prospect").update({ status: parsedStatus.data }).eq("id", parsedId.data);
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
