import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OBJEKTART_LABEL } from "@/lib/constants/objektart";
import type { Interessent } from "@/lib/data/interessenten";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { InteressentStatusPille } from "./interessent-status-pille";

export function InteressentZeile({ interessent }: { interessent: Interessent }) {
  const gedimmt = interessent.status === "gekauft" || interessent.status === "abgelehnt";

  return (
    <div className="relative border-b border-border">
      <Link
        href={`/kaufpruefung/${interessent.id}`}
        className="grid gap-2 px-1 py-4 pr-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary grid-cols-2 md:grid-cols-[2.2fr_1fr_1fr_9.5rem] md:items-center md:gap-4"
      >
        <div className="col-span-2 md:col-span-1">
          <p className={cn("font-semibold", gedimmt && "text-neutral-700")}>{interessent.bezeichnung}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
            {interessent.ort && <span>{interessent.ort}</span>}
            <Badge variant="outline" className="rounded-full border-border text-neutral-700">
              {OBJEKTART_LABEL[interessent.art]}
            </Badge>
          </p>
        </div>
        <div className="text-sm">
          <p className="text-xs text-neutral-600">Kaufpreis</p>
          <p className="tabular-nums">{formatCurrency(interessent.kaufpreis, 0)}</p>
        </div>
        <div className="text-sm">
          <p className="text-xs text-neutral-600">Erwartete Miete / Monat</p>
          <p className="tabular-nums">
            {interessent.kaltmieteMonat !== null ? formatCurrency(interessent.kaltmieteMonat, 0) : "—"}
          </p>
        </div>
        <div className="col-span-2 flex flex-wrap items-center gap-2 md:col-span-1 md:justify-end">
          <InteressentStatusPille status={interessent.status} />
        </div>
      </Link>

      {interessent.status === "gekauft" && interessent.propertyId && (
        <p className="px-1 pb-3 text-sm">
          <Link
            href={`/immobilien/${interessent.propertyId}`}
            className="font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Zur Immobilie im Bestand{interessent.propertyBezeichnung ? `: ${interessent.propertyBezeichnung}` : ""}
          </Link>
        </p>
      )}

      {interessent.inseratUrl && (
        <a
          href={interessent.inseratUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Inserat zu ${interessent.bezeichnung} öffnen (neuer Tab)`}
          className="absolute top-4 right-1 text-neutral-600 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ExternalLink className="size-4" />
        </a>
      )}
    </div>
  );
}
