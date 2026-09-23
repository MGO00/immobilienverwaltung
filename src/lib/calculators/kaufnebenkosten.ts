// Reine Berechnung für den Kaufnebenkosten-Rechner. Siehe CLAUDE.md,
// "Fachliche Regeln und Rechner": Kaufnebenkosten = Kaufpreis × (Grunderwerbsteuer
// % + Notar % + Grundbuch % + Makler %); Gesamtinvestition = Kaufpreis + Kaufnebenkosten.
import { rundeCent } from "@/lib/rundung";
import { gesamtinvestition } from "./immobilie";

export type KaufnebenkostenPosten = {
  bezeichnung: string;
  satzProzent: number;
  betrag: number;
};

export type KaufnebenkostenErgebnis = {
  posten: KaufnebenkostenPosten[];
  summe: number;
  anteilProzent: number | null;
  gesamtinvestition: number;
};

export function berechneKaufnebenkosten(
  kaufpreis: number,
  grunderwerbsteuerProzent: number,
  notarProzent: number,
  grundbuchProzent: number,
  maklerProzent: number | null,
): KaufnebenkostenErgebnis {
  const posten: KaufnebenkostenPosten[] = [
    { bezeichnung: "Grunderwerbsteuer", satzProzent: grunderwerbsteuerProzent, betrag: rundeCent((kaufpreis * grunderwerbsteuerProzent) / 100) },
    { bezeichnung: "Notar", satzProzent: notarProzent, betrag: rundeCent((kaufpreis * notarProzent) / 100) },
    { bezeichnung: "Grundbuch", satzProzent: grundbuchProzent, betrag: rundeCent((kaufpreis * grundbuchProzent) / 100) },
  ];

  if (maklerProzent !== null) {
    posten.push({ bezeichnung: "Makler", satzProzent: maklerProzent, betrag: rundeCent((kaufpreis * maklerProzent) / 100) });
  }

  const summe = rundeCent(posten.reduce((acc, p) => acc + p.betrag, 0));
  const anteilProzent = kaufpreis > 0 ? (summe / kaufpreis) * 100 : null;

  return {
    posten,
    summe,
    anteilProzent,
    gesamtinvestition: gesamtinvestition(kaufpreis, summe),
  };
}
