"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Interessent } from "@/lib/data/interessenten";
import { kannUebernehmen } from "@/lib/interessent-regeln";
import { StatusStepper } from "./status-stepper";
import { UebernehmenDialog } from "./uebernehmen-dialog";

// Stepper und die prominente Übernahme-Aktion zusammen, weil beide denselben
// Dialog öffnen (Klick auf "gekauft" im Stepper oder auf den Button).
export function InteressentStatusBereich({ interessent }: { interessent: Interessent }) {
  const [dialogOffen, setDialogOffen] = useState(false);
  const uebernehmbar = kannUebernehmen(interessent);

  return (
    <div>
      <StatusStepper
        interessentId={interessent.id}
        status={interessent.status}
        uebernehmenAktion={uebernehmbar ? () => setDialogOffen(true) : null}
      />
      {uebernehmbar && (
        <div className="mt-6 flex flex-col items-start gap-2 border border-border p-4">
          <p className="font-semibold">Gekauft?</p>
          <p className="text-sm text-neutral-700">
            Übernimm den Interessenten als neue Immobilie in deinen Bestand. Du siehst vorher, was übernommen wird.
          </p>
          <Button onClick={() => setDialogOffen(true)}>In Bestand übernehmen</Button>
        </div>
      )}
      <UebernehmenDialog interessent={interessent} open={dialogOffen} onOpenChange={setDialogOffen} />
    </div>
  );
}
