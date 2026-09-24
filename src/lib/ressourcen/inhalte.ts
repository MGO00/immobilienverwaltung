import { GRUNDERWERBSTEUER_PROZENT } from "@/lib/constants/steuersaetze";
import { GLOSSAR } from "./glossar";

// Texte der Seiten aus Runde 4, Schritt 2 (Ressourcen, Grunderwerbsteuer, Glossar,
// Tipps & Tricks). Vom Auftraggeber freigegeben: 1:1 aus dem Handoff, nicht umformulieren.

export const RESSOURCEN_EINLEITUNG =
  "Zum Nachschlagen statt zum Rechnen: Steuersätze und Begriffe rund um den Immobilienkauf. Die Rechner arbeiten mit deinen eigenen Zahlen, hier findest du die Grundlagen dazu.";

// Die Zahlen in der Meta-Zeile werden aus den Daten gezählt, nicht eingetippt.
export const RESSOURCEN_KARTEN = [
  {
    meta: `Tabelle · ${Object.keys(GRUNDERWERBSTEUER_PROZENT).length} Bundesländer`,
    titel: "Grunderwerbsteuer nach Bundesland",
    text: "Der aktuelle Steuersatz aller Bundesländer auf einen Blick, mit Stand-Datum.",
    cta: "Tabelle öffnen",
    href: "/ressourcen/grunderwerbsteuer",
  },
  {
    meta: `Glossar · ${GLOSSAR.length} Begriffe`,
    titel: "Glossar",
    text: "Kennzahlen und Begriffe aus den Rechnern, jeweils in ein bis zwei Sätzen erklärt.",
    cta: "Glossar öffnen",
    href: "/ressourcen/glossar",
  },
] as const;

export const GRUNDERWERBSTEUER_EINLEITUNG =
  "Die Grunderwerbsteuer zahlst du einmalig, wenn du ein Grundstück oder eine Immobilie kaufst. Berechnet wird sie auf den Kaufpreis im notariellen Kaufvertrag. Den Steuersatz legt jedes Bundesland selbst fest, deshalb hängt die Höhe davon ab, wo die Immobilie liegt.";

export const GLOSSAR_EINLEITUNG = "Die Begriffe aus den Rechnern, alphabetisch und kurz erklärt.";

export const TIPPS_EINLEITUNG = "Die ersten Artikel sind in Vorbereitung.";

// Ausschließlich diese zwei Platzhalter-Titel (keine Teaser, Lesedauern oder Daten
// ergänzen, die kommen später mit dem Auftraggeber). Die Karten sind nicht anklickbar.
export const TIPPS_PLATZHALTER = [
  "[Platzhalter] Die wichtigsten Kennzahlen beim Immobilienkauf",
  "[Platzhalter] Kaltmiete, Warmmiete, Nettokaltmiete erklärt",
] as const;
