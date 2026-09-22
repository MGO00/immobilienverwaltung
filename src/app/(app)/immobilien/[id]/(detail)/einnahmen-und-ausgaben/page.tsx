import { notFound } from "next/navigation";
import { annuitaetMonat, cashflowMonat, kaltmieteMonatVermietet } from "@/lib/calculators/immobilie";
import { LAUFENDE_KOSTEN_LABEL } from "@/lib/constants/laufende-kosten";
import { getEinheiten, getImmobilie, getLaufendeKosten } from "@/lib/data/immobilie-detail";
import { formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function EinnahmenUndAusgabenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [immobilie, einheiten, kosten] = await Promise.all([
    getImmobilie(supabase, id),
    getEinheiten(supabase, id),
    getLaufendeKosten(supabase, id),
  ]);
  if (!immobilie) notFound();

  const kaltmieteMonat = kaltmieteMonatVermietet(einheiten);
  const laufendeKostenMonat = kosten.reduce((s, k) => s + k.betragMonat, 0);
  const annuitaet = annuitaetMonat(immobilie.darlehenBetrag, immobilie.sollzinsProzent, immobilie.tilgungProzent);
  const cashflow = cashflowMonat(kaltmieteMonat, annuitaet, laufendeKostenMonat);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold">Einnahmen pro Monat</p>
          <div className="mt-2 flex items-center justify-between border-b border-border py-2 text-sm">
            <span className="text-neutral-600">
              {einheiten.length > 1 ? "Kaltmiete (Summe der Einheiten)" : "Kaltmiete"}
            </span>
            <span className="tabular-nums">{formatCurrency(kaltmieteMonat, 0)}</span>
          </div>
          <p className="mt-2 text-xs text-neutral-600">
            Umlagefähige Nebenkosten sind hier nicht enthalten — sie werden an die Mieter weitergereicht und
            wirken sich auf den Cashflow nicht aus.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Laufende Kosten pro Monat</p>
          <div className="mt-2">
            {kosten.length === 0 ? (
              <p className="text-sm text-neutral-600">Keine laufenden Kosten hinterlegt.</p>
            ) : (
              kosten.map((k) => (
                <div key={k.id} className="flex items-center justify-between border-b border-border py-2 text-sm">
                  <span className="text-neutral-600">{LAUFENDE_KOSTEN_LABEL[k.typ]}</span>
                  <span className="tabular-nums">{formatCurrency(k.betragMonat, 0)}</span>
                </div>
              ))
            )}
            <div className="flex items-center justify-between pt-2 text-sm font-semibold">
              <span>Summe</span>
              <span className="tabular-nums">{formatCurrency(laufendeKostenMonat, 0)}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold">Cashflow pro Monat</p>
        <div className="mt-2 max-w-md">
          <div className="flex items-center justify-between border-b border-border py-2 text-sm">
            <span className="text-neutral-600">Kaltmiete</span>
            <span className="tabular-nums">{formatCurrency(kaltmieteMonat, 0)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border py-2 text-sm">
            <span className="text-neutral-600">Annuität</span>
            <span className="tabular-nums">{annuitaet !== null ? `− ${formatCurrency(annuitaet, 0)}` : "—"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border py-2 text-sm">
            <span className="text-neutral-600">Laufende Kosten</span>
            <span className="tabular-nums">− {formatCurrency(laufendeKostenMonat, 0)}</span>
          </div>
          <div className="flex items-center justify-between pt-2 text-sm font-semibold">
            <span>Cashflow</span>
            <span className="tabular-nums">{formatCurrency(cashflow, 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
