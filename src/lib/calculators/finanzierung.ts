// Reine Berechnungen für den Finanzierungs-Rechner. Der Tilgungsplan rechnet
// MONATLICH (banküblich), nicht jährlich wie im Design-Prototyp — siehe
// CLAUDE.md, "Fachliche Regeln und Rechner". Das Startdatum ist ein Parameter,
// nie fest verdrahtet oder aus new Date() im Funktionsinneren, damit die
// Funktion deterministisch und testbar bleibt.
import { rundeCent } from "@/lib/rundung";

export function darlehenAusEigenkapital(gesamtinvestitionWert: number, eigenkapitalWert: number): number {
  return Math.max(0, rundeCent(gesamtinvestitionWert - eigenkapitalWert));
}

export type TilgungsplanMonat = {
  monatIndex: number;
  jahr: number;
  monatImJahr: number;
  zinsanteil: number;
  tilgungsanteil: number;
  restschuldNachher: number;
};

export function tilgungsplanMonatlich(
  darlehenBetrag: number,
  sollzinsProzent: number,
  tilgungProzent: number,
  laufzeitMonate: number,
  startDatum: Date,
): TilgungsplanMonat[] {
  const rateMonat = rundeCent((darlehenBetrag * (sollzinsProzent + tilgungProzent)) / 100 / 12);
  const monatszins = sollzinsProzent / 100 / 12;

  const plan: TilgungsplanMonat[] = [];
  let restschuld = darlehenBetrag;

  for (let i = 0; i < laufzeitMonate && restschuld > 0.005; i++) {
    const datum = new Date(startDatum.getFullYear(), startDatum.getMonth() + i, 1);
    const zinsanteil = rundeCent(restschuld * monatszins);
    const tilgungsanteil = Math.min(rundeCent(rateMonat - zinsanteil), restschuld);
    restschuld = rundeCent(restschuld - tilgungsanteil);

    plan.push({
      monatIndex: i,
      jahr: datum.getFullYear(),
      monatImJahr: datum.getMonth() + 1,
      zinsanteil,
      tilgungsanteil,
      restschuldNachher: restschuld,
    });
  }

  return plan;
}

export type TilgungsplanJahr = {
  jahr: number;
  monate: number;
  zinsSumme: number;
  tilgungSumme: number;
  restschuldEnde: number;
};

export function tilgungsplanJaehrlich(planMonatlich: TilgungsplanMonat[]): TilgungsplanJahr[] {
  const jahre = new Map<number, TilgungsplanJahr>();

  for (const monat of planMonatlich) {
    const bestehend = jahre.get(monat.jahr);
    if (bestehend) {
      bestehend.monate += 1;
      bestehend.zinsSumme = rundeCent(bestehend.zinsSumme + monat.zinsanteil);
      bestehend.tilgungSumme = rundeCent(bestehend.tilgungSumme + monat.tilgungsanteil);
      bestehend.restschuldEnde = monat.restschuldNachher;
    } else {
      jahre.set(monat.jahr, {
        jahr: monat.jahr,
        monate: 1,
        zinsSumme: monat.zinsanteil,
        tilgungSumme: monat.tilgungsanteil,
        restschuldEnde: monat.restschuldNachher,
      });
    }
  }

  return Array.from(jahre.values());
}

export function tilgungsanteilAusRate(
  rateMonatWert: number,
  darlehenBetrag: number | null,
  sollzinsProzent: number | null,
): number | null {
  if (darlehenBetrag === null || sollzinsProzent === null) return null;
  return Math.max(0, rundeCent(rateMonatWert - (darlehenBetrag * sollzinsProzent) / 100 / 12));
}
