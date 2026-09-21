import type { ReactNode } from "react";
import { MobileNav } from "./mobile-nav";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1">{children}</main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
