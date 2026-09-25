import { MIETRECHT_STAND } from "@/lib/calculators/mieterhoehung";

// Texte des Mieterhöhungs-Rechners, zentral statt in der Oberfläche. Die rechtlichen
// Aussagen sind mit dem Auftraggeber abgestimmt (Stand siehe MIETRECHT_STAND) und
// stehen auf der Liste "Mieterhöhungsregeln fachlich prüfen lassen" (CLAUDE.md).

export const PFLICHTHINWEIS =
  "Keine Rechtsberatung. Der Rechner gibt eine Orientierung auf Basis deiner Eingaben; für verbindliche Aussagen wende dich an einen Mieterverein, Haus & Grund oder eine Anwältin/einen Anwalt.";

export const HILFE_VERGLEICHSMIETE = {
  titel: "Wo finde ich die Vergleichsmiete?",
  punkte: [
    "Im Mietspiegel deiner Gemeinde: meist auf der Website der Stadt, oft mit Online-Rechner. Größere Städte müssen einen Mietspiegel erstellen. Suchbegriff: „Mietspiegel“ und dein Ort.",
    "Auch Mietervereine und Haus & Grund vor Ort geben den Mietspiegel heraus oder helfen bei der Einordnung.",
    "Gibt es keinen Mietspiegel: der Mietspiegel einer vergleichbaren Nachbargemeinde, ein Sachverständigengutachten oder drei vergleichbare Wohnungen (diese Begründungsmittel nennt § 558a BGB).",
    "Wichtig: Angebotspreise aus Immobilienportalen sind nicht die ortsübliche Vergleichsmiete. Der Mietspiegel bildet tatsächlich gezahlte Mieten ab, die in der Regel niedriger liegen.",
    "Der Mietspiegel ordnet die Wohnung nach Baujahr, Größe, Lage und Ausstattung ein; oft ergibt sich eine Spanne. Der Rechner braucht einen Wert in €/m².",
  ],
} as const;

/** Konkreter Suchbegriff bei Objektbezug mit hinterlegtem Ort. Nur Text, kein Link. */
export function suchbegriffMietspiegel(ort: string): string {
  return `Suche nach: Mietspiegel ${ort}`;
}

export const HILFE_INDEX = {
  titel: "Wo finde ich den Verbraucherpreisindex?",
  punkte: [
    "Der Verbraucherpreisindex für Deutschland wird monatlich vom Statistischen Bundesamt (Destatis) veröffentlicht, Basis 2020 = 100. Maßgeblich ist der Wert, den dein Mietvertrag nennt (meist der Monatswert).",
    "Index alt = Wert zum Zeitpunkt der letzten Anpassung bzw. des Vertragsbeginns, so wie im Mietvertrag festgelegt.",
    "Beide Werte müssen dasselbe Basisjahr haben. Destatis stellt die Basis regelmäßig um; stammt der alte Wert aus einer älteren Basis, musst du ihn umrechnen (Destatis bietet dafür eine Umrechnung an) oder beide Werte aus der aktuellen Reihe nehmen.",
  ],
} as const;

export const HINWEIS_LETZTE_ERHOEHUNG =
  "Datum, ab dem die letzte Erhöhung nach Mietspiegel galt (bzw. Mietbeginn). Erhöhungen wegen Modernisierung oder Betriebskosten zählen hier nicht.";

export const HINWEIS_MIETE_VOR_DREI_JAHREN =
  "Bei kürzerem Mietverhältnis die Anfangsmiete. Erhöhungen wegen Modernisierung (§ 559) oder Betriebskosten (§ 560) nicht mitzählen.";

export const HINWEIS_LETZTE_ANPASSUNG = "Datum, ab dem die letzte Anpassung galt (bzw. Vertragsbeginn).";

export const HINWEISE_MIETSPIEGEL = [
  "Das Erhöhungsverlangen muss in Textform begründet werden, z. B. mit dem Mietspiegel, einem Gutachten oder drei Vergleichswohnungen.",
  "Ob die Kappungsgrenze von 15 % gilt, regelt die Kappungsgrenzen-Verordnung deines Bundeslands.",
  "Gilt nicht bei Staffel- oder Indexmiete, nicht für Sozialwohnungen und Gewerberäume.",
] as const;

export const HINWEIS_STAFFELMIETE =
  "Staffelmiete: Die Erhöhungen ergeben sich aus dem Vertrag; eine Erhöhung nach Mietspiegel oder Index ist währenddessen nicht möglich.";

export const HINWEIS_REFORM_INDEX = `Eine Reform ist geplant, nach der bei einer Inflation über 3 % die Hälfte des darüber liegenden Anteils unberücksichtigt bleibt. Sie ist noch kein geltendes Recht (Stand ${MIETRECHT_STAND}).`;

export function warnungZugangZuFrueh(datum: string): string {
  return `Ein Erhöhungsverlangen, das vor dem ${datum} zugeht, ist unwirksam und muss neu gestellt werden.`;
}

export function warnungSperrjahr(datum: string): string {
  return `Sicherer Weg: Erklärung so zustellen, dass sie nicht vor dem ${datum} zugeht. Ob eine früher zugestellte Erklärung wirkt, ist rechtlich nicht eindeutig.`;
}
