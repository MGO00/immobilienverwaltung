"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/anmelden", label: "Anmelden" },
  { href: "/registrieren", label: "Registrieren" },
];

export function AuthTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex gap-4 border-b border-border">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "-mb-px border-b-2 border-transparent py-3 text-[15px] font-semibold text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              isActive && "border-foreground text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
