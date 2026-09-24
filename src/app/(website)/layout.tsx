import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { PublicShell } from "@/components/shell/public-shell";
import { RECHNER_ROBOTS } from "@/lib/seo/rechner";
import { getSessionUser } from "@/lib/supabase/session-user";

// noindex für Ressourcen und Tipps & Tricks an einer Stelle; Freischalten siehe src/lib/seo/rechner.ts.
export const metadata: Metadata = { robots: RECHNER_ROBOTS };

// Öffentliche Inhaltsseiten (Runde 4, Schritt 2). Wie bei den Rechnern sehen
// Angemeldete den gewohnten App-Rahmen, Besucher die öffentliche Navigation.
export default async function WebsiteGroupLayout({ children }: { children: ReactNode }) {
  const sessionUser = await getSessionUser();

  if (sessionUser) return <AppShell user={sessionUser}>{children}</AppShell>;
  return <PublicShell mitRechnerHinweis={false}>{children}</PublicShell>;
}
