"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fokus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const menueFokus = "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary";

type Bereich = { href: string; label: string; aktivAb?: string };

// Aktiver Bereich laut Handoff Runde 4, Schritt 2: "Ressourcen" auf allen
// Ressourcen-Seiten, "Tipps & Tricks" auf /tipps, dazu "Rechner" auf /rechner und
// allen Rechner-Unterseiten (auf der Startseite bleibt "Rechner" unmarkiert).
function istAktiv(pfad: string, bereich: Bereich): boolean {
  if (!bereich.aktivAb) return false;
  return pfad === bereich.aktivAb || pfad.startsWith(`${bereich.aktivAb}/`);
}

// Öffentliche Navigation für Besucher ohne Anmeldung, gleich auf Startseite,
// Rechnerseiten, Ressourcen, Tipps & Tricks und den Newsletter-Seiten:
// Rechner · Tipps & Tricks · Ressourcen | Anmelden · Registrieren.
// Auf der Startseite springt "Rechner" zum Abschnitt #rechner, sonst zu /rechner.
export function PublicHeader({ rechnerHref = "/rechner" }: { rechnerHref?: string }) {
  const [menuOffen, setMenuOffen] = useState(false);
  const pfad = usePathname();

  const bereiche: Bereich[] = [
    { href: rechnerHref, label: "Rechner", aktivAb: "/rechner" },
    { href: "/tipps", label: "Tipps & Tricks", aktivAb: "/tipps" },
    { href: "/ressourcen", label: "Ressourcen", aktivAb: "/ressourcen" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex min-h-[60px] max-w-[1120px] items-center gap-6 px-4 md:px-6">
        <Link href="/" className={cn("mr-auto whitespace-nowrap text-base tracking-[-0.02em]", fokus)}>
          <span className="font-semibold">Immobilien</span>
          <span className="font-normal">verwaltung</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Hauptnavigation">
          {bereiche.map((bereich) => {
            const aktiv = istAktiv(pfad, bereich);
            return (
              <Link
                key={bereich.label}
                href={bereich.href}
                aria-current={aktiv ? "page" : undefined}
                className={cn(
                  "text-sm text-foreground",
                  aktiv && "underline decoration-1 underline-offset-[6px]",
                  fokus
                )}
              >
                {bereich.label}
              </Link>
            );
          })}
          <span className="h-5 w-px bg-border" aria-hidden="true" />
          <Link href="/anmelden" className={cn("text-sm text-foreground", fokus)}>
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
            aria-controls="oeffentliches-menue"
            className={cn("grid size-11 place-items-center border border-border text-foreground", fokus)}
          >
            {menuOffen ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
          </button>
        </div>
      </div>

      {menuOffen && (
        <nav
          id="oeffentliches-menue"
          aria-label="Menü"
          className="mx-auto flex max-w-[1120px] flex-col border-t border-border px-4 pb-4 md:hidden"
        >
          {bereiche.map((bereich) => {
            const aktiv = istAktiv(pfad, bereich);
            return (
              <Link
                key={bereich.label}
                href={bereich.href}
                onClick={() => setMenuOffen(false)}
                aria-current={aktiv ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center border-b border-border text-[15px]",
                  aktiv && "underline decoration-1 underline-offset-[6px]",
                  menueFokus
                )}
              >
                {bereich.label}
              </Link>
            );
          })}
          <Link
            href="/anmelden"
            onClick={() => setMenuOffen(false)}
            className={cn("flex min-h-12 items-center text-[15px]", menueFokus)}
          >
            Anmelden
          </Link>
        </nav>
      )}
    </header>
  );
}
