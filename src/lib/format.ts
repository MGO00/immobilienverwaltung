// Deutsche Anzeigeformate für Zahlen, Beträge, Datum und Fläche.
// Verbindlich laut docs/design/runde-1/README.md: 1.234,56 €, TT.MM.JJJJ, 58 m²,
// Minuszeichen "−" (U+2212, nicht der Bindestrich "-").

const MINUS_SIGN = "−";

function withGermanMinusSign(text: string): string {
  return text.replace("-", MINUS_SIGN);
}

const eurWithCentsFormatter = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const eurWholeFormatter = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/**
 * Formatiert einen Euro-Betrag. Kennzahlen (z. B. im Kennzahlenband der
 * Übersicht) werden laut Design ohne Dezimalstellen gezeigt, Rechnerbeträge
 * mit zwei Nachkommastellen.
 */
export function formatCurrency(value: number, decimals: 0 | 2 = 2): string {
  const formatter = decimals === 0 ? eurWholeFormatter : eurWithCentsFormatter;
  return `${withGermanMinusSign(formatter.format(value))} €`;
}

/** Formatiert einen Prozentwert, z. B. formatPercent(4.76) → "4,76 %". */
export function formatPercent(value: number): string {
  return `${withGermanMinusSign(percentFormatter.format(value))} %`;
}

/** Formatiert ein Datum im Format TT.MM.JJJJ. */
export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

/** Formatiert eine Fläche in Quadratmetern, z. B. formatArea(58) → "58 m²". */
export function formatArea(value: number): string {
  return `${withGermanMinusSign(eurWholeFormatter.format(value))} m²`;
}
