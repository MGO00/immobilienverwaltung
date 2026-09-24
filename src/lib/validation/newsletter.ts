import { z } from "zod";

export const newsletterEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Bitte gib eine gültige E-Mail-Adresse ein.")
  .max(254, "Bitte gib eine gültige E-Mail-Adresse ein.")
  .email("Bitte gib eine gültige E-Mail-Adresse ein.");
