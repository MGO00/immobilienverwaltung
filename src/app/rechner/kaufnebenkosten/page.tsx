import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function KaufnebenkostenPage() {
  return (
    <div className="px-6 py-8">
      <Link
        href="/rechner"
        className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.06em] text-foreground uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowLeft className="size-3.5" />
        Alle Rechner
      </Link>
      <h1 className="mt-3 text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">
        Kaufnebenkosten
      </h1>
      <p className="mt-4 max-w-[560px] text-sm text-neutral-700">
        Eingaben, Berechnung und Ergebnis kommen in Meilenstein 4 – die
        Rechenlogik entsteht als reine, getestete Funktion in
        src/lib/calculators.
      </p>
    </div>
  );
}
