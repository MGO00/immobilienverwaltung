import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { beispielrechnungKaufnebenkosten } from "@/lib/start/beispielrechnung";
import { formatCurrency } from "@/lib/format";

// Prozentsätze wie im Design: "3,5 %", "2,0 %", "3,57 %", "9,07 %".
const satzFormat = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
const satz = (wert: number) => `${satzFormat.format(wert)} %`;

function Zeile({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-between gap-3 border-b border-border py-[7px]">{children}</div>;
}

export function Hero() {
  const b = beispielrechnungKaufnebenkosten();

  return (
    <section className="mx-auto grid max-w-[1120px] items-center gap-8 px-4 py-11 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:gap-14 md:px-6 md:py-16">
      <div>
        <p className="mb-3 text-[11px] tracking-[0.1em] text-neutral-700 uppercase">Für private Vermieter</p>
        <h1 className="text-[30px] leading-[1.08] font-semibold tracking-[-0.02em] text-balance md:text-[clamp(30px,3.4vw,42px)]">
          Rechne deine Immobilie durch, bevor du unterschreibst.
        </h1>
        <p className="mt-4 max-w-[520px] text-[17px] leading-[1.55] text-neutral-800 text-pretty">
          Vier kostenlose Rechner für Kaufnebenkosten, Rendite, Finanzierung und Cashflow. Mit Konto speicherst du
          deine Objekte und behältst Mieten, Kosten und Darlehen an einem Ort im Blick.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="h-10 whitespace-nowrap">
            <Link href="/rechner">
              Rechner kostenlos nutzen
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-10 whitespace-nowrap">
            <Link href="/registrieren">Kostenlos registrieren</Link>
          </Button>
        </div>
        <p className="mt-3 text-xs text-neutral-700">Rechner ohne Konto. Konto kostenlos.</p>
      </div>

      <figure className="rounded-[10px] border border-border p-6">
        <figcaption className="mb-4 flex justify-between gap-3 text-[11px] tracking-[0.1em] text-neutral-700 uppercase">
          <span>Beispielrechnung</span>
          <span>Rechner 01</span>
        </figcaption>
        <div className="text-sm tabular-nums">
          <Zeile>
            <span className="text-neutral-700">Kaufpreis</span>
            <span>{formatCurrency(b.kaufpreis, 0)}</span>
          </Zeile>
          <Zeile>
            <span className="text-neutral-700">Bundesland</span>
            <span>{b.bundesland}</span>
          </Zeile>
          <Zeile>
            <span>
              Grunderwerbsteuer <span className="text-neutral-700">{satz(b.grunderwerbsteuer.satzProzent)}</span>
            </span>
            <span>{formatCurrency(b.grunderwerbsteuer.betrag, 0)}</span>
          </Zeile>
          <Zeile>
            <span>
              Notar und Grundbuch <span className="text-neutral-700">{satz(b.notarGrundbuch.satzProzent)}</span>
            </span>
            <span>{formatCurrency(b.notarGrundbuch.betrag, 0)}</span>
          </Zeile>
          <Zeile>
            <span>
              Makler <span className="text-neutral-700">{satz(b.makler.satzProzent)}</span>
            </span>
            <span>{formatCurrency(b.makler.betrag, 0)}</span>
          </Zeile>
        </div>
        <div className="flex items-baseline justify-between gap-3 pt-4">
          <div>
            <p className="text-[15px] font-semibold">Kaufnebenkosten</p>
            <p className="text-xs text-neutral-700 tabular-nums">
              {b.anteilProzent !== null ? `${satz(b.anteilProzent)} des Kaufpreises` : ""}
            </p>
          </div>
          <p className="text-[30px] font-semibold tracking-[-0.02em] whitespace-nowrap text-primary tabular-nums">
            {formatCurrency(b.summe, 0)}
          </p>
        </div>
      </figure>
    </section>
  );
}
