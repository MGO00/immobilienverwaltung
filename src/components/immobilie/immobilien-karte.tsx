import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/format";
import { OBJEKTART_LABEL } from "@/lib/constants/objektart";
import {
  bruttorendite,
  cashflowMonat,
  annuitaetMonat,
  kaltmieteMonatVermietet,
} from "@/lib/calculators/immobilie";
import type { ImmobilieUebersicht } from "@/lib/data/immobilien";

function FotoPlatzhalter({ hoehe }: { hoehe: number }) {
  return (
    <div className="flex w-full items-center justify-center bg-neutral-100" style={{ height: hoehe }}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="text-neutral-400"
      >
        <rect x="3" y="4" width="18" height="16" rx="1" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path d="M21 16l-5-5-4 4-3-3-6 6" />
      </svg>
    </div>
  );
}

export function ImmobilienKarte({ immobilie }: { immobilie: ImmobilieUebersicht }) {
  const einheitenZahl = immobilie.einheiten.length;
  const leerZahl = immobilie.einheiten.filter((e) => e.status === "leer").length;
  const einheitenText = `${einheitenZahl} ${einheitenZahl === 1 ? "Einheit" : "Einheiten"}${
    leerZahl > 0 ? ` · ${leerZahl} leer` : ""
  }`;

  const kaltmieteMonat = kaltmieteMonatVermietet(immobilie.einheiten);
  const jahreskaltmieteWert = kaltmieteMonat * 12;
  const rendite = bruttorendite(jahreskaltmieteWert, immobilie.kaufpreis);
  const annuitaet = annuitaetMonat(immobilie.darlehenBetrag, immobilie.sollzinsProzent, immobilie.tilgungProzent);
  const cashflow = cashflowMonat(kaltmieteMonat, annuitaet, immobilie.laufendeKostenMonat);

  return (
    <Link href={`/immobilien/${immobilie.id}`} className="block border border-border">
      {immobilie.fotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={immobilie.fotoUrl} alt="" className="h-[132px] w-full object-cover" />
      ) : (
        <FotoPlatzhalter hoehe={132} />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold">{immobilie.bezeichnung}</span>
          <Badge variant="outline" className="shrink-0 rounded-full border-border text-neutral-700">
            {einheitenText}
          </Badge>
        </div>
        <p className="mt-0.5 text-sm text-neutral-600">
          {immobilie.ort ? `${immobilie.ort} · ` : ""}
          {OBJEKTART_LABEL[immobilie.art]}
        </p>
        <dl className="mt-3 flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-600">Wert</dt>
            <dd className="tabular-nums">{formatCurrency(immobilie.kaufpreis, 0)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-600">Miete / Monat</dt>
            <dd className="tabular-nums">{formatCurrency(kaltmieteMonat, 0)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-600">Rendite</dt>
            <dd className="tabular-nums">{rendite !== null ? formatPercent(rendite * 100, 1) : "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-600">Cashflow / Monat</dt>
            <dd className="tabular-nums">{formatCurrency(cashflow, 0)}</dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}
