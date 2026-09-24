import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PublicShell } from "@/components/shell/public-shell";

// Die Link-Seiten aus den Mails sind nie für Suchmaschinen bestimmt, und der
// Link-Code in der Adresse soll nicht über den Referrer weitergegeben werden.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function NewsletterLayout({ children }: { children: ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
