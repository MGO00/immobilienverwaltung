"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LinkErgebnis } from "@/lib/newsletter/token-status";

const MELDUNG: Record<Exclude<LinkErgebnis, "ok">, string> = {
  ungueltig: "Dieser Link ist ungültig oder wurde schon verwendet.",
  abgelaufen: "Dieser Link ist abgelaufen. Trag deine Adresse auf der Startseite bitte noch einmal ein.",
  nicht_verfuegbar: "Das ist gerade nicht möglich. Bitte versuch es später erneut.",
};

// Knopf für die Seiten aus den Mails (Bestätigen/Abmelden). Die Aktion läuft erst
// beim Klick, nicht schon beim Öffnen des Links.
export function LinkAktion({
  aktion,
  token,
  knopf,
  erfolgTitel,
  erfolgText,
}: {
  aktion: (token: string) => Promise<LinkErgebnis>;
  token: string;
  knopf: string;
  erfolgTitel: string;
  erfolgText: string;
}) {
  const [ergebnis, setErgebnis] = useState<LinkErgebnis | null>(null);
  const [pending, startTransition] = useTransition();

  if (ergebnis === "ok") {
    return (
      <div className="flex items-start gap-3">
        <Check className="mt-0.5 size-[18px] shrink-0" />
        <div>
          <p className="text-[15px] font-semibold">{erfolgTitel}</p>
          <p className="mt-1 text-sm text-neutral-800">{erfolgText}</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/">Zur Startseite</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Button onClick={() => startTransition(async () => setErgebnis(await aktion(token)))} disabled={pending}>
        {pending ? "Einen Moment …" : knopf}
      </Button>
      {ergebnis && <p className="mt-3 text-[13px] text-error">{MELDUNG[ergebnis]}</p>}
    </div>
  );
}
