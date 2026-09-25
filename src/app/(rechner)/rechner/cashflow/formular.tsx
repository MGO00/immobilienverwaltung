"use client";

import { ErgebnisUngueltig } from "@/components/rechner/ergebnis-ungueltig";
import { useZahlFeld } from "@/components/rechner/use-zahl-feld";
import { Label } from "@/components/ui/label";
import { ZahlInput } from "@/components/ui/zahl-input";
import { cashflowMonat } from "@/lib/calculators/immobilie";
import { tilgungsanteilAusRate } from "@/lib/calculators/finanzierung";
import { begrenzeLeerstandProzent, kaltmieteNachLeerstand } from "@/lib/calculators/leerstand";
import { formatCurrency, formatPercent } from "@/lib/format";
import { REGEL } from "@/lib/validation/zahl";

// Startwerte in deutscher Schreibweise (formatEingabe, siehe page.tsx).
type Initial = {
  kaltmieteMonat: string;
  kostenMonat: string;
  ruecklageMonat: string;
  verwaltungMonat: string;
  rateMonat: string;
};

type DarlehenKontext = { darlehenBetrag: number | null; sollzinsProzent: number | null } | null;

export function CashflowFormular({
  initial,
  darlehenKontext,
  mitLeerstandFeld,
}: {
  initial: Initial;
  darlehenKontext: DarlehenKontext;
  mitLeerstandFeld: boolean;
}) {
  const kaltmiete = useZahlFeld(initial.kaltmieteMonat, REGEL.rechnerBetrag);
  const kosten = useZahlFeld(initial.kostenMonat, REGEL.rechnerBetrag);
  const ruecklage = useZahlFeld(initial.ruecklageMonat, REGEL.rechnerBetrag);
  const verwaltung = useZahlFeld(initial.verwaltungMonat, REGEL.rechnerBetrag);
  const rate = useZahlFeld(initial.rateMonat, REGEL.rechnerBetrag);
  const leerstand = useZahlFeld("", REGEL.leerstandProzent);

  const ungueltig =
    kaltmiete.ungueltig ||
    kosten.ungueltig ||
    ruecklage.ungueltig ||
    verwaltung.ungueltig ||
    rate.ungueltig ||
    (mitLeerstandFeld && leerstand.ungueltig);
  const kaltmieteZahl = kaltmiete.wert ?? 0;
  const kostenZahl = kosten.wert ?? 0;
  const ruecklageZahl = ruecklage.wert ?? 0;
  const verwaltungZahl = verwaltung.wert ?? 0;
  const rateZahl = rate.wert ?? 0;

  // Das Leerstand-Feld gibt es nur ohne Bestandsobjekt (mitLeerstandFeld); mit
  // Objekt zählen die echten Einheiten-Ist-Daten, die schon in die vorbefüllte
  // Kaltmiete eingeflossen sind. Getrennt von darlehenKontext, weil auch ein
  // Interessent Darlehensdaten (für "Davon Tilgung") ohne echte Einheiten hat.
  const leerstandProzent = mitLeerstandFeld ? begrenzeLeerstandProzent(leerstand.wert) : 0;
  const kaltmieteEffektiv = kaltmieteNachLeerstand(kaltmieteZahl, leerstandProzent);
  const leerstandAbzug = kaltmieteZahl - kaltmieteEffektiv;

  const cashflow = cashflowMonat(kaltmieteEffektiv, rateZahl, kostenZahl + ruecklageZahl + verwaltungZahl);
  const davonTilgung = darlehenKontext
    ? tilgungsanteilAusRate(rateZahl, darlehenKontext.darlehenBetrag, darlehenKontext.sollzinsProzent)
    : null;

  return (
    <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[0.9fr_1.1fr]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kaltmiete">Kaltmiete</Label>
          <ZahlInput id="kaltmiete" einheit="€" {...kaltmiete.feld} />
        </div>

        {mitLeerstandFeld && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="leerstand">Leerstand (optional)</Label>
            <ZahlInput id="leerstand" einheit="%" {...leerstand.feld} />
            <p className="text-xs text-neutral-600">Geschätzter Anteil des Jahres ohne Mieteinnahmen. Mindert die Kaltmiete.</p>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kosten">Nicht umlagefähige Kosten</Label>
          <ZahlInput id="kosten" einheit="€" {...kosten.feld} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ruecklage">Instandhaltungsrücklage</Label>
          <ZahlInput id="ruecklage" einheit="€" {...ruecklage.feld} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="verwaltung">Verwaltung und Sonstiges</Label>
          <ZahlInput id="verwaltung" einheit="€" {...verwaltung.feld} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rate">Rate für das Darlehen</Label>
          <ZahlInput id="rate" einheit="€" {...rate.feld} />
          <p className="text-xs text-neutral-600">Zins und Tilgung zusammen.</p>
        </div>
      </div>

      <div className="h-fit border border-border p-4">
        <p className="text-sm font-semibold">Ergebnis</p>

        {ungueltig ? (
          <ErgebnisUngueltig zeilen={["Cashflow pro Monat", "Cashflow pro Jahr"]} />
        ) : (
          <>
            <div className="mt-3">
              <div className="flex items-center justify-between border-b border-border py-2 text-sm">
                <span className="text-neutral-600">Kaltmiete</span>
                <span className="tabular-nums">{formatCurrency(kaltmieteZahl, 0)}</span>
              </div>
              {leerstandAbzug > 0 && (
                <div className="flex items-center justify-between border-b border-border py-2 text-sm">
                  <span className="text-neutral-600">Leerstand ({formatPercent(leerstandProzent)})</span>
                  <span className="tabular-nums">− {formatCurrency(leerstandAbzug, 0)}</span>
                </div>
              )}
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
          </>
        )}

        <p className="mt-4 text-xs text-neutral-600">
          Keine Steuer- oder Anlageberatung. Vor Steuern gerechnet — Abschreibung, Werbungskosten und dein
          persönlicher Steuersatz sind nicht eingerechnet.
        </p>
      </div>
    </div>
  );
}
