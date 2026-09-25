import { rundeCent } from "@/lib/rundung";

// Mieterhöhungs-Rechner (Rechner 05). Reine Funktionen ohne Oberfläche und ohne
// Datenbank. Rechtliche Grundlage und Präzisierungen: siehe CLAUDE.md, "Fachliche
// Regeln", Mieterhöhung. Keine Rechtsberatung, nur Orientierung.
//
// Datumswerte sind ISO-Texte ("2026-06-01"), damit keine Zeitzone hineinspielt. Das
// heutige Datum kommt immer als Parameter (testbar), nie über new Date() hier drin.

/** Stand der Rechtslage für den Hinweis zur geplanten Reform der Indexmiete. */
export const MIETRECHT_STAND = "September 2026";

export type IsoDatum = string;

// ---- Datums-Hilfen (in UTC gerechnet, damit Sommerzeit keine Rolle spielt) ----

function teile(datum: IsoDatum): [number, number, number] {
  const [jahr, monat, tag] = datum.split("-").map(Number);
  return [jahr, monat, tag];
}

function alsIso(utc: number): IsoDatum {
  return new Date(utc).toISOString().slice(0, 10);
}

/** Datum + n Jahre. Der 29.02. wird im Nicht-Schaltjahr zum 01.03. (passt zu § 188 Abs. 3 BGB). */
export function plusJahre(datum: IsoDatum, jahre: number): IsoDatum {
  const [jahr, monat, tag] = teile(datum);
  return alsIso(Date.UTC(jahr + jahre, monat - 1, tag));
}

/** Erster Tag des n-ten Kalendermonats nach dem Monat des Datums (März, n = 3 → 1. Juni). */
export function monatsanfangNach(datum: IsoDatum, monate: number): IsoDatum {
  const [jahr, monat] = teile(datum);
  return alsIso(Date.UTC(jahr, monat - 1 + monate, 1));
}

/** Das Datum selbst, wenn es ein Monatsanfang ist, sonst der nächste Monatsanfang. */
export function monatsanfangAb(datum: IsoDatum): IsoDatum {
  return teile(datum)[2] === 1 ? datum : monatsanfangNach(datum, 1);
}

function spaeter(a: IsoDatum, b: IsoDatum): IsoDatum {
  return a > b ? a : b;
}

// ---- Modus 1: Erhöhung auf die ortsübliche Vergleichsmiete (§ 558 BGB) ----

export type MietspiegelEingabe = {
  mieteAktuell: number;
  flaecheQm: number;
  vergleichsmieteQm: number;
  /** Nettokaltmiete drei Jahre vor dem Wirksamwerden (bzw. Anfangsmiete), ohne §§ 559/560. */
  mieteVorDreiJahren: number;
  kappungProzent: 15 | 20;
  /** Datum, ab dem die letzte Erhöhung nach § 558 galt (bzw. Mietbeginn). */
  letzteErhoehungAb: IsoDatum;
  /** Geplanter Zugang des Verlangens; ohne Angabe gilt heute. */
  geplanterZugang?: IsoDatum | null;
  heute: IsoDatum;
};

export type Grenze = "vergleichsmiete" | "kappung";

export type MietspiegelErgebnis = {
  grenzeVergleichsmiete: number;
  grenzeKappung: number;
  /** Die kleinere Grenze; bei Gleichstand die Vergleichsmiete. */
  greifendeGrenze: Grenze;
  /** false: Die kleinere Grenze liegt nicht über der aktuellen Miete (Grund: greifendeGrenze). */
  erhoehungMoeglich: boolean;
  neueMiete: number;
  erhoehungEuro: number;
  erhoehungProzent: number;
  mieteQmVorher: number;
  mieteQmNachher: number;
  /** Letzte Erhöhung + 1 Jahr: frühestens an diesem Tag darf das Verlangen zugehen. */
  fruehesterZugang: IsoDatum;
  /** Zugang, mit dem gerechnet wird (geplanter Zugang, bei zu frühem Zugang der früheste). */
  zugang: IsoDatum;
  /** Der geplante Zugang liegt vor dem frühesten: Das Verlangen wäre unwirksam. */
  zugangZuFrueh: boolean;
  /** Beginn des dritten Kalendermonats nach Zugang (§ 558b Abs. 1 BGB). */
  wirksamAb: IsoDatum;
  /** Stichtag für "Miete vor drei Jahren": drei Jahre vor dem Wirksamwerden (§ 558 Abs. 3 BGB). */
  stichtagKappung: IsoDatum;
};

export type MietspiegelFristen = Pick<
  MietspiegelErgebnis,
  "fruehesterZugang" | "zugang" | "zugangZuFrueh" | "wirksamAb" | "stichtagKappung"
>;

