import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { createClient } from "@/lib/supabase/server";

export default async function AppGroupLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // user ist hier praktisch immer gesetzt, da src/proxy.ts nicht angemeldete
  // Nutzer bereits vor dieser Routengruppe zu /anmelden umleitet. Defensiv
  // bleiben wir trotzdem, falls das Profil einmal fehlt.
  let displayName = user?.email ?? "";
  if (user) {
    const { data: profile } = await supabase
      .from("profile")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle();
    displayName = profile?.display_name ?? user.email ?? "";
  }

  const sessionUser = user ? { email: user.email ?? "", name: displayName } : null;

  return <AppShell user={sessionUser}>{children}</AppShell>;
}
