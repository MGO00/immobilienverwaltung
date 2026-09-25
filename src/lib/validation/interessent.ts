import { z } from "zod";
import { BUNDESLAENDER } from "@/lib/constants/steuersaetze";
import { INTERESSENT_STATUS } from "@/lib/constants/interessent";
import { istGueltigeInseratUrl } from "@/lib/interessent-regeln";
import { objektArtSchema } from "@/lib/validation/immobilie";
import { kaufpreisRegel, pflichtZahlFeld, REGEL, zahlFeld } from "@/lib/validation/zahl";

export const interessentStatusSchema = z.enum(INTERESSENT_STATUS);

// Zahlenfelder kommen als Text, genau wie eingetippt, und werden mit denselben
// Regeln eingelesen wie im Browser (src/lib/validation/zahl.ts).
export const ZAHLENFELDER_INTERESSENT = {
  kaufpreis: pflichtZahlFeld(kaufpreisRegel("Trag den Kaufpreis ein.")),
  flaecheQm: zahlFeld(REGEL.flaeche),
  kaltmieteMonat: zahlFeld(REGEL.betrag),
  darlehenBetrag: zahlFeld(REGEL.betrag),
  sollzinsProzent: zahlFeld(REGEL.zins),
  tilgungProzent: zahlFeld(REGEL.tilgung),
};

export const interessentSchema = z.object({
  art: objektArtSchema,
  bezeichnung: z.string().trim().min(1, "Gib dem Interessenten eine Bezeichnung."),
  strasseHausnummer: z.string().nullable(),
  plz: z.string().nullable(),
  ort: z.string().nullable(),
  bundesland: z.enum(BUNDESLAENDER as unknown as [string, ...string[]]).nullable(),
  ...ZAHLENFELDER_INTERESSENT,
  inseratUrl: z
    .string()
    .nullable()
    .refine((wert) => wert === null || istGueltigeInseratUrl(wert), {
      message: "Der Link muss mit http:// oder https:// beginnen.",
    }),
});

/** Eingabe aus dem Formular (Zahlenfelder als Text). */
export type InteressentEingabe = z.input<typeof interessentSchema>;
/** Geprüfte, eingelesene Daten. */
export type InteressentDaten = z.infer<typeof interessentSchema>;

export const interessentNotizSchema = z.object({
  notiz: z.string().max(5000, "Die Notiz ist zu lang."),
});
