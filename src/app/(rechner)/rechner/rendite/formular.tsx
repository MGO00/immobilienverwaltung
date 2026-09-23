"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bruttorendite, gesamtinvestition, kaufpreisfaktor, nettorendite } from "@/lib/calculators/immobilie";
import { formatCurrency, formatPercent } from "@/lib/format";

type Vorbefuellung = {
  kaufpreis: number;
  kaufnebenkostenBetrag: number | null;
  kaltmieteMonat: number;
  kostenMonat: number;
} | null;

function zuZahl(wert: string): number | null {
  if (wert.trim() === "") return null;
  const zahl = Number(wert.replace(",", "."));
  return Number.isFinite(zahl) ? zahl : null;
}

export function RenditeFormular({
  vorbefuellung,
  immobilieId,
}: {
  vorbefuellung: Vorbefuellung;
  immobilieId: string | null;
}) {
  const [kaufpreis, setKaufpreis] = useState(vorbefuellung ? String(vorbefuellung.kaufpreis) : "");
  const [kaufnebenkosten, setKaufnebenkosten] = useState(
    vorbefuellung?.kaufnebenkostenBetrag ? String(vorbefuellung.kaufnebenkostenBetrag) : "",
  );
  const [kaltmiete, setKaltmiete] = useState(vorbefuellung ? String(vorbefuellung.kaltmieteMonat) : "");
  const [kosten, setKosten] = useState(vorbefuellung ? String(vorbefuellung.kostenMonat) : "");

  const kaufpreisZahl = zuZahl(kaufpreis) ?? 0;
  const kaltmieteZahl = zuZahl(kaltmiete) ?? 0;
  const kostenZahl = zuZahl(kosten) ?? 0;
  const kaufnebenkostenZahl = zuZahl(kaufnebenkosten);

  const jahreskaltmieteWert = kaltmieteZahl * 12;
  const gesamtinvestitionWert = gesamtinvestition(kaufpreisZahl, kaufnebenkostenZahl);
  const bruttoRatio = bruttorendite(jahreskaltmieteWert, kaufpreisZahl);
  const netto = nettorendite(jahreskaltmieteWert, kostenZahl * 12, gesamtinvestitionWert);
  const faktor = kaufpreisfaktor(kaufpreisZahl, jahreskaltmieteWert);

  const kaufnebenkostenHref = immobilieId ? `/rechner/kaufnebenkosten?immobilie=${immobilieId}` : "/rechner/kaufnebenkosten";

  return (
    <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[0.9fr_1.1fr]">
      <div className="flex flex-col gap-4">
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
          <p className="text-xs text-neutral-600">Grunderwerbsteuer, Notar, Grundbuch, Makler.</p>
          <Link href={kaufnebenkostenHref} className="self-start text-xs font-semibold text-primary hover:underline">
            Nebenkosten im Rechner Kaufnebenkosten ermitteln
          </Link>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kaltmiete">Kaltmiete pro Monat</Label>
          <div className="flex items-center gap-1.5">
            <Input id="kaltmiete" type="number" min={0} value={kaltmiete} onChange={(e) => setKaltmiete(e.target.value)} />
            <span className="text-sm text-neutral-600">€</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kosten">Nicht umlagefähige Kosten pro Monat</Label>
          <div className="flex items-center gap-1.5">
            <Input id="kosten" type="number" min={0} value={kosten} onChange={(e) => setKosten(e.target.value)} />
            <span className="text-sm text-neutral-600">€</span>
          </div>
          <p className="text-xs text-neutral-600">Hausgeld-Anteil, Rücklage, Verwaltung, Versicherung.</p>
        </div>
      </div>

      <div className="h-fit border border-border p-4">
        <p className="text-sm font-semibold">Ergebnis</p>
        {jahreskaltmieteWert <= 0 ? (
          <p className="mt-3 text-sm text-neutral-600">
            Trag eine Kaltmiete ein — ohne Mieteinnahme lässt sich keine Rendite rechnen.
          </p>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-neutral-600">Bruttorendite</p>
                <p className="mt-1 text-[30px] leading-[1.1] font-semibold tabular-nums">
                  {bruttoRatio !== null ? formatPercent(bruttoRatio * 100) : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-600">Nettorendite</p>
                <p className="mt-1 text-[30px] leading-[1.1] font-semibold tabular-nums">
                  {netto !== null ? formatPercent(netto) : "—"}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between border-b border-border py-2 text-sm">
                <span className="text-neutral-600">Jahreskaltmiete</span>
                <span className="tabular-nums">{formatCurrency(jahreskaltmieteWert, 0)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border py-2 text-sm">
                <span className="text-neutral-600">Laufende Kosten pro Jahr</span>
                <span className="tabular-nums">{formatCurrency(kostenZahl * 12, 0)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border py-2 text-sm">
                <span className="text-neutral-600">Gesamtinvestition</span>
                <span className="tabular-nums">{formatCurrency(gesamtinvestitionWert, 0)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 text-sm font-semibold">
                <span>Kaufpreisfaktor</span>
                <span className="tabular-nums">{faktor !== null ? faktor.toFixed(1) : "—"}</span>
              </div>
            </div>

            {faktor !== null && (
              <p className="mt-4 text-sm text-neutral-700">
                Beim Faktor {faktor.toFixed(1)} ist der Kaufpreis nach rund {Math.round(faktor)} Jahren Kaltmiete
                wieder eingespielt (ohne Kosten, Zinsen oder Steuern).
              </p>
            )}

            <p className="mt-4 text-xs text-neutral-600">
              Keine Steuer- oder Anlageberatung. Die Rendite rechnet vor Steuern und ohne Wertentwicklung oder
              Berücksichtigung künftigen Leerstands.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
