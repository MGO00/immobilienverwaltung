"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

// Aufklappbarer Hinweis unter einem Rechner-Feld ("Wo finde ich …?"). Muster wie
// "Geplante Finanzierung" in der Kaufprüfung: Button mit aria-expanded/aria-controls,
// standardmäßig zu. Nur Text, keine externen Links (die veralten).
export function FeldHilfe({
  titel,
  punkte,
  zusatz,
}: {
  titel: string;
  punkte: readonly string[];
  /** Zusätzliche, hervorgehobene Zeile, z. B. "Suche nach: Mietspiegel Köln". */
  zusatz?: string | null;
}) {
  const [offen, setOffen] = useState(false);
  const id = useId();

  return (
    <div>
      <button
        type="button"
        onClick={() => setOffen((o) => !o)}
        aria-expanded={offen}
        aria-controls={id}
        className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {titel}
        <ChevronDown className={`size-3.5 transition-transform ${offen ? "rotate-180" : ""}`} />
      </button>
      {offen && (
        <div id={id} className="mt-2 border-l-2 border-border pl-3 text-xs leading-[1.55] text-neutral-700">
          {zusatz && <p className="mb-1.5 font-semibold text-foreground">{zusatz}</p>}
          <ul className="flex list-disc flex-col gap-1 pl-4">
            {punkte.map((punkt) => (
              <li key={punkt}>{punkt}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
