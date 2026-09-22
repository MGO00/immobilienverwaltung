import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getImmobilie } from "@/lib/data/immobilie-detail";
import { createClient } from "@/lib/supabase/server";

const RECHNER = [
  {
    nr: "01",
    titel: "Kaufnebenkosten",
    beschreibung: "Grunderwerbsteuer, Notar, Grundbuch und Makler auf einen Blick.",
    href: (id: string) => `/rechner/kaufnebenkosten?immobilie=${id}`,
    bereit: true,
  },
  {
    nr: "02",
    titel: "Rendite",
    beschreibung: "Brutto- und Nettorendite sowie Kaufpreisfaktor.",
    href: () => "/rechner",
    bereit: false,
  },
  {
    nr: "03",
    titel: "Finanzierung",
    beschreibung: "Annuität, Beleihungsauslauf und Tilgungsplan.",
    href: () => "/rechner",
    bereit: false,
  },
  {
    nr: "04",
    titel: "Cashflow",
    beschreibung: "Miete, laufende Kosten und Finanzierung zusammen.",
    href: () => "/rechner",
    bereit: false,
  },
];

export default async function RechnerTabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const immobilie = await getImmobilie(supabase, id);
  if (!immobilie) notFound();

  return (
    <div>
      <p className="max-w-[560px] text-sm text-neutral-700">
        Die Rechner sind mit den Daten dieser Immobilie vorbefüllt.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {RECHNER.map((rechner) => (
          <div key={rechner.nr} className="border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-600">{rechner.nr}</span>
              <Badge variant="outline" className="text-neutral-600">
                {rechner.bereit ? "Bereit" : "kommt noch"}
              </Badge>
            </div>
            <p className="mt-2 font-semibold">{rechner.titel}</p>
            <p className="mt-1 text-sm text-neutral-600">{rechner.beschreibung}</p>
            {rechner.bereit ? (
              <Button asChild variant="outline" className="mt-3">
                <Link href={rechner.href(id)}>Rechner öffnen</Link>
              </Button>
            ) : (
              <Button variant="outline" className="mt-3" disabled>
                Rechner öffnen
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
