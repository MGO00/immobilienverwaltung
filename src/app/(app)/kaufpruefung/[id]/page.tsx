import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InteressentStatusPille } from "@/components/kaufpruefung/interessent-status-pille";
import { NotizFeld } from "@/components/kaufpruefung/notiz-feld";
import { StatusStepper } from "@/components/kaufpruefung/status-stepper";
import { RechnerKarten } from "@/components/rechner/rechner-karten";
import { OBJEKTART_LABEL } from "@/lib/constants/objektart";
import { bundeslandLabel } from "@/lib/constants/steuersaetze";
import { getInteressent } from "@/lib/data/interessenten";
import { formatArea, formatCurrency, formatPercent } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

function Zeile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 text-sm">
      <dt className="text-neutral-600">{label}</dt>
      <dd className="text-right tabular-nums">{children}</dd>
    </div>
  );
}

export default async function InteressentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const interessent = await getInteressent(supabase, id);
  if (!interessent) notFound();

  const adresse = [interessent.strasseHausnummer, [interessent.plz, interessent.ort].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  const hatFinanzierung =
    interessent.darlehenBetrag !== null || interessent.sollzinsProzent !== null || interessent.tilgungProzent !== null;
  const gedimmt = interessent.status === "gekauft" || interessent.status === "abgelehnt";

  return (
    <div className="px-6 py-8">
      <Link
        href="/kaufpruefung"
        className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.06em] text-foreground uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowLeft className="size-3.5" />
        Alle Interessenten
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">{interessent.bezeichnung}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
            {adresse && <span>{adresse}</span>}
            <Badge variant="outline" className="rounded-full border-border text-neutral-700">
              {OBJEKTART_LABEL[interessent.art]}
            </Badge>
          </p>
          <div className="mt-3">
            <InteressentStatusPille status={interessent.status} gross />
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href={`/kaufpruefung/${interessent.id}/bearbeiten`}>Bearbeiten</Link>
        </Button>
      </div>

      <section className="mt-8" aria-labelledby="status-titel">
        <h2 id="status-titel" className="text-sm font-semibold tracking-[0.06em] text-neutral-600 uppercase">
          Stand der Prüfung
        </h2>
        <div className="mt-3">
          <StatusStepper interessentId={interessent.id} status={interessent.status} />
        </div>
        {interessent.status === "gekauft" && interessent.propertyId && (
          <p className="mt-3 text-sm">
            <Link
              href={`/immobilien/${interessent.propertyId}`}
              className="font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Zur Immobilie im Bestand{interessent.propertyBezeichnung ? `: ${interessent.propertyBezeichnung}` : ""}
            </Link>
          </p>
        )}
        {gedimmt && interessent.status === "gekauft" && !interessent.propertyId && (
          <p className="mt-3 text-sm text-neutral-600">Die daraus entstandene Immobilie wurde inzwischen gelöscht.</p>
        )}
      </section>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <section aria-labelledby="stamm-titel">
          <h2 id="stamm-titel" className="text-sm font-semibold tracking-[0.06em] text-neutral-600 uppercase">
            Stammdaten
          </h2>
          <dl className="mt-2">
            <Zeile label="Objektart">{OBJEKTART_LABEL[interessent.art]}</Zeile>
            <Zeile label="Adresse">{adresse || "—"}</Zeile>
            <Zeile label="Bundesland">{interessent.bundesland ? bundeslandLabel(interessent.bundesland) : "—"}</Zeile>
            <Zeile label="Kaufpreis">{formatCurrency(interessent.kaufpreis, 0)}</Zeile>
            <Zeile label="Fläche">{interessent.flaecheQm !== null ? formatArea(interessent.flaecheQm) : "—"}</Zeile>
            <Zeile label="Erwartete Kaltmiete / Monat">
              {interessent.kaltmieteMonat !== null ? formatCurrency(interessent.kaltmieteMonat, 0) : "—"}
            </Zeile>
            <Zeile label="Inserat">
              {interessent.inseratUrl ? (
                <a
                  href={interessent.inseratUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Öffnen <ExternalLink className="size-3.5" />
                  <span className="sr-only">(neuer Tab)</span>
                </a>
              ) : (
                "—"
              )}
            </Zeile>
          </dl>

          {hatFinanzierung && (
            <>
              <h3 className="mt-6 text-sm font-semibold">Geplante Finanzierung</h3>
              <dl className="mt-1">
                <Zeile label="Darlehen">
                  {interessent.darlehenBetrag !== null ? formatCurrency(interessent.darlehenBetrag, 0) : "—"}
                </Zeile>
                <Zeile label="Sollzins">
                  {interessent.sollzinsProzent !== null ? formatPercent(interessent.sollzinsProzent) : "—"}
                </Zeile>
                <Zeile label="Tilgung">
                  {interessent.tilgungProzent !== null ? formatPercent(interessent.tilgungProzent) : "—"}
                </Zeile>
              </dl>
            </>
          )}
        </section>

        <section aria-labelledby="notiz-titel">
          <h2 id="notiz-titel" className="sr-only">
            Notiz
          </h2>
          <NotizFeld interessentId={interessent.id} initial={interessent.notiz ?? ""} />
        </section>
      </div>

      <section className="mt-8" aria-labelledby="rechner-titel">
        <h2 id="rechner-titel" className="text-sm font-semibold tracking-[0.06em] text-neutral-600 uppercase">
          Rechner
        </h2>
        <p className="mt-2 max-w-[560px] text-sm text-neutral-700">
          Die Rechner sind mit den Daten dieses Interessenten vorbefüllt. Laufende Kosten und Kaufnebenkosten sind
          hier noch nicht erfasst.
        </p>
        <RechnerKarten interessentId={interessent.id} />
      </section>
    </div>
  );
}
