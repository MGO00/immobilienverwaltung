import { z } from "zod";
import { BUNDESLAENDER } from "@/lib/constants/steuersaetze";
import { kaufpreisRegel, pflichtZahlFeld, REGEL, zahlFeld } from "@/lib/validation/zahl";

export const objektArtSchema = z.enum(["eigentumswohnung", "einfamilienhaus", "mehrfamilienhaus"]);
export type ObjektArt = z.infer<typeof objektArtSchema>;

export const einheitStatusSchema = z.enum(["vermietet", "selbstgenutzt", "leer"]);
export type EinheitStatus = z.infer<typeof einheitStatusSchema>;

// Zahlenfelder kommen als Text, genau wie eingetippt, und werden mit denselben
// Regeln eingelesen wie im Browser (src/lib/validation/zahl.ts).
export const KAUFPREIS_MELDUNG = "Trag den Kaufpreis ein — ohne ihn lässt sich keine Rendite rechnen.";

export const ZAHLENFELDER_IMMOBILIE = {
  baujahr: zahlFeld(REGEL.baujahr),
  grundstuecksflaecheQm: zahlFeld(REGEL.flaeche),
  wohnflaecheQm: zahlFeld(REGEL.flaeche),
  kaufpreis: pflichtZahlFeld(kaufpreisRegel(KAUFPREIS_MELDUNG)),
  kaufnebenkostenBetrag: zahlFeld(REGEL.betrag),
  darlehenBetrag: zahlFeld(REGEL.betrag),
  sollzinsProzent: zahlFeld(REGEL.zins),
  tilgungProzent: zahlFeld(REGEL.tilgung),
  kaltmieteMonat: zahlFeld(REGEL.betrag),
};

/** Einheit: leere Kaltmiete zählt als 0 (Datenbank: not null default 0). */
export const ZAHLENFELDER_EINHEIT = {
  flaecheQm: zahlFeld(REGEL.flaeche),
  kaltmieteMonat: zahlFeld(REGEL.betrag).transform((wert) => wert ?? 0),
};

const einheitEingabeSchema = z.object({
  name: z.string().min(1, "Bitte eine Bezeichnung für die Einheit angeben."),
  ...ZAHLENFELDER_EINHEIT,
  status: einheitStatusSchema,
});

/** Ein Posten der laufenden Kosten; leer zählt als 0 und wird nicht gespeichert. */
export const kostenPostenFeld = zahlFeld(REGEL.betrag).transform((wert) => wert ?? 0);
export const laufendeKostenSchema = z.record(z.string(), kostenPostenFeld);

export const immobilieSchema = z
  .object({
    art: objektArtSchema,
    bezeichnung: z.string().min(1, "Gib der Immobilie eine Bezeichnung."),
    strasseHausnummer: z.string().nullable(),
    plz: z.string().nullable(),
    ort: z.string().nullable(),
    bundesland: z.enum(BUNDESLAENDER as unknown as [string, ...string[]]).nullable(),
    ...ZAHLENFELDER_IMMOBILIE,
    kaufdatum: z.string().nullable(),
    ohneFinanzierung: z.boolean(),
    zinsbindungBis: z.string().nullable(),
    status: einheitStatusSchema.nullable(),
    einheiten: z.array(einheitEingabeSchema),
    laufendeKosten: laufendeKostenSchema,
  })
  .superRefine((data, ctx) => {
    if (data.art === "mehrfamilienhaus") {
      if (data.einheiten.length === 0) {
        ctx.addIssue({ code: "custom", message: "Leg mindestens eine Einheit an.", path: ["einheiten"] });
      }
    } else if (!data.kaltmieteMonat || data.kaltmieteMonat <= 0) {
      ctx.addIssue({ code: "custom", message: "Trag die Kaltmiete ein.", path: ["kaltmieteMonat"] });
    }
  });

/** Eingabe aus dem Formular (Zahlenfelder als Text). */
export type ImmobilieEingabe = z.input<typeof immobilieSchema>;

export const notizSchema = z.object({
  text: z.string().min(1, "Die Notiz darf nicht leer sein."),
});
