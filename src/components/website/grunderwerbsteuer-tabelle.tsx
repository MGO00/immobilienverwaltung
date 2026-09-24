import { grunderwerbsteuerStandText, grunderwerbsteuerZeilen } from "@/lib/ressourcen/grunderwerbsteuer";

// Tabelle aller 16 Bundesländer. Sätze und Stand kommen aus
// src/lib/constants/steuersaetze.ts, derselben Quelle wie im Kaufnebenkosten-Rechner.
export function GrunderwerbsteuerTabelle() {
  const zeilen = grunderwerbsteuerZeilen();

  return (
    <div>
      <table className="w-full border-collapse text-sm tabular-nums">
        <thead>
          <tr className="border-b-2 border-border text-[11px] tracking-[0.08em] text-neutral-600 uppercase">
            <th scope="col" className="p-2 text-left font-normal">
              Bundesland
            </th>
            <th scope="col" className="p-2 text-right font-normal">
              Steuersatz
            </th>
          </tr>
        </thead>
        <tbody>
          {zeilen.map((zeile) => (
            <tr key={zeile.bundesland} className="border-b border-border">
              <td className="p-2">{zeile.bundesland}</td>
              <td className="p-2 text-right font-semibold whitespace-nowrap">{zeile.satzText}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-neutral-700">{grunderwerbsteuerStandText()}</p>
    </div>
  );
}
