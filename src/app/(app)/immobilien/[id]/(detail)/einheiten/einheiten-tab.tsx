"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EinheitDialog, type EinheitFormWert } from "@/components/immobilie/einheit-dialog";
import { StatusPille } from "@/components/immobilie/status-pille";
import { formatArea, formatCurrency, formatPercent } from "@/lib/format";
import { formatEingabe, formatEingabeOptional } from "@/lib/zahl";
import { leerstandsquote, wohnflaecheGesamt } from "@/lib/calculators/immobilie";
import type { EinheitZeile } from "@/lib/data/immobilie-detail";
import type { ObjektArt } from "@/lib/validation/immobilie";
import { einheitAendern, einheitHinzufuegen } from "./actions";

export function EinheitenTab({
  propertyId,
  art,
  einheiten,
}: {
  propertyId: string;
  art: ObjektArt;
  einheiten: EinheitZeile[];
}) {
  const router = useRouter();
  const istMfh = art === "mehrfamilienhaus";
  const [dialogOffen, setDialogOffen] = useState(false);
  const [bearbeiteteId, setBearbeiteteId] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const bearbeitete = einheiten.find((e) => e.id === bearbeiteteId);

  function speichern(wert: EinheitFormWert) {
    setFehler(null);
    startTransition(async () => {
      const payload = {
        propertyId,
        name: wert.name,
        // Als Text, eingelesen auf dem Server mit denselben Regeln wie im Dialog.
        flaecheQm: wert.flaecheQm,
        kaltmieteMonat: wert.kaltmieteMonat,
        status: wert.status,
      };
      const ergebnis = bearbeiteteId
        ? await einheitAendern({ ...payload, id: bearbeiteteId })
        : await einheitHinzufuegen(payload);

      if (ergebnis.error) {
        setFehler(ergebnis.error);
        return;
      }
      router.refresh();
    });
  }

  const gesamtflaeche = wohnflaecheGesamt(einheiten);
  const gesamtmiete = einheiten.reduce((s, e) => s + e.kaltmieteMonat, 0);
  const leerquote = leerstandsquote(einheiten);

  return (
    <div className="flex flex-col gap-6">
      {fehler && (
        <div className="flex items-start gap-2 border border-error-border bg-error-bg p-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" />
          <p className="text-[13px] text-error">{fehler}</p>
        </div>
      )}

      {!istMfh && (
        <p className="text-sm text-neutral-600">
          Wohnungen und Einfamilienhäuser haben genau eine Einheit — sie wird automatisch aus den Stammdaten
          geführt. Mehrere Einheiten gibt es nur beim Mehrfamilienhaus.
        </p>
      )}

      {istMfh && (
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setBearbeiteteId(null);
              setDialogOffen(true);
            }}
          >
            <Plus className="size-4" />
            Einheit hinzufügen
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {einheiten.map((einheit) => {
          const proQm =
            einheit.status !== "leer" && einheit.flaecheQm
              ? formatCurrency(einheit.kaltmieteMonat / einheit.flaecheQm)
              : "—";
          return (
            <div key={einheit.id} className="border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{einheit.name}</span>
                <StatusPille status={einheit.status} />
              </div>
              <dl className="mt-3 flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Fläche</dt>
                  <dd className="tabular-nums">{einheit.flaecheQm ? formatArea(einheit.flaecheQm) : "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Kaltmiete</dt>
                  <dd className="tabular-nums">
                    {einheit.status === "leer"
                      ? `— (Soll ${formatCurrency(einheit.kaltmieteMonat, 0)})`
                      : formatCurrency(einheit.kaltmieteMonat, 0)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">je m²</dt>
                  <dd className="tabular-nums">{proQm}</dd>
                </div>
              </dl>
              <button
                type="button"
                className="mt-3 text-xs font-semibold text-primary hover:underline"
                onClick={() => {
                  setBearbeiteteId(einheit.id);
                  setDialogOffen(true);
                }}
              >
                Bearbeiten
              </button>
            </div>
          );
        })}
      </div>

      {istMfh && einheiten.length > 0 && (
        <div className="grid grid-cols-3 gap-4 border-t border-border pt-4 text-sm">
          <div>
            <p className="text-neutral-600">Gesamtfläche</p>
            <p className="tabular-nums">{gesamtflaeche ? formatArea(gesamtflaeche) : "—"}</p>
          </div>
          <div>
            <p className="text-neutral-600">Gesamtmiete / Monat</p>
            <p className="tabular-nums">{formatCurrency(gesamtmiete, 0)}</p>
          </div>
          <div>
            <p className="text-neutral-600">Leerstandsquote</p>
            <p className="tabular-nums">{leerquote !== null ? formatPercent(leerquote * 100, 0) : "—"}</p>
          </div>
        </div>
      )}

      <EinheitDialog
        key={dialogOffen ? `offen-${bearbeiteteId ?? "neu"}` : "geschlossen"}
        open={dialogOffen}
        onOpenChange={setDialogOffen}
        initial={
          bearbeitete
            ? {
                name: bearbeitete.name,
                flaecheQm: formatEingabeOptional(bearbeitete.flaecheQm),
                kaltmieteMonat: formatEingabe(bearbeitete.kaltmieteMonat, { betrag: true }),
                status: bearbeitete.status,
              }
            : undefined
        }
        onSave={speichern}
      />
    </div>
  );
}
