import type { Metadata } from "next";

// Solange das Impressum nicht fertig ist (Meilenstein 5), sollen Suchmaschinen
// die öffentlichen Rechnerseiten nicht aufnehmen. Zum Freischalten nur diesen
// einen Wert auf true setzen — nicht vorher, und nicht ohne Impressum.
export const RECHNER_INDEXIERBAR = false;

export const RECHNER_ROBOTS: Metadata["robots"] = {
  index: RECHNER_INDEXIERBAR,
  follow: RECHNER_INDEXIERBAR,
};

type RechnerSeite = "uebersicht" | "kaufnebenkosten" | "rendite" | "finanzierung" | "cashflow";

const MARKE = "Immobilienverwaltung";

// Deutsche Titel und Beschreibungen je Rechnerseite. Sie stehen schon jetzt im
// HTML, wirken aber wegen noindex erst nach dem Freischalten in der Suche.
const SEITEN: Record<RechnerSeite, { title: string; description: string }> = {
  uebersicht: {
    title: `Immobilien-Rechner kostenlos | ${MARKE}`,
    description:
      "Kaufnebenkosten, Rendite, Finanzierung mit Tilgungsplan und Cashflow: vier kostenlose Immobilien-Rechner für Privatvermieter und Kapitalanleger in Deutschland.",
  },
  kaufnebenkosten: {
    title: `Kaufnebenkosten-Rechner: Grunderwerbsteuer, Notar, Makler | ${MARKE}`,
    description:
      "Kaufnebenkosten für deine Immobilie berechnen: Grunderwerbsteuer je Bundesland, Notar, Grundbuch und Maklerprovision mit der Gesamtinvestition auf einen Blick.",
  },
  rendite: {
    title: `Mietrendite-Rechner: Brutto- und Nettorendite | ${MARKE}`,
    description:
      "Brutto- und Nettorendite sowie Kaufpreisfaktor einer vermieteten Immobilie berechnen, inklusive Kaufnebenkosten und laufender Kosten.",
  },
  finanzierung: {
    title: `Finanzierungsrechner mit Tilgungsplan | ${MARKE}`,
    description:
      "Monatliche Rate, Beleihungsauslauf und Tilgungsplan für dein Immobiliendarlehen berechnen: banküblich monatlich gerechnet, nach Kalenderjahren zusammengefasst.",
  },
  cashflow: {
    title: `Cashflow-Rechner für Vermieter | ${MARKE}`,
    description:
      "Monatlichen Cashflow einer Mietimmobilie berechnen: Kaltmiete, optionaler Leerstand, laufende Kosten und Darlehensrate im Überblick.",
  },
};

export function rechnerMetadata(seite: RechnerSeite): Metadata {
  return { title: SEITEN[seite].title, description: SEITEN[seite].description };
}
