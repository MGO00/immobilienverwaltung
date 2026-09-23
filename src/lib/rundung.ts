/** Rundet einen Geldbetrag kaufmännisch auf ganze Cent. */
export function rundeCent(wert: number): number {
  return Math.round(wert * 100) / 100;
}
