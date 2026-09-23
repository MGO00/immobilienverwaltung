import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { PublicShell } from "@/components/shell/public-shell";
import { RECHNER_ROBOTS } from "@/lib/seo/rechner";
import { getSessionUser } from "@/lib/supabase/session-user";

// noindex für alle Rechnerseiten an einer Stelle; Freischalten siehe src/lib/seo/rechner.ts.
export const metadata: Metadata = { robots: RECHNER_ROBOTS };

// Die Rechner sind für alle erreichbar. Angemeldete sehen wie bisher die
// App-Navigation, Besucher ohne Anmeldung einen schlichten Kopf- und Fußbereich.
export default async function RechnerGroupLayout({ children }: { children: ReactNode }) {
  const sessionUser = await getSessionUser();

  if (sessionUser) return <AppShell user={sessionUser}>{children}</AppShell>;
  return <PublicShell>{children}</PublicShell>;
}
