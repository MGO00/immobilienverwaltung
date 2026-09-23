"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { interessentNotizSpeichern } from "@/app/(app)/kaufpruefung/actions";

// Einfaches Notizfeld (ein Text), bewusst nicht die datierte Notizliste des Bestands.
export function NotizFeld({ interessentId, initial }: { interessentId: string; initial: string }) {
  const [text, setText] = useState(initial);
  const [gespeichert, setGespeichert] = useState(initial);
  const [fehler, setFehler] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const geaendert = text !== gespeichert;

  function speichern() {
    setFehler(null);
    startTransition(async () => {
      const ergebnis = await interessentNotizSpeichern(interessentId, text);
      if (ergebnis.error) setFehler(ergebnis.error);
      else setGespeichert(text);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="notiz">Notiz</Label>
      <textarea
        id="notiz"
        rows={5}
        maxLength={5000}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="z. B. Eindrücke von der Besichtigung, Fragen an den Verkäufer …"
        className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
      />
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" onClick={speichern} disabled={pending || !geaendert}>
          {pending ? "Speichert …" : "Notiz speichern"}
        </Button>
        {!geaendert && gespeichert !== "" && (
          <span className="flex items-center gap-1 text-sm text-neutral-600">
            <Check className="size-4" /> Gespeichert
          </span>
        )}
        {fehler && <span className="text-sm text-error">{fehler}</span>}
      </div>
    </div>
  );
}
