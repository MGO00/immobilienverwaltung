"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { segment: "", label: "Übersicht" },
  { segment: "einheiten", label: "Einheiten" },
  { segment: "kauf-und-finanzierung", label: "Kauf und Finanzierung" },
  { segment: "einnahmen-und-ausgaben", label: "Einnahmen und Ausgaben" },
  { segment: "rechner", label: "Rechner" },
  { segment: "notizen", label: "Notizen" },
];

export function DetailTabs({ id }: { id: string }) {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex gap-4 overflow-x-auto border-b border-border" aria-label="Immobilien-Bereiche">
      {TABS.map((tab) => {
        const href = `/immobilien/${id}${tab.segment ? `/${tab.segment}` : ""}`;
        const isActive = pathname === href;
        return (
          <Link
            key={tab.segment}
            href={href}
            className={cn(
              "-mb-px shrink-0 border-b-2 border-transparent py-3 text-sm font-semibold text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              isActive && "border-foreground text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
