import { describe, expect, it } from "vitest";
import {
  istGueltigeInseratUrl,
  kannStatusSetzen,
  kannUebernehmen,
  zaehleAktive,
  zaehleNachStatus,
} from "./interessent-regeln";
import { interessentSchema } from "./validation/interessent";

const beispiele = [
  { status: "besichtigt" as const },
  { status: "beobachtet" as const },
  { status: "angebot_abgegeben" as const },
  { status: "abgelehnt" as const },
  { status: "gekauft" as const },
];

describe("zaehleAktive", () => {
  it("zählt beobachtet, besichtigt und Angebot abgegeben, nicht gekauft/abgelehnt", () => {
    expect(zaehleAktive(beispiele)).toBe(3);
  });
  it("ist 0 bei leerer Liste", () => {
    expect(zaehleAktive([])).toBe(0);
  });
});

describe("zaehleNachStatus", () => {
  it("liefert für jeden Status einen Zähler, auch mit 0", () => {
    expect(zaehleNachStatus([{ status: "besichtigt" }, { status: "besichtigt" }])).toEqual({
      beobachtet: 0,
      besichtigt: 2,
      angebot_abgegeben: 0,
      gekauft: 0,
      abgelehnt: 0,
    });
  });
});

describe("kannUebernehmen", () => {
  it("ab besichtigt und Angebot abgegeben", () => {
    expect(kannUebernehmen({ status: "besichtigt", propertyId: null })).toBe(true);
    expect(kannUebernehmen({ status: "angebot_abgegeben", propertyId: null })).toBe(true);
  });
  it("nicht bei beobachtet, abgelehnt oder gekauft", () => {
    expect(kannUebernehmen({ status: "beobachtet", propertyId: null })).toBe(false);
    expect(kannUebernehmen({ status: "abgelehnt", propertyId: null })).toBe(false);
    expect(kannUebernehmen({ status: "gekauft", propertyId: null })).toBe(false);
  });
  it("nicht doppelt, wenn schon eine Immobilie verknüpft ist", () => {
    expect(kannUebernehmen({ status: "besichtigt", propertyId: "abc" })).toBe(false);
  });
});

describe("kannStatusSetzen", () => {
  it("erlaubt Wechsel zwischen den offenen Status und abgelehnt, auch zurück", () => {
    expect(kannStatusSetzen("beobachtet", "besichtigt")).toBe(true);
    expect(kannStatusSetzen("angebot_abgegeben", "beobachtet")).toBe(true);
    expect(kannStatusSetzen("beobachtet", "abgelehnt")).toBe(true);
    expect(kannStatusSetzen("abgelehnt", "beobachtet")).toBe(true);
  });
  it("gekauft nur über die Übernahme, nie direkt", () => {
    expect(kannStatusSetzen("besichtigt", "gekauft")).toBe(false);
  });
  it("ein gekaufter Interessent bleibt gekauft", () => {
    expect(kannStatusSetzen("gekauft", "beobachtet")).toBe(false);
  });
  it("gleicher Status ist kein Wechsel", () => {
    expect(kannStatusSetzen("besichtigt", "besichtigt")).toBe(false);
  });
});

describe("istGueltigeInseratUrl", () => {
  it("akzeptiert http und https", () => {
    expect(istGueltigeInseratUrl("https://www.immobilienscout24.de/expose/123")).toBe(true);
    expect(istGueltigeInseratUrl("http://example.com/a?b=1")).toBe(true);
  });
  it("lehnt gefährliche und ungültige Adressen ab", () => {
    expect(istGueltigeInseratUrl("javascript:alert(1)")).toBe(false);
    expect(istGueltigeInseratUrl("data:text/html,<script>1</script>")).toBe(false);
    expect(istGueltigeInseratUrl("ftp://example.com")).toBe(false);
    expect(istGueltigeInseratUrl("kein link")).toBe(false);
    expect(istGueltigeInseratUrl("https://exa mple.com")).toBe(false);
  });
});

describe("interessentSchema", () => {
  const gueltig = {
    art: "eigentumswohnung",
    bezeichnung: "Altbauwohnung Connewitz",
    strasseHausnummer: null,
    plz: null,
    ort: "Leipzig",
    bundesland: "Sachsen",
    kaufpreis: 165000,
    flaecheQm: 72,
    kaltmieteMonat: 780,
    darlehenBetrag: null,
    sollzinsProzent: null,
    tilgungProzent: null,
    inseratUrl: "https://example.com/inserat",
  };

  it("nimmt das Beispiel aus dem Briefing an", () => {
    expect(interessentSchema.safeParse(gueltig).success).toBe(true);
  });
  it("verlangt Bezeichnung und Kaufpreis", () => {
    expect(interessentSchema.safeParse({ ...gueltig, bezeichnung: "  " }).success).toBe(false);
    expect(interessentSchema.safeParse({ ...gueltig, kaufpreis: 0 }).success).toBe(false);
  });
  it("lehnt javascript:-Links ab", () => {
    expect(interessentSchema.safeParse({ ...gueltig, inseratUrl: "javascript:alert(1)" }).success).toBe(false);
  });
  it("erlaubt fehlenden Inserats-Link und fehlende Finanzierung", () => {
    expect(interessentSchema.safeParse({ ...gueltig, inseratUrl: null }).success).toBe(true);
  });
  it("lehnt ein unbekanntes Bundesland ab", () => {
    expect(interessentSchema.safeParse({ ...gueltig, bundesland: "Atlantis" }).success).toBe(false);
  });
});
