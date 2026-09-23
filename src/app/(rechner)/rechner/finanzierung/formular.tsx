"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { annuitaetMonat, beleihungsauslauf, gesamtinvestition } from "@/lib/calculators/immobilie";
import { darlehenAusEigenkapital, tilgungsplanJaehrlich, tilgungsplanMonatlich } from "@/lib/calculators/finanzierung";
import { formatCurrency, formatPercent } from "@/lib/format";

type Vorbefuellung = {
  kaufpreis: number;
  kaufnebenkostenBetrag: number | null;
  eigenkapital: number | null;
  sollzinsProzent: number | null;
  tilgungProzent: number | null;
  zinsbindungJahre: string;
  startDatum: string | null;
} | null;

function zuZahl(wert: string): number | null {
  if (wert.trim() === "") return null;
  const zahl = Number(wert.replace(",", "."));
  return Number.isFinite(zahl) ? zahl : null;
}

function heuteISO(): string {
  const heute = new Date();
  const monat = String(heute.getMonth() + 1).padStart(2, "0");
  const tag = String(heute.getDate()).padStart(2, "0");
  return `${heute.getFullYear()}-${monat}-${tag}`;
}

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
  const [kaufpreis, setKaufpreis] = useState(vorbefuellung ? String(vorbefuellung.kaufpreis) : "");
  const [kaufnebenkosten, setKaufnebenkosten] = useState(
    vorbefuellung?.kaufnebenkostenBetrag ? String(vorbefuellung.kaufnebenkostenBetrag) : "",
  );
  const [eigenkapital, setEigenkapital] = useState(
    vorbefuellung?.eigenkapital !== null && vorbefuellung?.eigenkapital !== undefined
      ? String(vorbefuellung.eigenkapital)
      : "",
  );
  const [sollzins, setSollzins] = useState(vorbefuellung?.sollzinsProzent ? String(vorbefuellung.sollzinsProzent) : "3.5");
  const [tilgung, setTilgung] = useState(vorbefuellung?.tilgungProzent ? String(vorbefuellung.tilgungProzent) : "2.0");
  const [zinsbindungJahre, setZinsbindungJahre] = useState(vorbefuellung?.zinsbindungJahre ?? "10");
  const [startDatum, setStartDatum] = useState(vorbefuellung?.startDatum ?? heuteISO());

  const kaufpreisZahl = zuZahl(kaufpreis) ?? 0;
  const eigenkapitalZahl = zuZahl(eigenkapital) ?? 0;
  const zinsZahl = zuZahl(sollzins) ?? 0;
  const tilgungZahl = zuZahl(tilgung) ?? 0;
  const zinsbindungJahreZahl = zuZahl(zinsbindungJahre) ?? 0;

  const gesamtinvestitionWert = gesamtinvestition(kaufpreisZahl, zuZahl(kaufnebenkosten));
  const darlehenWert = darlehenAusEigenkapital(gesamtinvestitionWert, eigenkapitalZahl);
  const rate = annuitaetMonat(darlehenWert, zinsZahl, tilgungZahl);
  const beleihungsauslaufWert = beleihungsauslauf(darlehenWert, kaufpreisZahl);

  const planMonatlich =
    darlehenWert > 0 && zinsbindungJahreZahl > 0
      ? tilgungsplanMonatlich(darlehenWert, zinsZahl, tilgungZahl, Math.round(zinsbindungJahreZahl * 12), parseDatumInput(startDatum))
      : [];
  const planJaehrlich = tilgungsplanJaehrlich(planMonatlich);
  const zinsenInZinsbindung = planMonatlich.reduce((s, m) => s + m.zinsanteil, 0);

  const cashflowHref = immobilieId
    ? `/rechner/cashflow?immobilie=${immobilieId}`
    : interessentId
      ? `/rechner/cashflow?interessent=${interessentId}`
      : `/rechner/cashflow?rate=${rate?.toFixed(2) ?? ""}`;

  return (
    <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[0.9fr_1.1fr]">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kaufpreis">Kaufpreis</Label>
            <div className="flex items-center gap-1.5">
              <Input id="kaufpreis" type="number" min={0} value={kaufpreis} onChange={(e) => setKaufpreis(e.target.value)} />
              <span className="text-sm text-neutral-600">€</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kaufnebenkosten">Kaufnebenkosten</Label>
            <div className="flex items-center gap-1.5">
              <Input
                id="kaufnebenkosten"
                type="number"
                min={0}
                value={kaufnebenkosten}
                onChange={(e) => setKaufnebenkosten(e.target.value)}
              />
              <span className="text-sm text-neutral-600">€</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="eigenkapital">Eigenkapital</Label>
          <div className="flex items-center gap-1.5">
            <Input
              id="eigenkapital"
              type="number"
              min={0}
              value={eigenkapital}
              onChange={(e) => setEigenkapital(e.target.value)}
            />
            <span className="text-sm text-neutral-600">€</span>
          </div>
          <p className="text-xs text-neutral-600">Banken erwarten meist mindestens die Nebenkosten.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="zins">Sollzins</Label>
            <div className="flex items-center gap-1.5">
              <Input id="zins" type="number" step="0.1" min={0} value={sollzins} onChange={(e) => setSollzins(e.target.value)} />
              <span className="text-sm text-neutral-600">%</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tilgung">Anfängliche Tilgung</Label>
            <div className="flex items-center gap-1.5">
              <Input id="tilgung" type="number" step="0.1" min={0} value={tilgung} onChange={(e) => setTilgung(e.target.value)} />
              <span className="text-sm text-neutral-600">%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="zinsbindung">Zinsbindung</Label>
            <div className="flex items-center gap-1.5">
              <Input
                id="zinsbindung"
                type="number"
                min={1}
                value={zinsbindungJahre}
                onChange={(e) => setZinsbindungJahre(e.target.value)}
              />
              <span className="text-sm text-neutral-600">Jahre</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="startdatum">Startdatum</Label>
            <Input id="startdatum" type="date" value={startDatum} onChange={(e) => setStartDatum(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="h-fit border border-border p-4">
        <p className="text-sm font-semibold">Ergebnis</p>
        {darlehenWert <= 0 ? (
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
                <span className="text-neutral-600">Restschuld nach {zinsbindungJahre} Jahren</span>
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
