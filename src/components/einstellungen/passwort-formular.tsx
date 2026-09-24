"use client";

import { useActionState } from "react";
import { AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwortAendern, type EinstellungenState } from "@/app/(app)/einstellungen/actions";

// Unkontrollierte Felder: React leert das Formular nach dem Absenden, Passwörter
// bleiben also nie im Formular stehen.
export function PasswortFormular() {
  const [state, formAction, pending] = useActionState(passwortAendern, {} as EinstellungenState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="aktuell">Aktuelles Passwort</Label>
        <Input id="aktuell" name="aktuell" type="password" autoComplete="current-password" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="neu">Neues Passwort</Label>
        <Input id="neu" name="neu" type="password" autoComplete="new-password" required aria-describedby="passwort-regel" />
        <p id="passwort-regel" className="text-xs text-neutral-600">
          Mindestens 8 Zeichen.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="wiederholung">Neues Passwort wiederholen</Label>
        <Input id="wiederholung" name="wiederholung" type="password" autoComplete="new-password" required />
      </div>
      <div>
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? "Wird geändert …" : "Passwort ändern"}
        </Button>
      </div>
      {state.error && (
        <p role="alert" className="flex items-start gap-2 text-[13px] text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state.erfolg && (
        <p role="status" className="flex items-center gap-1 text-sm text-neutral-700">
          <Check className="size-4" /> Dein Passwort ist geändert. Du bleibst hier angemeldet; auf anderen Geräten musst du dich mit dem neuen Passwort neu anmelden.
        </p>
      )}
    </form>
  );
}
