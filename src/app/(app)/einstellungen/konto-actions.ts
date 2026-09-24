"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { FotoOrdnerFehler, leereFotoOrdner } from "@/lib/konto/foto-ordner";
import { kontoloeschungVerfuegbar } from "@/lib/konto/verfuegbar";
import { createAdminClient } from "@/lib/supabase/admin";
import { FOTO_BUCKET } from "@/lib/supabase/foto";
import { aktuellesPasswortStimmt } from "@/lib/supabase/passwort-pruefung";
import { createClient } from "@/lib/supabase/server";

// passwortFalsch: nur dann wird das Passwortfeld als fehlerhaft markiert.
export type KontoLoeschenState = { error?: string; passwortFalsch?: boolean };

const eingabeSchema = z.object({ passwort: z.string().min(1, "Bitte gib dein Passwort ein.") });

// Kontolöschung. Reihenfolge: Zod → getUser() → Passwort → Fotos (streng) →
// Nutzer löschen → abmelden. Ablauf und Begründung siehe CLAUDE.md
// ("Sicherheit und Datenschutz", Kontolöschung).
export async function kontoLoeschen(_vorher: KontoLoeschenState, formData: FormData): Promise<KontoLoeschenState> {
  const parsed = eingabeSchema.safeParse({ passwort: formData.get("passwort") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bitte gib dein Passwort ein.", passwortFalsch: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Bitte melde dich erneut an." };

  if (!kontoloeschungVerfuegbar()) {
    return { error: "Die Kontolöschung ist gerade nicht verfügbar. Bitte versuch es später erneut." };
  }

  if (!(await aktuellesPasswortStimmt(user.email, parsed.data.passwort))) {
    return { error: "Das Passwort stimmt nicht.", passwortFalsch: true };
  }

  // Konto-ID und Mitglieder serverseitig lesen (RLS: nur das eigene Konto).
  // Die account_id stammt nie aus einer Eingabe des Browsers.
  const { data: mitgliedschaft } = await supabase
    .from("account_member")
    .select("account_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!mitgliedschaft) return { error: "Dein Konto konnte nicht gefunden werden. Bitte versuch es erneut." };
  const accountId: string = mitgliedschaft.account_id;

  const { count: mitglieder } = await supabase
    .from("account_member")
    .select("user_id", { count: "exact", head: true })
    .eq("account_id", accountId);
  const letztesMitglied = (mitglieder ?? 0) <= 1;

  // Fotos ZUERST und streng: Nur wenn der Ordner nachweislich leer ist, wird der
  // Nutzer gelöscht. Sonst weiß nach der Löschung niemand mehr, welche Dateien
  // zu diesem Konto gehörten. Bei weiteren Mitgliedern bleiben Fotos (und Konto
  // samt Daten) für diese erhalten.
  if (letztesMitglied) {
    try {
      // Normaler Client des Nutzers: Die Storage-Regeln erlauben genau diesen Ordner.
      await leereFotoOrdner(supabase.storage.from(FOTO_BUCKET), accountId);
    } catch (e) {
      if (!(e instanceof FotoOrdnerFehler)) throw e;
      return {
        error: "Deine Fotos konnten nicht vollständig gelöscht werden. Dein Konto wurde nicht gelöscht. Bitte versuch es erneut.",
      };
    }
  }

  // Freigegebene Nutzung 2a des Admin-Clients: nur den angemeldeten Nutzer selbst
  // löschen. Die Datenbank-Kaskade entfernt Mitgliedschaft und Profil; beim
  // letzten Mitglied löscht der Trigger delete_account_if_empty() das Konto samt
  // aller Fachdaten (Immobilien, Einheiten, Kosten, Notizen, Interessenten).
  const admin = createAdminClient();
  const { error: loeschFehler } = await admin.auth.admin.deleteUser(user.id);
  if (loeschFehler) {
    return { error: "Dein Konto konnte nicht gelöscht werden. Bitte versuch es erneut." };
  }

  // Freigegebene Nutzung 2b: Nachkontrolle genau dieses Ordners. Hat ein zweiter,
  // gleichzeitig offener Browser in den Sekundenbruchteilen zwischen Foto-Löschung
  // und Nutzer-Löschung noch ein Foto hochgeladen, wird es hier entfernt. Die
  // Löschung ist dann schon passiert; ein Fehler hier blockiert sie nicht mehr.
  if (letztesMitglied) {
    try {
      await leereFotoOrdner(admin.storage.from(FOTO_BUCKET), accountId);
    } catch {
      // bewusst ohne Abbruch: das Konto ist bereits gelöscht
    }
  }

  // Eigene Sitzung beenden. Weil der Nutzer schon gelöscht ist, kann Supabase
  // das ablehnen; die Sitzungs-Cookies werden deshalb zusätzlich direkt entfernt.
  await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
  const cookieStore = await cookies();
  for (const c of cookieStore.getAll()) {
    if (c.name.startsWith("sb-")) cookieStore.delete(c.name);
  }

  redirect("/?konto=geloescht");
}
