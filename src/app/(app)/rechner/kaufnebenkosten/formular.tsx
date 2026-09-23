"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { berechneKaufnebenkosten } from "@/lib/calculators/kaufnebenkosten";
import {
  BUNDESLAENDER,
  GRUNDBUCH_PROZENT_STANDARD,
  GRUNDERWERBSTEUER_PROZENT,
  MAKLER_PROZENT_STANDARD,
  NOTAR_PROZENT_STANDARD,
  bundeslandLabel,
} from "@/lib/constants/steuersaetze";
import { formatCurrency, formatPercent } from "@/lib/format";
import { kaufnebenkostenUebernehmen } from "./actions";

type ImmobilieVorbefuellung = {
  id: string;
  bezeichnung: string;
  kaufpreis: number;
  bundesland: string | null;
} | null;

function zuZahl(wert: string): number | null {
  if (wert.trim() === "") return null;
  const zahl = Number(wert.replace(",", "."));
  return Number.isFinite(zahl) ? zahl : null;
}

export function KaufnebenkostenFormular({ immobilie }: { immobilie: ImmobilieVorbefuellung }) {
  const [kaufpreis, setKaufpreis] = useState(immobilie ? String(immobilie.kaufpreis) : "");
  const [bundesland, setBundesland] = useState(immobilie?.bundesland ?? "");
  const [notarProzent, setNotarProzent] = useState(String(NOTAR_PROZENT_STANDARD));
  const [grundbuchProzent, setGrundbuchProzent] = useState(String(GRUNDBUCH_PROZENT_STANDARD));
  const [maklerAktiv, setMaklerAktiv] = useState(true);
  const [maklerProzent, setMaklerProzent] = useState(String(MAKLER_PROZENT_STANDARD));
  const [uebernommen, setUebernommen] = useState(false);
  const [uebernehmenFehler, setUebernehmenFehler] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const kaufpreisZahl = zuZahl(kaufpreis) ?? 0;
  const grunderwerbsteuerProzent = bundesland ? GRUNDERWERBSTEUER_PROZENT[bundesland] : null;

  const ergebnis =
    kaufpreisZahl > 0 && grunderwerbsteuerProzent !== null
      ? berechneKaufnebenkosten(
          kaufpreisZahl,
          grunderwerbsteuerProzent,
          zuZahl(notarProzent) ?? 0,
          zuZahl(grundbuchProzent) ?? 0,
          maklerAktiv ? (zuZahl(maklerProzent) ?? 0) : null,
        )
      : null;

  function uebernehmen() {
    if (!immobilie || !ergebnis) return;
    setUebernehmenFehler(null);
    startTransition(async () => {
      const state = await kaufnebenkostenUebernehmen(immobilie.id, ergebnis.summe);
      if (state.error) {
        setUebernehmenFehler(state.error);
      } else {
        setUebernommen(true);
      }
    });
  }

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
          <Label htmlFor="bundesland">Bundesland</Label>
          <Select value={bundesland} onValueChange={setBundesland}>
            <SelectTrigger id="bundesland" className="w-full">
              <SelectValue placeholder="Bundesland wählen" />
            </SelectTrigger>
            <SelectContent>
              {BUNDESLAENDER.map((land) => (
                <SelectItem key={land} value={land}>
                  {bundeslandLabel(land)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-neutral-600">Bestimmt den Grunderwerbsteuersatz.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notar">Notar</Label>
            <div className="flex items-center gap-1.5">
              <Input
                id="notar"
                type="number"
                step="0.1"
                min={0}
                value={notarProzent}
                onChange={(e) => setNotarProzent(e.target.value)}
              />
              <span className="text-sm text-neutral-600">%</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="grundbuch">Grundbuch</Label>
            <div className="flex items-center gap-1.5">
              <Input
                id="grundbuch"
                type="number"
                step="0.1"
                min={0}
                value={grundbuchProzent}
                onChange={(e) => setGrundbuchProzent(e.target.value)}
              />
              <span className="text-sm text-neutral-600">%</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={maklerAktiv} onCheckedChange={(checked) => setMaklerAktiv(checked === true)} />
            Maklerprovision einrechnen
          </label>
          {maklerAktiv && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="makler">Maklerprovision</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  id="makler"
                  type="number"
                  step="0.01"
                  min={0}
                  value={maklerProzent}
                  onChange={(e) => setMaklerProzent(e.target.value)}
                />
                <span className="text-sm text-neutral-600">%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-fit border border-border p-4">
        <p className="text-sm font-semibold">Ergebnis</p>
        {!ergebnis ? (
          <p className="mt-3 text-sm text-neutral-600">
            Trag den Kaufpreis ein und wähl ein Bundesland, dann rechnet der Rechner mit.
          </p>
        ) : (
          <>
            <div className="mt-2">
              {ergebnis.posten.map((posten) => (
                <div key={posten.bezeichnung} className="flex items-center justify-between border-b border-border py-2 text-sm">
                  <span className="text-neutral-600">
                    {posten.bezeichnung} ({formatPercent(posten.satzProzent)})
                  </span>
                  <span className="tabular-nums">{formatCurrency(posten.betrag, 0)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 text-sm font-semibold">
                <span>Kaufnebenkosten gesamt</span>
                <span className="tabular-nums">{formatCurrency(ergebnis.summe, 0)}</span>
              </div>
              {ergebnis.anteilProzent !== null && (
                <p className="text-xs text-neutral-600">{formatPercent(ergebnis.anteilProzent)} vom Kaufpreis</p>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm font-semibold">
              <span>Gesamtinvestition</span>
              <span className="tabular-nums">{formatCurrency(ergebnis.gesamtinvestition, 0)}</span>
            </div>

            {immobilie && (
              <div className="mt-4 border-t border-border pt-3">
                {uebernommen ? (
                  <p className="flex items-center gap-1.5 text-sm text-neutral-700">
                    <Check className="size-4" />
                    Kaufnebenkosten für „{immobilie.bezeichnung}&rdquo; gespeichert.
                  </p>
                ) : (
                  <>
                    <Button type="button" variant="outline" onClick={uebernehmen} disabled={pending}>
                      {pending ? "Speichert …" : `Für „${immobilie.bezeichnung}” übernehmen`}
                    </Button>
                    {uebernehmenFehler && <p className="mt-2 text-xs text-error">{uebernehmenFehler}</p>}
                  </>
                )}
              </div>
            )}

            <p className="mt-4 text-xs text-neutral-600">
              Keine Steuer- oder Anlageberatung. Notar- und Grundbuchkosten sind Erfahrungswerte und können im
              Einzelfall abweichen.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
