import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImmobilienKarte } from "@/components/immobilie/immobilien-karte";
import { formatCurrency } from "@/lib/format";
import { getImmobilienUebersicht } from "@/lib/data/immobilien";
import {
  anzahlEinheiten,
  cashflowMonatPortfolio,
  gesamtwert,
  monatsmiete,
  portfolioRendite,
} from "@/lib/calculators/portfolio";
import { createClient } from "@/lib/supabase/server";

export default async function UebersichtPage() {
  const supabase = await createClient();
  const immobilien = await getImmobilienUebersicht(supabase);

  if (immobilien.length === 0) {
    return (
      <div className="px-6 py-8">
        <p className="text-xs font-semibold tracking-[0.06em] text-neutral-600 uppercase">Portfolio</p>
        <h1 className="mt-1 text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">Übersicht</h1>

        <div className="mt-8 max-w-[560px]">
          <h2 className="text-lg font-semibold">Leg deine erste Immobilie an</h2>
          <p className="mt-2 text-sm text-neutral-700">
            Sobald ein Objekt angelegt ist, siehst du hier Wert, Miete, Cashflow und Rendite auf einen Blick.
            Du brauchst nur Kaufpreis, Miete und die Finanzierung — alles andere kannst du später ergänzen.
          </p>
          <div className="mt-4 flex gap-3">
            <Button asChild>
              <Link href="/immobilien/neu">Erste Immobilie hinzufügen</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/rechner">Erst mal rechnen</Link>
            </Button>
          </div>
          <ol className="mt-8 flex flex-col gap-3 text-sm">
            <li className="flex gap-3">
              <span className="font-semibold text-neutral-400">01</span>
              <span>Objektart, Adresse und Wohnfläche eintragen</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-neutral-400">02</span>
              <span>Kaufpreis, Nebenkosten und Finanzierung ergänzen</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-neutral-400">03</span>
              <span>Miete und laufende Kosten — fertig, Kennzahlen rechnen sich selbst</span>
            </li>
          </ol>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Objekte / Einheiten", wert: `${immobilien.length} / ${anzahlEinheiten(immobilien)}` },
    { label: "Gesamtwert", wert: formatCurrency(gesamtwert(immobilien), 0) },
    { label: "Monatsmiete", wert: formatCurrency(monatsmiete(immobilien), 0) },
    { label: "Cashflow / Monat", wert: formatCurrency(cashflowMonatPortfolio(immobilien), 0) },
    {
      label: "Ø Rendite",
      wert: (() => {
        const rendite = portfolioRendite(immobilien);
        return rendite !== null ? `${(rendite * 100).toFixed(1)} %` : "—";
      })(),
    },
  ];

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">Übersicht</h1>
        <Button asChild>
          <Link href="/immobilien/neu">
            <Plus className="size-4" />
            Immobilie hinzufügen
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-5 gap-4 max-md:flex max-md:overflow-x-auto">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="min-w-[46%] border-r border-border pr-4 last:border-r-0 md:min-w-0">
            <p className="text-xs text-neutral-600">{kpi.label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{kpi.wert}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {immobilien.map((immobilie) => (
          <ImmobilienKarte key={immobilie.id} immobilie={immobilie} />
        ))}
      </div>
    </div>
  );
}
