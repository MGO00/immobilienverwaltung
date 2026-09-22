import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein."),
  password: z.string().min(1, "Bitte gib dein Passwort ein."),
});

export const signUpSchema = z.object({
  name: z.string().min(1, "Bitte gib deinen Namen ein."),
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein."),
  password: z.string().min(8, "Das Passwort muss mindestens 8 Zeichen lang sein."),
});

export const emailSchema = z.object({
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein."),
});

export const newPasswordSchema = z.object({
  password: z.string().min(8, "Das Passwort muss mindestens 8 Zeichen lang sein."),
});
