"use client";

import { useState, useTransition } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { interessentLoeschen } from "@/app/(app)/kaufpruefung/actions";

export function InteressentLoeschen({
  interessentId,
  bezeichnung,
  hatImmobilie,
}: {
  interessentId: string;
  bezeichnung: string;
  hatImmobilie: boolean;
}) {
  const [offen, setOffen] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function loeschen() {
    setFehler(null);
    startTransition(async () => {
      const ergebnis = await interessentLoeschen(interessentId);
      if (ergebnis?.error) setFehler(ergebnis.error);
    });
  }

  return (
    <>
      <div className="border border-error-border bg-error-bg p-4">
        <p className="text-[15px] font-semibold text-error">Interessent löschen</p>
        <p className="mt-1 text-sm text-neutral-700">
          Der Interessent samt Notiz wird dauerhaft entfernt.
          {hatImmobilie && " Die daraus entstandene Immobilie im Bestand bleibt erhalten."}
        </p>
        <Button variant="outline" className="mt-3 border-error text-error" onClick={() => setOffen(true)}>
          Interessent löschen
        </Button>
      </div>

      <Dialog open={offen} onOpenChange={setOffen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Interessent löschen?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-700">„{bezeichnung}&rdquo; wird dauerhaft gelöscht.</p>
          <div className="flex items-start gap-2 border border-error-border bg-error-bg p-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" />
            <p className="text-[13px] text-error">
              Angaben und Notiz gehen verloren. Das lässt sich nicht rückgängig machen.
              {hatImmobilie && " Die Immobilie im Bestand wird nicht gelöscht."}
            </p>
          </div>
          {fehler && <p className="text-[13px] text-error">{fehler}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOffen(false)}>
              Abbrechen
            </Button>
            <Button variant="outline" className="border-error text-error" onClick={loeschen} disabled={pending}>
              {pending ? "Wird gelöscht …" : "Endgültig löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
