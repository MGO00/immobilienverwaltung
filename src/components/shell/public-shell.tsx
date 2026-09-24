import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Schlichter Rahmen für Besucher ohne Anmeldung (öffentliche Rechnerseiten).
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background px-6">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between">
          <Link
            href="/"
            className="whitespace-nowrap text-base tracking-[-0.02em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span className="font-semibold">Immobilien</span>
            <span className="font-normal">verwaltung</span>
          </Link>

          <nav className="flex items-center gap-4" aria-label="Zugang">
            <Link
              href="/anmelden"
              className="text-sm font-semibold text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Anmelden
            </Link>
            <Button asChild>
              <Link href="/registrieren">Registrieren</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1">{children}</main>

      <footer className="flex flex-col items-center gap-2 border-t border-border px-6 py-4 text-xs">
        <p className="text-[0.6875rem] text-neutral-600">
          Alle Berechnungen ohne Gewähr. Keine Steuer- oder Anlageberatung.
        </p>
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
