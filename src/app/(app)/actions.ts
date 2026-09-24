"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Meldet nur dieses Gerät/diesen Browser ab (scope "local"). Andere Geräte
// bleiben angemeldet. Alle Geräte werden nur beim Ändern des Passworts
// abgemeldet (das macht Supabase dort automatisch).
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/anmelden");
}
