"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cashflowMonat } from "@/lib/calculators/immobilie";
import { tilgungsanteilAusRate } from "@/lib/calculators/finanzierung";
import { formatCurrency } from "@/lib/format";

type Initial = {
  kaltmieteMonat: string;
  kostenMonat: string;
  ruecklageMonat: string;
  verwaltungMonat: string;
  rateMonat: string;
};

type DarlehenKontext = { darlehenBetrag: number | null; sollzinsProzent: number | null } | null;

function zuZahl(wert: string): number | null {
  if (wert.trim() === "") return null;
  const zahl = Number(wert.replace(",", "."));
  return Number.isFinite(zahl) ? zahl : null;
}

export function CashflowFormular({ initial, darlehenKontext }: { initial: Initial; darlehenKontext: DarlehenKontext }) {
  const [kaltmiete, setKaltmiete] = useState(initial.kaltmieteMonat);
  const [kosten, setKosten] = useState(initial.kostenMonat);
  const [ruecklage, setRuecklage] = useState(initial.ruecklageMonat);
  const [verwaltung, setVerwaltung] = useState(initial.verwaltungMonat);
  const [rate, setRate] = useState(initial.rateMonat);

  const kaltmieteZahl = zuZahl(kaltmiete) ?? 0;
  const kostenZahl = zuZahl(kosten) ?? 0;
  const ruecklageZahl = zuZahl(ruecklage) ?? 0;
  const verwaltungZahl = zuZahl(verwaltung) ?? 0;
  const rateZahl = zuZahl(rate) ?? 0;

  const cashflow = cashflowMonat(kaltmieteZahl, rateZahl, kostenZahl + ruecklageZahl + verwaltungZahl);
  const davonTilgung = darlehenKontext
    ? tilgungsanteilAusRate(rateZahl, darlehenKontext.darlehenBetrag, darlehenKontext.sollzinsProzent)
    : null;

  return (
    <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[0.9fr_1.1fr]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kaltmiete">Kaltmiete</Label>
          <div className="flex items-center gap-1.5">
            <Input id="kaltmiete" type="number" min={0} value={kaltmiete} onChange={(e) => setKaltmiete(e.target.value)} />
            <span className="text-sm text-neutral-600">€</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kosten">Nicht umlagefähige Kosten</Label>
          <div className="flex items-center gap-1.5">
            <Input id="kosten" type="number" min={0} value={kosten} onChange={(e) => setKosten(e.target.value)} />
            <span className="text-sm text-neutral-600">€</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ruecklage">Instandhaltungsrücklage</Label>
          <div className="flex items-center gap-1.5">
            <Input id="ruecklage" type="number" min={0} value={ruecklage} onChange={(e) => setRuecklage(e.target.value)} />
            <span className="text-sm text-neutral-600">€</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="verwaltung">Verwaltung und Sonstiges</Label>
          <div className="flex items-center gap-1.5">
            <Input id="verwaltung" type="number" min={0} value={verwaltung} onChange={(e) => setVerwaltung(e.target.value)} />
            <span className="text-sm text-neutral-600">€</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rate">Rate für das Darlehen</Label>
          <div className="flex items-center gap-1.5">
            <Input id="rate" type="number" min={0} value={rate} onChange={(e) => setRate(e.target.value)} />
            <span className="text-sm text-neutral-600">€</span>
          </div>
          <p className="text-xs text-neutral-600">Zins und Tilgung zusammen.</p>
        </div>
      </div>

      <div className="h-fit border border-border p-4">
        <p className="text-sm font-semibold">Ergebnis</p>

        <div className="mt-3">
          <div className="flex items-center justify-between border-b border-border py-2 text-sm">
            <span className="text-neutral-600">Kaltmiete</span>
            <span className="tabular-nums">{formatCurrency(kaltmieteZahl, 0)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border py-2 text-sm">
            <span className="text-neutral-600">Nicht umlagefähige Kosten</span>
            <span className="tabular-nums">− {formatCurrency(kostenZahl, 0)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border py-2 text-sm">
            <span className="text-neutral-600">Instandhaltungsrücklage</span>
            <span className="tabular-nums">− {formatCurrency(ruecklageZahl, 0)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border py-2 text-sm">
            <span className="text-neutral-600">Verwaltung und Sonstiges</span>
            <span className="tabular-nums">− {formatCurrency(verwaltungZahl, 0)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border py-2 text-sm">
            <span className="text-neutral-600">Rate für das Darlehen</span>
            <span className="tabular-nums">− {formatCurrency(rateZahl, 0)}</span>
          </div>
        </div>

        <p className="mt-4 text-xs text-neutral-600">Cashflow pro Monat</p>
        <p className="mt-1 text-[30px] leading-[1.1] font-semibold tabular-nums">{formatCurrency(cashflow, 0)}</p>
        <p className="text-xs text-neutral-600">{formatCurrency(cashflow * 12, 0)} im Jahr</p>

        {davonTilgung !== null && (
          <p className="mt-3 text-sm text-neutral-700">
            Davon Tilgung: <span className="tabular-nums font-semibold">{formatCurrency(davonTilgung, 0)}</span>
          </p>
        )}

        <p className="mt-4 text-xs text-neutral-600">
          Vor Steuern. Abschreibung, Werbungskosten und dein persönlicher Steuersatz sind nicht eingerechnet.
        </p>
      </div>
    </div>
  );
}
