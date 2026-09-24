import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// Gemeinsame Bausteine der öffentlichen Seiten aus Runde 4, Schritt 2
// (Ressourcen, Grunderwerbsteuer, Glossar, Tipps & Tricks).

// Seitenbreite und Ränder wie auf der Startseite: 1120 px, 16 px mobil / 24 px Desktop.
export function Seitenrahmen({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("mx-auto w-full max-w-[1120px] px-4 pt-10 pb-11 md:px-6 md:pb-16", className)}>
      {children}
    </section>
  );
}

// Seitenkopf der Übersichten: H1 25 px, Satz 14 px, max. 620 px breit.
export function SeitenKopf({ titel, text }: { titel: string; text: string }) {
  return (
    <div className="mb-8 max-w-[620px]">
      <h1 className="text-[25px] leading-[1.2] font-semibold">{titel}</h1>
      <p className="mt-1.5 text-sm leading-[1.55] text-neutral-700 text-pretty">{text}</p>
    </div>
  );
}

// Zurück-Link oben auf Unterseiten: 12 px, versal, 600, Tinte, Pfeil links.
export function ZurueckLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.06em] text-foreground uppercase hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <ArrowLeft className="size-3.5" strokeWidth={2.5} />
      {children}
    </Link>
  );
}

// Pille "Bereit" (neutral gefüllt, 999 px).
export function PilleBereit() {
  return (
    <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] tracking-[0.02em] text-neutral-800">
      Bereit
    </span>
  );
}

// Pille "in Vorbereitung": bewusst anders als "Bereit", transparent mit gestricheltem Rahmen.
export function PilleInVorbereitung({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-dashed border-neutral-500 px-2 py-0.5 text-[11px] text-neutral-700",
        className
      )}
    >
      in Vorbereitung
    </span>
  );
}
