import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { annuitaetMonat, eigenkapital, gesamtinvestition } from "@/lib/calculators/immobilie";
import { getImmobilie } from "@/lib/data/immobilie-detail";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

function Zeile({ label, wert, berechnet }: { label: string; wert: string; berechnet?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-sm">
      <span className="text-neutral-600">{label}</span>
      <span className="flex items-center gap-2">
        {berechnet && (
          <Badge variant="outline" className="text-neutral-600">
            berechnet
          </Badge>
        )}
        <span className="tabular-nums">{wert}</span>
      </span>
    </div>
  );
}

export default async function KaufUndFinanzierungPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const immobilie = await getImmobilie(supabase, id);
  if (!immobilie) notFound();

  const gesamtinvestitionWert = gesamtinvestition(immobilie.kaufpreis, immobilie.kaufnebenkostenBetrag);
  const ohneFinanzierung = !immobilie.darlehenBetrag;
  const eigenkapitalWert = eigenkapital(gesamtinvestitionWert, immobilie.darlehenBetrag);
  const annuitaet = annuitaetMonat(immobilie.darlehenBetrag, immobilie.sollzinsProzent, immobilie.tilgungProzent);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <p className="text-sm font-semibold">Kauf</p>
        <div className="mt-2">
          <Zeile label="Kaufdatum" wert={immobilie.kaufdatum ? formatDate(new Date(immobilie.kaufdatum)) : "—"} />
          <Zeile label="Kaufpreis" wert={formatCurrency(immobilie.kaufpreis, 0)} />
          <Zeile
            label="Kaufnebenkosten"
            wert={immobilie.kaufnebenkostenBetrag ? formatCurrency(immobilie.kaufnebenkostenBetrag, 0) : "—"}
          />
          <Zeile label="Gesamtinvestition" wert={formatCurrency(gesamtinvestitionWert, 0)} berechnet />
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold">Finanzierung</p>
        {ohneFinanzierung ? (
          <div className="mt-2">
            <p className="text-sm text-neutral-600">Diese Immobilie wurde ohne Finanzierung eingetragen.</p>
            <Zeile label="Eigenkapital" wert={formatCurrency(eigenkapitalWert, 0)} berechnet />
          </div>
        ) : (
          <div className="mt-2">
            <Zeile label="Darlehen" wert={formatCurrency(immobilie.darlehenBetrag ?? 0, 0)} />
            <Zeile label="Zins" wert={immobilie.sollzinsProzent !== null ? formatPercent(immobilie.sollzinsProzent) : "—"} />
            <Zeile label="Tilgung" wert={immobilie.tilgungProzent !== null ? formatPercent(immobilie.tilgungProzent) : "—"} />
            <Zeile
              label="Zinsbindung bis"
              wert={immobilie.zinsbindungBis ? formatDate(new Date(immobilie.zinsbindungBis)) : "—"}
            />
            <Zeile label="Annuität / Monat" wert={annuitaet !== null ? formatCurrency(annuitaet, 0) : "—"} berechnet />
            <Zeile label="Eigenkapital" wert={formatCurrency(eigenkapitalWert, 0)} berechnet />
          </div>
        )}
      </div>
    </div>
  );
}
