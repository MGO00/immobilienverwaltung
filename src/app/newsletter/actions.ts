"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { LinkErgebnis } from "@/lib/newsletter/token-status";
import { newsletterKonfiguriert, siteUrl } from "@/lib/newsletter/konfiguration";
import { sendeBestaetigungsmail } from "@/lib/newsletter/mail";
import {
  ablaufZeitpunkt,
  EINWILLIGUNG_TEXT_VERSION,
  entscheideAnmeldung,
  istAbgelaufen,
} from "@/lib/newsletter/regeln";
import { erzeugeToken, hashToken, sieheWieTokenAus } from "@/lib/newsletter/token";
import { newsletterEmailSchema } from "@/lib/validation/newsletter";

export type NewsletterState = { status: "leer" | "fehler" | "ok"; fehler?: string; email?: string };

// Anmeldung: Zod → Entscheidung → Eintrag "pending" mit Hash → Bestätigungsmail.
// Die Erfolgsmeldung ist immer dieselbe, auch wenn die Adresse schon existiert
// oder bestätigt ist (verrät nicht, wer auf der Liste steht).
export async function newsletterAnmelden(_vorher: NewsletterState, formData: FormData): Promise<NewsletterState> {
  // Honigtopf: Dieses unsichtbare Feld füllen nur Bots aus. Sie bekommen dieselbe
  // Erfolgsmeldung, ohne dass etwas gespeichert oder verschickt wird.
  if (String(formData.get("website") ?? "") !== "") {
    return { status: "ok", email: String(formData.get("email") ?? "") };
  }

  const parsed = newsletterEmailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { status: "fehler", fehler: parsed.error.issues[0]?.message ?? "Bitte gib eine gültige E-Mail-Adresse ein." };
  }
  const email = parsed.data;

  if (!newsletterKonfiguriert()) {
    return { status: "fehler", fehler: "Die Anmeldung ist gerade nicht möglich. Bitte versuch es später erneut." };
  }

  const admin = createAdminClient();
  const jetzt = new Date();

  // Abgelaufene, nie bestätigte Anmeldungen nach einer Woche entfernen (Datensparsamkeit).
  await admin
    .from("newsletter_subscriber")
    .delete()
    .eq("status", "pending")
    .lt("confirm_expires_at", new Date(jetzt.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const { data: vorhanden } = await admin
    .from("newsletter_subscriber")
    .select("id, status, confirmation_sent_at")
    .eq("email", email)
    .maybeSingle();

  const { count } = await admin
    .from("newsletter_subscriber")
    .select("id", { count: "exact", head: true })
    .gt("confirmation_sent_at", new Date(jetzt.getTime() - 60 * 60 * 1000).toISOString());

  const entscheidung = entscheideAnmeldung(
    vorhanden
      ? {
          status: vorhanden.status,
          confirmationSentAt: vorhanden.confirmation_sent_at ? new Date(vorhanden.confirmation_sent_at) : null,
        }
      : null,
    jetzt,
    count ?? 0,
  );

  if (entscheidung === "nichts_senden") return { status: "ok", email };
  if (entscheidung === "limit_erreicht") {
    return { status: "fehler", fehler: "Gerade sind zu viele Anmeldungen eingegangen. Bitte versuch es später erneut." };
  }

  const bestaetigenToken = erzeugeToken();
  const abmeldenToken = erzeugeToken();
  const werte = {
    email,
    status: "pending" as const,
    confirm_token_hash: hashToken(bestaetigenToken),
    confirm_expires_at: ablaufZeitpunkt(jetzt).toISOString(),
    unsubscribe_token_hash: hashToken(abmeldenToken),
    confirmation_sent_at: jetzt.toISOString(),
    confirmed_at: null,
    unsubscribed_at: null,
    consent_text_version: EINWILLIGUNG_TEXT_VERSION,
  };

  const { error: schreibFehler } = vorhanden
    ? await admin.from("newsletter_subscriber").update(werte).eq("id", vorhanden.id)
    : await admin.from("newsletter_subscriber").insert(werte);
  if (schreibFehler) {
    return { status: "fehler", fehler: "Die Anmeldung hat nicht geklappt. Bitte versuch es erneut." };
  }

  try {
    await sendeBestaetigungsmail(
      email,
      `${siteUrl()}/newsletter/bestaetigen?token=${bestaetigenToken}`,
      `${siteUrl()}/newsletter/abmelden?token=${abmeldenToken}`,
    );
  } catch {
    // Sperrfrist zurücknehmen, damit ein sofortiger zweiter Versuch möglich ist.
    await admin.from("newsletter_subscriber").update({ confirmation_sent_at: null }).eq("email", email);
    return { status: "fehler", fehler: "Die Bestätigungs-E-Mail konnte nicht gesendet werden. Bitte versuch es später erneut." };
  }

  return { status: "ok", email };
}



// Bestätigen: bewusst per Knopfdruck auf der Seite (POST) statt schon beim
// Öffnen des Links, damit Mail-Programme, die Links vorab abrufen, nichts
// versehentlich bestätigen.
export async function newsletterBestaetigen(token: string): Promise<LinkErgebnis> {
  if (!newsletterKonfiguriert()) return "nicht_verfuegbar";
  if (!sieheWieTokenAus(token)) return "ungueltig";

  const admin = createAdminClient();
  const jetzt = new Date();
  const { data } = await admin
    .from("newsletter_subscriber")
    .select("id, status, confirm_expires_at")
    .eq("confirm_token_hash", hashToken(token))
    .maybeSingle();

  if (!data || data.status === "confirmed") return "ungueltig";
  if (istAbgelaufen(data.confirm_expires_at ? new Date(data.confirm_expires_at) : null, jetzt)) return "abgelaufen";

  // Bedingtes Update: greift nur, solange der Eintrag noch offen ist (einmal nutzbar).
  const { data: aktualisiert } = await admin
    .from("newsletter_subscriber")
    .update({ status: "confirmed", confirmed_at: jetzt.toISOString(), confirm_token_hash: null, confirm_expires_at: null })
    .eq("id", data.id)
    .eq("status", "pending")
    .select("id");

  return aktualisiert && aktualisiert.length > 0 ? "ok" : "ungueltig";
}

// Abmelden: idempotent (ein zweiter Klick auf denselben Link ist harmlos).
export async function newsletterAbmelden(token: string): Promise<LinkErgebnis> {
  if (!newsletterKonfiguriert()) return "nicht_verfuegbar";
  if (!sieheWieTokenAus(token)) return "ungueltig";

  const admin = createAdminClient();
  const { data } = await admin
    .from("newsletter_subscriber")
    .select("id, status")
    .eq("unsubscribe_token_hash", hashToken(token))
    .maybeSingle();
  if (!data) return "ungueltig";
  if (data.status === "unsubscribed") return "ok";

  const { error } = await admin
    .from("newsletter_subscriber")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString(), confirm_token_hash: null, confirm_expires_at: null })
    .eq("id", data.id);
  return error ? "ungueltig" : "ok";
}
