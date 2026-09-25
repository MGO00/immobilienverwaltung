import type { Metadata } from "next";
import { rechnerAnzahl, rechnerAufzaehlung } from "@/lib/rechner/liste";

// Solange das Impressum nicht fertig ist (Meilenstein 5), sollen Suchmaschinen
// die öffentlichen Rechnerseiten nicht aufnehmen. Zum Freischalten nur diesen
// einen Wert auf true setzen — nicht vorher, und nicht ohne Impressum.
export const RECHNER_INDEXIERBAR = false;

export const RECHNER_ROBOTS: Metadata["robots"] = {
  index: RECHNER_INDEXIERBAR,
  follow: RECHNER_INDEXIERBAR,
};

type RechnerSeite = "uebersicht" | "kaufnebenkosten" | "rendite" | "finanzierung" | "cashflow" | "mieterhoehung";

const MARKE = "Immobilienverwaltung";

// Deutsche Titel und Beschreibungen je Rechnerseite. Sie stehen schon jetzt im
// HTML, wirken aber wegen noindex erst nach dem Freischalten in der Suche.
const SEITEN: Record<RechnerSeite, { title: string; description: string }> = {
  uebersicht: {
    title: `Immobilien-Rechner kostenlos | ${MARKE}`,
    description: `${rechnerAufzaehlung()}: ${rechnerAnzahl()} kostenlose Immobilien-Rechner für Privatvermieter und Kapitalanleger in Deutschland.`,
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
  mieterhoehung: {
    title: `Mieterhöhungs-Rechner: Mietspiegel und Indexmiete | ${MARKE}`,
    description:
      "Mieterhöhung nach Mietspiegel (§ 558 BGB) mit Kappungsgrenze oder nach Indexmiete (§ 557b BGB) berechnen, mit frühestem Zugang und dem Datum, ab dem die neue Miete gilt. Keine Rechtsberatung.",
  },
};

export function rechnerMetadata(seite: RechnerSeite): Metadata {
  return { title: SEITEN[seite].title, description: SEITEN[seite].description };
}

// Die öffentliche Startseite folgt demselben Schalter wie die Rechner: noindex, bis das
// Impressum fertig ist.
export function startseiteMetadata(): Metadata {
  return {
    title: `Immobilien-Rechner und Verwaltung für private Vermieter | ${MARKE}`,
    description: `${rechnerAnzahl(true)} kostenlose Rechner für ${rechnerAufzaehlung()}. Mit Konto speicherst du deine Immobilien und behältst Mieten, Kosten und Darlehen im Blick.`,
    robots: RECHNER_ROBOTS,
  };
}

type WebsiteSeite = "ressourcen" | "grunderwerbsteuer" | "glossar" | "tipps";

// Ressourcen und Tipps & Tricks (Runde 4, Schritt 2): gleicher Schalter, noindex bis
// zum fertigen Impressum.
const WEBSITE_SEITEN: Record<WebsiteSeite, { title: string; description: string }> = {
  ressourcen: {
    title: `Ressourcen: Steuersätze und Begriffe zum Immobilienkauf | ${MARKE}`,
    description:
      "Zum Nachschlagen: die Grunderwerbsteuer aller 16 Bundesländer und ein Glossar mit den wichtigsten Kennzahlen und Begriffen aus den Immobilien-Rechnern.",
  },
  grunderwerbsteuer: {
    title: `Grunderwerbsteuer nach Bundesland: alle Steuersätze | ${MARKE}`,
    description:
      "Die Grunderwerbsteuersätze aller 16 Bundesländer auf einen Blick, mit Stand-Datum. Mit dem kostenlosen Rechner die Kaufnebenkosten deiner Immobilie berechnen.",
  },
  glossar: {
    title: `Immobilien-Glossar: Rendite, Tilgung, Beleihungsauslauf | ${MARKE}`,
    description:
      "Beleihungsauslauf, Brutto- und Nettorendite, Kaufpreisfaktor, Tilgung, Zinsbindung und mehr: die Begriffe aus den Immobilien-Rechnern kurz erklärt.",
  },
  tipps: {
    title: `Tipps & Tricks für private Vermieter | ${MARKE}`,
    description:
      "Artikel rund um Kauf, Finanzierung und Vermietung von Immobilien für private Vermieter und Kapitalanleger. Die ersten Artikel sind in Vorbereitung.",
  },
};

export function websiteMetadata(seite: WebsiteSeite): Metadata {
  return { ...WEBSITE_SEITEN[seite], robots: RECHNER_ROBOTS };
}
