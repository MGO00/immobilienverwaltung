import { z } from "zod";
import { BUNDESLAENDER } from "@/lib/constants/steuersaetze";

export const objektArtSchema = z.enum(["eigentumswohnung", "einfamilienhaus", "mehrfamilienhaus"]);
export type ObjektArt = z.infer<typeof objektArtSchema>;

export const einheitStatusSchema = z.enum(["vermietet", "selbstgenutzt", "leer"]);
export type EinheitStatus = z.infer<typeof einheitStatusSchema>;

const einheitEingabeSchema = z.object({
  name: z.string().min(1, "Bitte eine Bezeichnung für die Einheit angeben."),
  flaecheQm: z.number().min(0).nullable(),
  kaltmieteMonat: z.number().min(0, "Die Kaltmiete darf nicht negativ sein."),
  status: einheitStatusSchema,
});

const laufendeKostenSchema = z.record(z.string(), z.number().min(0));

export const immobilieSchema = z
  .object({
    art: objektArtSchema,
    bezeichnung: z.string().min(1, "Gib der Immobilie eine Bezeichnung."),
    strasseHausnummer: z.string().nullable(),
    plz: z.string().nullable(),
    ort: z.string().nullable(),
    bundesland: z.enum(BUNDESLAENDER as unknown as [string, ...string[]]).nullable(),
    baujahr: z.number().int().gt(1000).nullable(),
    grundstuecksflaecheQm: z.number().min(0).nullable(),
    wohnflaecheQm: z.number().min(0).nullable(),
    kaufdatum: z.string().nullable(),
    kaufpreis: z.number().gt(0, "Trag den Kaufpreis ein — ohne ihn lässt sich keine Rendite rechnen."),
    kaufnebenkostenBetrag: z.number().min(0).nullable(),
    ohneFinanzierung: z.boolean(),
    darlehenBetrag: z.number().min(0).nullable(),
    sollzinsProzent: z.number().min(0).nullable(),
    tilgungProzent: z.number().min(0).nullable(),
    zinsbindungBis: z.string().nullable(),
    kaltmieteMonat: z.number().min(0).nullable(),
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

export type ImmobilieEingabe = z.infer<typeof immobilieSchema>;

export const notizSchema = z.object({
  text: z.string().min(1, "Die Notiz darf nicht leer sein."),
});
