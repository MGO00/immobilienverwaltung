"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const linkStil =
  "text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

// Navigation der öffentlichen Startseite: am Desktop Links + Anmelden/Registrieren,
// mobil Registrieren-Button und Menü-Knopf. "Tipps & Tricks" und "Ressourcen"
// folgen erst, wenn es diese Seiten gibt (keine toten Links).
export function StartHeader() {
  const [menuOffen, setMenuOffen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex min-h-[60px] max-w-[1120px] items-center gap-6 px-4 md:px-6">
        <Link
          href="/"
          className="mr-auto whitespace-nowrap text-base tracking-[-0.02em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="font-semibold">Immobilien</span>
          <span className="font-normal">verwaltung</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Hauptnavigation">
          <a href="#rechner" className={linkStil}>
            Rechner
          </a>
          <span className="h-5 w-px bg-border" aria-hidden="true" />
          <Link href="/anmelden" className={linkStil}>
            Anmelden
          </Link>
          <Button asChild>
            <Link href="/registrieren">Registrieren</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Button asChild className="h-10 px-3 text-[13px]">
            <Link href="/registrieren">Registrieren</Link>
          </Button>
          <button
            type="button"
            onClick={() => setMenuOffen((offen) => !offen)}
            aria-label="Menü"
            aria-expanded={menuOffen}
            aria-controls="start-menue"
            className="grid size-11 place-items-center border border-border text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {menuOffen ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
          </button>
        </div>
      </div>

      {menuOffen && (
        <nav
          id="start-menue"
          aria-label="Menü"
          className="mx-auto flex max-w-[1120px] flex-col border-t border-border px-4 pb-4 md:hidden"
        >
          <a
            href="#rechner"
            onClick={() => setMenuOffen(false)}
            className="flex min-h-12 items-center border-b border-border text-[15px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
          >
            Rechner
          </a>
          <Link
            href="/anmelden"
            className="flex min-h-12 items-center text-[15px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
          >
            Anmelden
          </Link>
        </nav>
      )}
    </header>
  );
}
