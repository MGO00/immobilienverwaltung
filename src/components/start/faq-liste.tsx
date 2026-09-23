"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

type Frage = { frage: string; antwort: string };

// Akkordeon: immer nur eine Antwort offen, die erste beim Laden, erneuter Klick schließt.
export function FaqListe({ fragen }: { fragen: readonly Frage[] }) {
  const [offen, setOffen] = useState<number>(0);

  return (
    <div className="border-t border-border">
      {fragen.map((f, index) => {
        const istOffen = offen === index;
        return (
          <div key={f.frage} className="border-b border-border">
            <h3>
              <button
                type="button"
                onClick={() => setOffen(istOffen ? -1 : index)}
                aria-expanded={istOffen}
                aria-controls={`faq-antwort-${index}`}
                id={`faq-frage-${index}`}
                className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-[15px] font-semibold">{f.frage}</span>
                {istOffen ? <Minus className="size-[18px] shrink-0" /> : <Plus className="size-[18px] shrink-0" />}
              </button>
            </h3>
            {istOffen && (
              <p
                id={`faq-antwort-${index}`}
                role="region"
                aria-labelledby={`faq-frage-${index}`}
                className="max-w-[640px] pr-8 pb-4 text-sm leading-[1.6] text-neutral-800"
              >
                {f.antwort}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
