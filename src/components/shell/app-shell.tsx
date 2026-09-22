import type { ReactNode } from "react";
import type { SessionUser } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function AppShell({
  children,
  user,
}: {
  children: ReactNode;
  user: SessionUser | null;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1">{children}</main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
