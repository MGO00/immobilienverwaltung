import type { ReactNode } from "react";
import { PublicHeader } from "./public-header";

// Rahmen für Besucher ohne Anmeldung (öffentliche Rechnerseiten, Newsletter-Seiten,
// Ressourcen, Tipps & Tricks) mit derselben Navigation wie die Startseite.
// Rechner- und Newsletter-Seiten zeigen in der Fußzeile zusätzlich den
// Beratungshinweis; die Ressourcen-Seiten wie im Handoff nur Impressum · Datenschutz.
export function PublicShell({
  children,
  mitRechnerHinweis = true,
}: {
  children: ReactNode;
  mitRechnerHinweis?: boolean;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <PublicHeader />

      <main className="mx-auto w-full max-w-6xl flex-1">{children}</main>

      <footer className="flex flex-col items-center gap-2 border-t border-border px-6 py-4 text-xs">
        {mitRechnerHinweis && (
          <p className="text-[0.6875rem] text-neutral-600">
            Alle Berechnungen ohne Gewähr. Keine Steuer- oder Anlageberatung.
          </p>
        )}
        <div className="flex gap-4">
          <a href="#impressum" className="text-neutral-700 hover:text-foreground">
            Impressum
          </a>
          <span className="text-neutral-400">·</span>
          <a href="#datenschutz" className="text-neutral-700 hover:text-foreground">
            Datenschutz
          </a>
        </div>
      </footer>
    </div>
  );
}
