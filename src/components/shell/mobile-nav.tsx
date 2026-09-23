"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navLinks } from "./nav-links";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hauptnavigation"
      className="sticky bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background md:hidden"
    >
      {navLinks.map((link) => {
        const isActive = pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex min-h-14.5 flex-col items-center justify-center gap-1 border-t-[3px] border-transparent text-[0.6875rem] font-semibold text-neutral-700 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
              isActive && "border-foreground text-foreground"
            )}
          >
            <Icon className="size-5" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
