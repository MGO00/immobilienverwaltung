import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const RECHNER = [
  {
    nr: "01",
    slug: "kaufnebenkosten",
    titel: "Kaufnebenkosten",
    beschreibung: "Grunderwerbsteuer, Notar, Grundbuch und Makler auf einen Blick.",
  },
  {
    nr: "02",
    slug: "rendite",
    titel: "Rendite",
    beschreibung: "Brutto- und Nettorendite sowie Kaufpreisfaktor.",
  },
  {
    nr: "03",
    slug: "finanzierung",
    titel: "Finanzierung",
    beschreibung: "Annuität, Beleihungsauslauf und Tilgungsplan.",
  },
  {
    nr: "04",
    slug: "cashflow",
    titel: "Cashflow",
    beschreibung: "Miete, laufende Kosten und Finanzierung zusammen.",
  },
] as const;

export function RechnerKarten({ immobilieId, interessentId }: { immobilieId?: string; interessentId?: string }) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
      {RECHNER.map((rechner) => {
        const href = immobilieId
          ? `/rechner/${rechner.slug}?immobilie=${immobilieId}`
          : interessentId
            ? `/rechner/${rechner.slug}?interessent=${interessentId}`
            : `/rechner/${rechner.slug}`;
        return (
          <div key={rechner.nr} className="border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-600">{rechner.nr}</span>
              <Badge variant="outline" className="text-neutral-600">
                Bereit
              </Badge>
            </div>
            <p className="mt-2 font-semibold">{rechner.titel}</p>
            <p className="mt-1 text-sm text-neutral-600">{rechner.beschreibung}</p>
            <Button asChild variant="outline" className="mt-3">
              <Link href={href}>Rechner öffnen</Link>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
