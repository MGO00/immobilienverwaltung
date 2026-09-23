"use client";

import { useState, useTransition } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OBJEKTART_LABEL } from "@/lib/constants/objektart";
import { bundeslandLabel } from "@/lib/constants/steuersaetze";
import type { Interessent } from "@/lib/data/interessenten";
import { formatArea, formatCurrency, formatPercent } from "@/lib/format";
import { interessentInBestandUebernehmen } from "@/app/(app)/kaufpruefung/actions";

function Zeile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-1.5 text-sm">
      <dt className="text-neutral-600">{label}</dt>
      <dd className="text-right tabular-nums">{children}</dd>
    </div>
  );
}

// Bestätigungsdialog für "In Bestand übernehmen": zeigt vorab genau, was in die
// neue Immobilie übernommen wird (und was nicht). Die Übernahme selbst läuft
// atomar in der Datenbank; danach geht es direkt zur neuen Immobilie.
export function UebernehmenDialog({
  interessent,
  open,
  onOpenChange,
}: {
  interessent: Interessent;
  open: boolean;
  onOpenChange: (offen: boolean) => void;
}) {
  const [fehler, setFehler] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const adresse = [interessent.strasseHausnummer, [interessent.plz, interessent.ort].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  const istMfh = interessent.art === "mehrfamilienhaus";
  const hatFinanzierung =
    interessent.darlehenBetrag !== null || interessent.sollzinsProzent !== null || interessent.tilgungProzent !== null;

  function uebernehmen() {
    setFehler(null);
    startTransition(async () => {
      const ergebnis = await interessentInBestandUebernehmen(interessent.id);
      // Bei Erfolg leitet die Server Action zur neuen Immobilie weiter.
      if (ergebnis?.error) setFehler(ergebnis.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>In Bestand übernehmen?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-neutral-700">
          Aus „{interessent.bezeichnung}&rdquo; entsteht eine neue Immobilie in deinem Bestand. Diese Angaben werden
          übernommen:
        </p>

        <dl>
          <Zeile label="Objektart">{OBJEKTART_LABEL[interessent.art]}</Zeile>
          <Zeile label="Bezeichnung">{interessent.bezeichnung}</Zeile>
          <Zeile label="Adresse">{adresse || "—"}</Zeile>
          <Zeile label="Bundesland">{interessent.bundesland ? bundeslandLabel(interessent.bundesland) : "—"}</Zeile>
          <Zeile label="Kaufpreis">{formatCurrency(interessent.kaufpreis, 0)}</Zeile>
          <Zeile label={istMfh ? "Fläche (in „Einheit 1“)" : "Fläche (in die Einheit)"}>
            {interessent.flaecheQm !== null ? formatArea(interessent.flaecheQm) : "—"}
          </Zeile>
          <Zeile label={istMfh ? "Erwartete Miete (in „Einheit 1“)" : "Erwartete Miete (in die Einheit)"}>
            {interessent.kaltmieteMonat !== null ? `${formatCurrency(interessent.kaltmieteMonat, 0)} / Monat` : "—"}
          </Zeile>
          {hatFinanzierung && (
            <>
              <Zeile label="Darlehen">
                {interessent.darlehenBetrag !== null ? formatCurrency(interessent.darlehenBetrag, 0) : "—"}
              </Zeile>
              <Zeile label="Sollzins">
                {interessent.sollzinsProzent !== null ? formatPercent(interessent.sollzinsProzent) : "—"}
              </Zeile>
              <Zeile label="Tilgung">
                {interessent.tilgungProzent !== null ? formatPercent(interessent.tilgungProzent) : "—"}
              </Zeile>
            </>
          )}
        </dl>

        <div className="flex flex-col gap-1.5 text-sm text-neutral-700">
          {istMfh && (
            <p>
              Beim Mehrfamilienhaus entsteht eine Einheit „Einheit 1“ mit Gesamtfläche und Gesamtmiete. Teile sie im
              Bestand in die einzelnen Einheiten auf.
            </p>
          )}
          <p>
            Die Einheit startet mit dem Status „leer“ — die Miete ist die Soll-Miete. Setz sie auf „vermietet“, sobald
            sie vermietet ist.
          </p>
          <p>
            Nicht übernommen werden Inserats-Link und Notiz. Kaufdatum, Kaufnebenkosten und laufende Kosten trägst du
            in der neuen Immobilie nach.
          </p>
          <p>
            „{interessent.bezeichnung}&rdquo; bleibt danach in der Kaufprüfung als „gekauft“ mit Verweis auf die
            Immobilie erhalten.
          </p>
        </div>

        {fehler && (
          <div className="flex items-start gap-2 border border-error-border bg-error-bg p-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" />
            <p className="text-[13px] text-error">{fehler}</p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={uebernehmen} disabled={pending}>
            {pending ? "Wird übernommen …" : "In Bestand übernehmen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
