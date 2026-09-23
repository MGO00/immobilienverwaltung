import { z } from "zod";
import { BUNDESLAENDER } from "@/lib/constants/steuersaetze";
import { INTERESSENT_STATUS } from "@/lib/constants/interessent";
import { istGueltigeInseratUrl } from "@/lib/interessent-regeln";
import { objektArtSchema } from "@/lib/validation/immobilie";

export const interessentStatusSchema = z.enum(INTERESSENT_STATUS);

export const interessentSchema = z.object({
  art: objektArtSchema,
  bezeichnung: z.string().trim().min(1, "Gib dem Interessenten eine Bezeichnung."),
  strasseHausnummer: z.string().nullable(),
  plz: z.string().nullable(),
  ort: z.string().nullable(),
  bundesland: z.enum(BUNDESLAENDER as unknown as [string, ...string[]]).nullable(),
  kaufpreis: z.number().gt(0, "Trag den Kaufpreis ein."),
  flaecheQm: z.number().min(0, "Die Fläche darf nicht negativ sein.").nullable(),
  kaltmieteMonat: z.number().min(0, "Die Miete darf nicht negativ sein.").nullable(),
  darlehenBetrag: z.number().min(0).nullable(),
  sollzinsProzent: z.number().min(0).nullable(),
  tilgungProzent: z.number().min(0).nullable(),
  inseratUrl: z
    .string()
    .nullable()
    .refine((wert) => wert === null || istGueltigeInseratUrl(wert), {
      message: "Der Link muss mit http:// oder https:// beginnen.",
    }),
});

export type InteressentEingabe = z.infer<typeof interessentSchema>;

export const interessentNotizSchema = z.object({
  notiz: z.string().max(5000, "Die Notiz ist zu lang."),
});
