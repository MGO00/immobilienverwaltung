import { createHash, randomBytes } from "node:crypto";

// Der Link-Code ist ein zufälliger, nicht erratbarer Wert (32 Byte). In der
// Datenbank steht nur sein SHA-256-Hash.
export function erzeugeToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Grobe Formprüfung, bevor ein Wert aus der URL überhaupt abgefragt wird.
export function sieheWieTokenAus(token: unknown): token is string {
  return typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);
}
