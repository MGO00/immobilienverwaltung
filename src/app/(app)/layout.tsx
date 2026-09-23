import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { getSessionUser } from "@/lib/supabase/session-user";

export default async function AppGroupLayout({ children }: { children: ReactNode }) {
  // sessionUser ist hier praktisch immer gesetzt, da src/proxy.ts nicht
  // angemeldete Nutzer bereits vor dieser Routengruppe zu /anmelden umleitet.
  const sessionUser = await getSessionUser();

  return <AppShell user={sessionUser}>{children}</AppShell>;
}
