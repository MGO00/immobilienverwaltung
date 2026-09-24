import { START_RECHNER } from "@/lib/start/inhalte";

type RechnerTitel = (typeof START_RECHNER)[number]["titel"];

// Glossar laut Handoff Runde 4, Schritt 2 (fachlich geprüft, wortgleich
// übernehmen, nicht umformulieren).
export const GLOSSAR: ReadonlyArray<{ begriff: string; text: string; rechner: RechnerTitel }> = [
  { begriff: "Beleihungsauslauf", text: "Anteil des Kaufpreises, der über ein Darlehen finanziert wird.", rechner: "Finanzierung" },
  { begriff: "Bruttorendite", text: "Jahreskaltmiete geteilt durch den Kaufpreis, ohne Kosten abzuziehen.", rechner: "Rendite" },
  {
    begriff: "Kaufpreisfaktor",
    text: "Kaufpreis geteilt durch die Jahreskaltmiete. Er zeigt, wie viele Jahresmieten der Kaufpreis entspricht.",
    rechner: "Rendite",
  },
  {
    begriff: "Nettorendite",
    text: "Jahreskaltmiete abzüglich laufender Kosten, geteilt durch die Gesamtinvestition.",
    rechner: "Rendite",
  },
  {
    begriff: "Nicht umlagefähige Kosten",
    text: "Kosten, die der Vermieter trägt und nicht auf die Mieter umlegen kann, z. B. Verwaltung oder Instandhaltungsrücklage.",
    rechner: "Cashflow",
  },
  {
    begriff: "Tilgung",
    text: "Der Teil der monatlichen Kreditrate, der das Darlehen tatsächlich verringert. Der Rest ist Zins.",
    rechner: "Finanzierung",
  },
  {
    begriff: "Zinsbindung",
    text: "Der Zeitraum, für den der vereinbarte Zinssatz eines Darlehens fest steht.",
    rechner: "Finanzierung",
  },
];

export type GlossarEintrag = {
  id: string;
  begriff: string;
  text: string;
  linkText: string;
  href: string;
};

export type GlossarGruppe = { buchstabe: string; eintraege: GlossarEintrag[] };

// Anker-ID je Begriff, z. B. "glossar-kaufpreisfaktor". Umlaute werden umgeschrieben,
// damit die Adresse (…/glossar#glossar-nicht-umlagefaehige-kosten) ohne Sonderzeichen auskommt.
export function glossarId(begriff: string): string {
  const ohneUmlaute = begriff
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
  return `glossar-${ohneUmlaute.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

// Gruppiert die Einträge nach Anfangsbuchstaben, Gruppen und Einträge alphabetisch.
export function glossarGruppen(): GlossarGruppe[] {
  const gruppen = new Map<string, GlossarEintrag[]>();
  const sortiert = [...GLOSSAR].sort((a, b) => a.begriff.localeCompare(b.begriff, "de"));

  for (const eintrag of sortiert) {
    const rechner = START_RECHNER.find((r) => r.titel === eintrag.rechner);
    if (!rechner) throw new Error(`Unbekannter Rechner im Glossar: ${eintrag.rechner}`);
    const buchstabe = eintrag.begriff[0].toUpperCase();
    const liste = gruppen.get(buchstabe) ?? [];
    liste.push({
      id: glossarId(eintrag.begriff),
      begriff: eintrag.begriff,
      text: eintrag.text,
      linkText: `Zum Rechner ${rechner.nr} · ${rechner.titel}`,
      href: rechner.href,
    });
    gruppen.set(buchstabe, liste);
  }

  return [...gruppen.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "de"))
    .map(([buchstabe, eintraege]) => ({ buchstabe, eintraege }));
}
