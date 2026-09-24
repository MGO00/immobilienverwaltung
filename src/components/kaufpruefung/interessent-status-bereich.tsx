"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LimitHinweis } from "@/components/tarif/limit-hinweis";
import type { Interessent } from "@/lib/data/interessenten";
import { kannUebernehmen } from "@/lib/interessent-regeln";
import { StatusStepper } from "./status-stepper";
import { UebernehmenDialog } from "./uebernehmen-dialog";

// Stepper und die prominente Übernahme-Aktion zusammen, weil beide denselben
// Dialog öffnen (Klick auf "gekauft" im Stepper oder auf den Button).
// Die Limit-Meldungen kommen vom Server (null = Grenze nicht erreicht).
export function InteressentStatusBereich({
  interessent,
  objektLimitMeldung,
  interessentenLimitMeldung,
}: {
  interessent: Interessent;
  objektLimitMeldung: string | null;
  interessentenLimitMeldung: string | null;
}) {
  const [dialogOffen, setDialogOffen] = useState(false);
  const uebernehmbar = kannUebernehmen(interessent);
  const uebernahmeGesperrt = uebernehmbar && objektLimitMeldung !== null;

  return (
    <div>
      <StatusStepper
        interessentId={interessent.id}
        status={interessent.status}
        uebernehmenAktion={uebernehmbar && !uebernahmeGesperrt ? () => setDialogOffen(true) : null}
        wiederaufnahmeGesperrt={interessentenLimitMeldung}
      />
      {uebernehmbar && (
        <div className="mt-6 flex flex-col items-start gap-2 border border-border p-4">
          <p className="font-semibold">Gekauft?</p>
          <p className="text-sm text-neutral-700">
            Übernimm den Interessenten als neue Immobilie in deinen Bestand. Du siehst vorher, was übernommen wird.
          </p>
          <Button
            onClick={() => setDialogOffen(true)}
            disabled={uebernahmeGesperrt}
            aria-describedby={uebernahmeGesperrt ? "uebernahme-limit" : undefined}
          >
            In Bestand übernehmen
          </Button>
          {uebernahmeGesperrt && <LimitHinweis id="uebernahme-limit" text={objektLimitMeldung} />}
        </div>
      )}
      <UebernehmenDialog interessent={interessent} open={dialogOffen} onOpenChange={setDialogOffen} />
    </div>
  );
}
