"use client";

import { useActionState, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { kontoLoeschen, type KontoLoeschenState } from "@/app/(app)/einstellungen/konto-actions";

// Muster wie "Immobilie löschen": Fehler-Kasten mit Button, Bestätigungsdialog.
// Zusätzlich das Passwort, damit niemand mit einem offen gelassenen Browser ein
// fremdes Konto löschen kann.
export function KontoLoeschen() {
  const [offen, setOffen] = useState(false);
  const [state, formAction, pending] = useActionState(kontoLoeschen, {} as KontoLoeschenState);

  return (
    <>
      <div className="border border-error-border bg-error-bg p-4">
        <p className="text-[15px] font-semibold text-error">Konto löschen</p>
        <p className="mt-1 text-sm text-neutral-700">
          Dein Konto und alle deine Daten werden dauerhaft entfernt.
        </p>
        <Button variant="outline" className="mt-3 border-error text-error" onClick={() => setOffen(true)}>
          Konto löschen
        </Button>
      </div>

      <Dialog open={offen} onOpenChange={(o) => !pending && setOffen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konto endgültig löschen?</DialogTitle>
          </DialogHeader>
          <div className="flex items-start gap-2 border border-error-border bg-error-bg p-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" />
            <p className="text-[13px] text-error">
              Alle deine Immobilien, Einheiten, laufenden Kosten, Notizen, Interessenten und Fotos gehen dauerhaft
              verloren. Das lässt sich nicht rückgängig machen.
            </p>
          </div>
          <p className="text-sm text-neutral-700">
            Ein Eintrag in der E-Mail-Liste bleibt davon unberührt. Du entfernst ihn separat über den Abmelde-Link in
            jeder E-Mail.
          </p>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="konto-passwort">Passwort zur Bestätigung</Label>
              <Input
                id="konto-passwort"
                name="passwort"
                type="password"
                autoComplete="current-password"
                required
                aria-invalid={Boolean(state.passwortFalsch)}
                aria-describedby={state.error ? "konto-loeschen-fehler" : undefined}
              />
            </div>
            {state.error && (
              <p id="konto-loeschen-fehler" role="alert" className="text-[13px] text-error">
                {state.error}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" disabled={pending} onClick={() => setOffen(false)}>
                Abbrechen
              </Button>
              <Button type="submit" variant="outline" className="border-error text-error" disabled={pending}>
                {pending ? "Wird gelöscht …" : "Konto endgültig löschen"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
