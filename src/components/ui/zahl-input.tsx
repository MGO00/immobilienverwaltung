import { Input } from "@/components/ui/input";

// Eingabefeld für Zahlen in deutscher Schreibweise ("1,5", "189.000"). Bewusst
// type="text" statt type="number": Zahlenfelder verhalten sich je nach Browser und
// Sprache unterschiedlich mit Komma. inputMode sorgt auf dem Handy für die
// Zahlentastatur (mit Komma bei "decimal"). Eingelesen wird mit parseDeZahl /
// pruefeZahl (src/lib/zahl.ts, src/lib/validation/zahl.ts), ohne Umformatieren beim
// Verlassen des Feldes. Eine Meldung steht als Text unter dem Feld, nicht nur als Farbe.
export function ZahlInput({
  id,
  value,
  onChange,
  einheit,
  fehler,
  ganzzahl = false,
  className,
  ...rest
}: {
  id: string;
  value: string;
  onChange: (wert: string) => void;
  /** Sichtbare Einheit rechts neben dem Feld, z. B. "€", "%", "m²". */
  einheit?: string;
  fehler?: string | null;
  ganzzahl?: boolean;
  className?: string;
} & Omit<React.ComponentProps<"input">, "id" | "value" | "onChange" | "type" | "inputMode">) {
  const fehlerId = `${id}-fehler`;
  const feld = (
    <Input
      id={id}
      type="text"
      inputMode={ganzzahl ? "numeric" : "decimal"}
      autoComplete="off"
      spellCheck={false}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={fehler ? true : undefined}
      aria-describedby={fehler ? fehlerId : undefined}
      className={className}
      {...rest}
    />
  );

  return (
    <>
      {einheit ? (
        <div className="flex items-center gap-1.5">
          {feld}
          <span className="text-sm text-neutral-600">{einheit}</span>
        </div>
      ) : (
        feld
      )}
      {fehler && (
        <p id={fehlerId} className="text-xs text-error">
          {fehler}
        </p>
      )}
    </>
  );
}
