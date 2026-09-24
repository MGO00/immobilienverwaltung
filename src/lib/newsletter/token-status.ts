import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { newsletterKonfiguriert } from "./konfiguration";
import { istAbgelaufen } from "./regeln";
import { hashToken, sieheWieTokenAus } from "./token";

export type LinkErgebnis = "ok" | "ungueltig" | "abgelaufen" | "nicht_verfuegbar";

// Nur zum Anzeigen der Bestätigungsseite (verändert nichts): Ist der Link noch gültig?
// Bewusst kein Server-Action-Export, damit es nicht von außen aufrufbar ist.
export async function pruefeBestaetigungsToken(token: string): Promise<"gueltig" | LinkErgebnis> {
  if (!newsletterKonfiguriert()) return "nicht_verfuegbar";
  if (!sieheWieTokenAus(token)) return "ungueltig";
  const { data } = await createAdminClient()
    .from("newsletter_subscriber")
    .select("status, confirm_expires_at")
    .eq("confirm_token_hash", hashToken(token))
    .maybeSingle();
  if (!data || data.status !== "pending") return "ungueltig";
  return istAbgelaufen(data.confirm_expires_at ? new Date(data.confirm_expires_at) : null, new Date())
    ? "abgelaufen"
    : "gueltig";
}
