// Ergebnis eines Rechners, solange eine Eingabe keine gültige Zahl ist: die
// Kennzahlen zeigen "—", statt mit einem falschen Wert (etwa still 0) zu rechnen.
export function ErgebnisUngueltig({ zeilen }: { zeilen: string[] }) {
  return (
    <>
      <div className="mt-3">
        {zeilen.map((zeile) => (
          <div key={zeile} className="flex items-center justify-between border-b border-border py-2 text-sm">
            <span className="text-neutral-600">{zeile}</span>
            <span className="tabular-nums">—</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-neutral-600">
        Eine Eingabe ist keine gültige Zahl. Bitte prüf die Felder, z. B. 1.250,50 oder 3,5.
      </p>
    </>
  );
}