/** Nur die Fristen (hängen nicht von den Beträgen ab, z. B. für den Stichtag-Hinweis am Feld). */
export function fristenMietspiegel(
  letzteErhoehungAb: IsoDatum,
  geplanterZugang: IsoDatum | null | undefined,
  heute: IsoDatum,
): MietspiegelFristen {
  const fruehesterZugang = plusJahre(letzteErhoehungAb, 1);
  const geplant = geplanterZugang || heute;
  const zugangZuFrueh = geplant < fruehesterZugang;
  const zugang = zugangZuFrueh ? fruehesterZugang : geplant;
  const wirksamAb = monatsanfangNach(zugang, 3);
  return { fruehesterZugang, zugang, zugangZuFrueh, wirksamAb, stichtagKappung: plusJahre(wirksamAb, -3) };
}

export function mieterhoehungMietspiegel(e: MietspiegelEingabe): MietspiegelErgebnis | null {
  if (!(e.flaecheQm > 0) || !(e.mieteAktuell >= 0) || !(e.mieteVorDreiJahren >= 0) || !(e.vergleichsmieteQm >= 0)) {
    return null;
  }

  const grenzeVergleichsmiete = rundeCent(e.vergleichsmieteQm * e.flaecheQm);
  const grenzeKappung = rundeCent(e.mieteVorDreiJahren * (1 + e.kappungProzent / 100));
  const greifendeGrenze: Grenze = grenzeVergleichsmiete <= grenzeKappung ? "vergleichsmiete" : "kappung";
  const grenze = Math.min(grenzeVergleichsmiete, grenzeKappung);
  const erhoehungMoeglich = grenze > e.mieteAktuell;
  const neueMiete = erhoehungMoeglich ? grenze : e.mieteAktuell;

  return {
    grenzeVergleichsmiete,
    grenzeKappung,
    greifendeGrenze,
    erhoehungMoeglich,
    neueMiete,
    erhoehungEuro: rundeCent(neueMiete - e.mieteAktuell),
    erhoehungProzent: e.mieteAktuell > 0 ? (neueMiete / e.mieteAktuell - 1) * 100 : 0,
    mieteQmVorher: rundeCent(e.mieteAktuell / e.flaecheQm),
    mieteQmNachher: rundeCent(neueMiete / e.flaecheQm),
    ...fristenMietspiegel(e.letzteErhoehungAb, e.geplanterZugang, e.heute),
  };
}

// ---- Modus 2: Indexmiete (§ 557b BGB) ----

export type IndexEingabe = {
  mieteAktuell: number;
  /** Verbraucherpreisindex zum Zeitpunkt der letzten Anpassung bzw. des Vertragsbeginns. */
  indexAlt: number;
  indexNeu: number;
  /** Datum, ab dem die letzte Anpassung galt (bzw. Vertragsbeginn). */
  letzteAnpassungAb: IsoDatum;
  /** Geplanter Zugang der Erklärung; ohne Angabe gilt heute. */
  geplanterZugang?: IsoDatum | null;
  heute: IsoDatum;
};

export type IndexErgebnis = {
  neueMiete: number;
  /** Kann negativ sein: Sinkt der Index, sinkt die Miete. */
  aenderungEuro: number;
  aenderungProzent: number;
  zugang: IsoDatum;
  /** Beginn des übernächsten Monats nach Zugang (§ 557b Abs. 3 BGB). */
  wirksamNachZugang: IsoDatum;
  /** Späterer Termin aus wirksamNachZugang und dem Ende des Sperrjahrs. */
  wirksamAb: IsoDatum;
  /** Das Sperrjahr (Miete mindestens ein Jahr unverändert) verschiebt den Termin. */
  sperrjahrGreift: boolean;
  /** Letzte Anpassung + 1 Jahr: Eine Erklärung, die nicht davor zugeht, ist der sichere Weg. */
  sichererZugangAb: IsoDatum;
};

export function mieterhoehungIndex(e: IndexEingabe): IndexErgebnis | null {
  if (!(e.indexAlt > 0) || !(e.indexNeu > 0) || !(e.mieteAktuell >= 0)) return null;

  const faktor = e.indexNeu / e.indexAlt;
  const neueMiete = rundeCent(e.mieteAktuell * faktor);
  const zugang = e.geplanterZugang || e.heute;
  const wirksamNachZugang = monatsanfangNach(zugang, 2);
  const sichererZugangAb = plusJahre(e.letzteAnpassungAb, 1);
  const endeSperrjahr = monatsanfangAb(sichererZugangAb);

  return {
    neueMiete,
    aenderungEuro: rundeCent(neueMiete - e.mieteAktuell),
    aenderungProzent: (faktor - 1) * 100,
    zugang,
    wirksamNachZugang,
    wirksamAb: spaeter(wirksamNachZugang, endeSperrjahr),
    sperrjahrGreift: endeSperrjahr > wirksamNachZugang,
    sichererZugangAb,
  };
}
