import { z } from "zod";

export const profilSchema = z.object({
  name: z.string().trim().min(1, "Bitte gib deinen Namen ein.").max(80, "Der Name ist zu lang."),
});

// Gleiche Regel wie bei der Registrierung und beim Zurücksetzen: mindestens 8 Zeichen.
export const passwortAendernSchema = z
  .object({
    aktuell: z.string().min(1, "Bitte gib dein aktuelles Passwort ein."),
    neu: z.string().min(8, "Das neue Passwort muss mindestens 8 Zeichen lang sein.").max(72, "Das Passwort ist zu lang."),
    wiederholung: z.string(),
  })
  .refine((d) => d.neu === d.wiederholung, {
    message: "Die beiden neuen Passwörter stimmen nicht überein.",
    path: ["wiederholung"],
  })
  .refine((d) => d.neu !== d.aktuell, {
    message: "Das neue Passwort muss sich vom aktuellen unterscheiden.",
    path: ["neu"],
  });
