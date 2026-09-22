import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <div className="flex flex-1 justify-center px-4 py-8">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 text-xl tracking-[-0.02em]">
            <span className="font-semibold">Immobilien</span>
            <span className="font-normal">verwaltung</span>
          </div>
          {children}
        </div>
      </div>
      <div className="flex justify-center gap-4 border-t border-border px-4 py-4 text-xs">
        <a href="#impressum" className="text-neutral-700 hover:text-foreground">
          Impressum
        </a>
        <span className="text-neutral-400">·</span>
        <a href="#datenschutz" className="text-neutral-700 hover:text-foreground">
          Datenschutz
        </a>
      </div>
    </div>
  );
}
