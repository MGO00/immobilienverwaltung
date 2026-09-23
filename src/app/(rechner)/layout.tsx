import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { PublicShell } from "@/components/shell/public-shell";
import { getSessionUser } from "@/lib/supabase/session-user";

// Die Rechner sind für alle erreichbar. Angemeldete sehen wie bisher die
// App-Navigation, Besucher ohne Anmeldung einen schlichten Kopf- und Fußbereich.
export default async function RechnerGroupLayout({ children }: { children: ReactNode }) {
  const sessionUser = await getSessionUser();

  if (sessionUser) return <AppShell user={sessionUser}>{children}</AppShell>;
  return <PublicShell>{children}</PublicShell>;
}
