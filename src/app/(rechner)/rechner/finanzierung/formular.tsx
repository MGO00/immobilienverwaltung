"use client";

import Link from "next/link";
import { useState } from "react";
import { ErgebnisUngueltig } from "@/components/rechner/ergebnis-ungueltig";
import { useHeute } from "@/components/rechner/use-heute";
import { useZahlFeld } from "@/components/rechner/use-zahl-feld";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ZahlInput } from "@/components/ui/zahl-input";
import { annuitaetMonat, beleihungsauslauf, gesamtinvestition } from "@/lib/calculators/immobilie";
import { darlehenAusEigenkapital, tilgungsplanJaehrlich, tilgungsplanMonatlich } from "@/lib/calculators/finanzierung";
import { formatCurrency, formatPercent } from "@/lib/format";
import { REGEL } from "@/lib/validation/zahl";
import { formatEingabe } from "@/lib/zahl";

type Vorbefuellung = {
  kaufpreis: number;
  kaufnebenkostenBetrag: number | null;
  eigenkapital: number | null;
  sollzinsProzent: number | null;
  tilgungProzent: number | null;
  zinsbindungJahre: string;
  startDatum: string | null;
} | null;

function parseDatumInput(wert: string): Date {
  const [jahr, monat, tag] = wert.split("-").map(Number);
  return new Date(jahr, (monat ?? 1) - 1, tag ?? 1);
}

