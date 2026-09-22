"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navLinks } from "./nav-links";
import { UserMenu, type SessionUser } from "./user-menu";

export function SiteHeader({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background px-6">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between">
        <Link
          href="/uebersicht"
          className="whitespace-nowrap text-base tracking-[-0.02em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="font-semibold">Immobilien</span>
          <span className="font-normal">verwaltung</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Hauptnavigation">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "-mb-px flex items-center gap-1.5 border-b-2 border-transparent px-2 py-3 text-sm font-semibold text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  isActive && "border-foreground text-foreground"
                )}
              >
                <Icon className="size-4.25" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <UserMenu user={user} />
      </div>
    </header>
  );
}
