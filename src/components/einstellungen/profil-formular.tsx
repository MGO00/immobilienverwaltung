"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profilSpeichern, type EinstellungenState } from "@/app/(app)/einstellungen/actions";

export function ProfilFormular({ name, email }: { name: string; email: string }) {
  const [state, formAction, pending] = useActionState(profilSpeichern, {} as EinstellungenState);
  const [wert, setWert] = useState(name);
  const [gespeichert, setGespeichert] = useState(name);
  const [letzterErfolg, setLetzterErfolg] = useState<EinstellungenState | null>(null);

  // Nach erfolgreichem Speichern gilt der neue Name als gespeichert (Button wieder inaktiv).
  if (state.erfolg && state !== letzterErfolg) {
    setLetzterErfolg(state);
    setGespeichert(wert.trim());
  }
  const geaendert = wert.trim() !== gespeichert;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" value={wert} onChange={(e) => setWert(e.target.value)} autoComplete="name" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-Mail-Adresse</Label>
        <Input id="email" value={email} readOnly aria-describedby="email-hinweis" className="bg-neutral-100 text-neutral-700" />
        <p id="email-hinweis" className="text-xs text-neutral-600">
          Die E-Mail-Adresse lässt sich hier noch nicht ändern. Das folgt in einer späteren Version.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!geaendert || pending}>
          {pending ? "Speichert …" : "Speichern"}
        </Button>
        {!geaendert && letzterErfolg && (
          <span role="status" className="flex items-center gap-1 text-sm text-neutral-700">
            <Check className="size-4" /> Gespeichert
          </span>
        )}
      </div>
      {state.error && (
        <p role="alert" className="flex items-start gap-2 text-[13px] text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}
    </form>
  );
}
