import { Info } from "lucide-react";

// Sachlicher Hinweis bei erreichter Tarifgrenze. Bewusst nicht in der
// Fehlerfarbe: Es ist kein Fehler des Nutzers, sondern eine Grenze.
export function LimitHinweis({ text, id }: { text: string; id?: string }) {
  return (
    <p id={id} role="status" className="flex max-w-[560px] items-start gap-2 border border-border p-3 text-sm text-neutral-800">
      <Info className="mt-0.5 size-4 shrink-0" />
      <span>{text}</span>
    </p>
  );
}
