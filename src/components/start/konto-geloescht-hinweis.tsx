"use client";

import { Check } from "lucide-react";
import { useSearchParams } from "next/navigation";

// Kurze Bestätigung nach der Kontolöschung (Weiterleitung auf /?konto=geloescht).
// Als Client-Baustein, damit die Startseite selbst statisch bleibt.
export function KontoGeloeschtHinweis() {
  const params = useSearchParams();
  if (params.get("konto") !== "geloescht") return null;
  return (
    <div role="status" className="border-b border-border bg-neutral-100">
      <p className="mx-auto flex max-w-[1120px] items-center gap-2 px-4 py-3 text-sm md:px-6">
        <Check className="size-4 shrink-0" />
        Dein Konto wurde gelöscht. Alle deine Kontodaten sind entfernt.
      </p>
    </div>
  );
}
