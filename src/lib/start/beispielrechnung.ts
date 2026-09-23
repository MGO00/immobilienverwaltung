import { berechneKaufnebenkosten } from "@/lib/calculators/kaufnebenkosten";
import {
  GRUNDBUCH_PROZENT_STANDARD,
  GRUNDERWERBSTEUER_PROZENT,
  MAKLER_PROZENT_STANDARD,
  NOTAR_PROZENT_STANDARD,
} from "@/lib/constants/steuersaetze";

// Beispielrechnung im Hero der Startseite. Wird aus dem echten Kaufnebenkosten-
// Rechner erzeugt (nicht hartkodiert), damit sie bei geänderten Steuersätzen
// nicht veraltet. Notar und Grundbuch stehen dort in einer Zeile.
export const BEISPIEL_KAUFPREIS = 189000;
export const BEISPIEL_BUNDESLAND = "Bayern";

export function beispielrechnungKaufnebenkosten() {
  const ergebnis = berechneKaufnebenkosten(
    BEISPIEL_KAUFPREIS,
    GRUNDERWERBSTEUER_PROZENT[BEISPIEL_BUNDESLAND],
    NOTAR_PROZENT_STANDARD,
    GRUNDBUCH_PROZENT_STANDARD,
    MAKLER_PROZENT_STANDARD,
  );
  const [grunderwerbsteuer, notar, grundbuch, makler] = ergebnis.posten;

  return {
    kaufpreis: BEISPIEL_KAUFPREIS,
    bundesland: BEISPIEL_BUNDESLAND,
    grunderwerbsteuer,
    notarGrundbuch: {
      satzProzent: notar.satzProzent + grundbuch.satzProzent,
      betrag: notar.betrag + grundbuch.betrag,
    },
    makler,
    summe: ergebnis.summe,
    anteilProzent: ergebnis.anteilProzent,
  };
}