export function FinanzierungFormular({
  vorbefuellung,
  immobilieId,
  interessentId = null,
}: {
  vorbefuellung: Vorbefuellung;
  immobilieId: string | null;
  interessentId?: string | null;
}) {
  const kaufpreis = useZahlFeld(vorbefuellung ? formatEingabe(vorbefuellung.kaufpreis, { betrag: true }) : "", REGEL.rechnerBetrag);
  const kaufnebenkosten = useZahlFeld(
    vorbefuellung?.kaufnebenkostenBetrag ? formatEingabe(vorbefuellung.kaufnebenkostenBetrag, { betrag: true }) : "",
    REGEL.rechnerBetrag,
  );
  const eigenkapital = useZahlFeld(
    vorbefuellung?.eigenkapital !== null && vorbefuellung?.eigenkapital !== undefined
      ? formatEingabe(vorbefuellung.eigenkapital, { betrag: true })
      : "",
    REGEL.rechnerBetrag,
  );
  const sollzins = useZahlFeld(
    vorbefuellung?.sollzinsProzent ? formatEingabe(vorbefuellung.sollzinsProzent) : "3,5",
    REGEL.rechnerZins,
  );
  const tilgung = useZahlFeld(
    vorbefuellung?.tilgungProzent ? formatEingabe(vorbefuellung.tilgungProzent) : "2",
    REGEL.rechnerTilgung,
  );
  const zinsbindung = useZahlFeld(vorbefuellung?.zinsbindungJahre ?? "10", REGEL.zinsbindungJahre);
  // Ohne Kaufdatum gilt heute als Start. "Heute" kommt erst im Browser (useHeute: lokales
  // Datum, auf Server und beim ersten Rendern null), damit Server und Browser gleich rendern.
  const heute = useHeute();
  const [startDatumEingabe, setStartDatum] = useState(vorbefuellung?.startDatum ?? "");
  const startDatum = startDatumEingabe || heute;

  const ungueltig =
    kaufpreis.ungueltig ||
    kaufnebenkosten.ungueltig ||
    eigenkapital.ungueltig ||
    sollzins.ungueltig ||
    tilgung.ungueltig ||
    zinsbindung.ungueltig;
  const kaufpreisZahl = kaufpreis.wert ?? 0;
  const eigenkapitalZahl = eigenkapital.wert ?? 0;
  const zinsZahl = sollzins.wert ?? 0;
  const tilgungZahl = tilgung.wert ?? 0;
  const zinsbindungJahreZahl = zinsbindung.wert ?? 0;

  const gesamtinvestitionWert = gesamtinvestition(kaufpreisZahl, kaufnebenkosten.wert);
  const darlehenWert = darlehenAusEigenkapital(gesamtinvestitionWert, eigenkapitalZahl);
  const rate = annuitaetMonat(darlehenWert, zinsZahl, tilgungZahl);
  const beleihungsauslaufWert = beleihungsauslauf(darlehenWert, kaufpreisZahl);

  const planMonatlich =
    !ungueltig && startDatum && darlehenWert > 0 && zinsbindungJahreZahl > 0
      ? tilgungsplanMonatlich(darlehenWert, zinsZahl, tilgungZahl, Math.round(zinsbindungJahreZahl * 12), parseDatumInput(startDatum))
      : [];
  const planJaehrlich = tilgungsplanJaehrlich(planMonatlich);
  const zinsenInZinsbindung = planMonatlich.reduce((s, m) => s + m.zinsanteil, 0);

  const cashflowHref = immobilieId
    ? `/rechner/cashflow?immobilie=${immobilieId}`
    : interessentId
      ? `/rechner/cashflow?interessent=${interessentId}`
      : // Rate in Maschinenschreibweise, die Cashflow-Seite wandelt sie für das Feld um.
        `/rechner/cashflow?rate=${!ungueltig && rate !== null ? rate.toFixed(2) : ""}`;

  return (
    <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[0.9fr_1.1fr]">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kaufpreis">Kaufpreis</Label>
            <ZahlInput id="kaufpreis" einheit="€" {...kaufpreis.feld} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kaufnebenkosten">Kaufnebenkosten</Label>
            <ZahlInput id="kaufnebenkosten" einheit="€" {...kaufnebenkosten.feld} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="eigenkapital">Eigenkapital</Label>
          <ZahlInput id="eigenkapital" einheit="€" {...eigenkapital.feld} />
          <p className="text-xs text-neutral-600">Banken erwarten meist mindestens die Nebenkosten.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="zins">Sollzins</Label>
            <ZahlInput id="zins" einheit="%" {...sollzins.feld} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tilgung">Anfängliche Tilgung</Label>
            <ZahlInput id="tilgung" einheit="%" {...tilgung.feld} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="zinsbindung">Zinsbindung</Label>
            <ZahlInput id="zinsbindung" einheit="Jahre" ganzzahl {...zinsbindung.feld} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="startdatum">Startdatum</Label>
            <Input id="startdatum" type="date" value={startDatum ?? ""} onChange={(e) => setStartDatum(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="h-fit border border-border p-4">
        <p className="text-sm font-semibold">Ergebnis</p>
        {ungueltig ? (
          <ErgebnisUngueltig zeilen={["Rate pro Monat", "Darlehen", "Restschuld nach der Zinsbindung"]} />
        ) : darlehenWert <= 0 ? (
          <p className="mt-3 text-sm text-neutral-600">
            Mit diesem Eigenkapital ist kein Darlehen nötig — es fällt keine Rate an.
          </p>
        ) : (
          <>
            <p className="mt-3 text-xs text-neutral-600">Rate pro Monat</p>
            <p className="mt-1 text-[30px] leading-[1.1] font-semibold tabular-nums">
              {rate !== null ? formatCurrency(rate, 0) : "—"}
            </p>
            <p className="text-xs text-neutral-600">
              {formatPercent(zinsZahl)} Zins + {formatPercent(tilgungZahl)} Tilgung
            </p>

            <div className="mt-4">
              <div className="flex items-center justify-between border-b border-border py-2 text-sm">
                <span className="text-neutral-600">Gesamtinvestition</span>
                <span className="tabular-nums">{formatCurrency(gesamtinvestitionWert, 0)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border py-2 text-sm">
                <span className="text-neutral-600">Darlehen</span>
                <span className="tabular-nums">{formatCurrency(darlehenWert, 0)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border py-2 text-sm">
                <span className="text-neutral-600">Beleihungsauslauf</span>
                <span className="tabular-nums">
                  {beleihungsauslaufWert !== null ? formatPercent(beleihungsauslaufWert) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border py-2 text-sm">
                <span className="text-neutral-600">Zinsanteil 1. Monat</span>
                <span className="tabular-nums">{formatCurrency(planMonatlich[0]?.zinsanteil ?? 0, 0)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border py-2 text-sm">
                <span className="text-neutral-600">Tilgungsanteil 1. Monat</span>
                <span className="tabular-nums">{formatCurrency(planMonatlich[0]?.tilgungsanteil ?? 0, 0)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border py-2 text-sm">
                <span className="text-neutral-600">Restschuld nach {zinsbindungJahreZahl} Jahren</span>
                <span className="tabular-nums">{formatCurrency(planMonatlich.at(-1)?.restschuldNachher ?? 0, 0)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 text-sm font-semibold">
                <span>Zinsen in der Zinsbindung</span>
                <span className="tabular-nums">{formatCurrency(zinsenInZinsbindung, 0)}</span>
              </div>
            </div>

            {planJaehrlich.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold">Tilgungsplan</p>
                <div className="mt-2 max-h-[320px] overflow-y-auto border border-border">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b border-border text-left text-neutral-600">
                        <th className="px-2 py-2 font-medium">Jahr</th>
                        <th className="px-2 py-2 font-medium">Zins</th>
                        <th className="px-2 py-2 font-medium">Tilgung</th>
                        <th className="px-2 py-2 font-medium">Restschuld</th>
                      </tr>
                    </thead>
                    <tbody>
                      {planJaehrlich.map((jahr) => (
                        <tr key={jahr.jahr} className="border-b border-border last:border-0">
                          <td className="px-2 py-2 tabular-nums">
                            {jahr.jahr}
                            {jahr.monate < 12 && <span className="text-neutral-600"> ({jahr.monate} Monate)</span>}
                          </td>
                          <td className="px-2 py-2 tabular-nums">{formatCurrency(jahr.zinsSumme, 0)}</td>
                          <td className="px-2 py-2 tabular-nums">{formatCurrency(jahr.tilgungSumme, 0)}</td>
                          <td className="px-2 py-2 tabular-nums">{formatCurrency(jahr.restschuldEnde, 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <Link href={cashflowHref} className="mt-4 inline-block text-xs font-semibold text-primary hover:underline">
              Weiter zum Cashflow-Rechner →
            </Link>

            <p className="mt-4 text-xs text-neutral-600">
              Keine Steuer- oder Anlageberatung. Annuitätendarlehen, monatliche Verrechnung. Sondertilgungen,
              Bereitstellungszinsen und ein KfW-Anteil sind nicht berücksichtigt.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
