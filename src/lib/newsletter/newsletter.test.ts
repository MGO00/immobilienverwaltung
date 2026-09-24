import { describe, expect, it } from "vitest";
import { newsletterEmailSchema } from "@/lib/validation/newsletter";
import {
  ablaufZeitpunkt,
  entscheideAnmeldung,
  istAbgelaufen,
  MAIL_SPERRE_MINUTEN,
  MAX_BESTAETIGUNGSMAILS_PRO_STUNDE,
} from "./regeln";
import { erzeugeToken, hashToken, sieheWieTokenAus } from "./token";

const jetzt = new Date("2026-09-24T12:00:00Z");
const vorMinuten = (m: number) => new Date(jetzt.getTime() - m * 60 * 1000);

describe("Token", () => {
  it("erzeugt zufällige, gültig aussehende Codes", () => {
    const a = erzeugeToken();
    const b = erzeugeToken();
    expect(a).not.toBe(b);
    expect(sieheWieTokenAus(a)).toBe(true);
  });
  it("Hash ist stabil, hat 64 Zeichen und verrät den Code nicht", () => {
    const t = erzeugeToken();
    expect(hashToken(t)).toBe(hashToken(t));
    expect(hashToken(t)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(t)).not.toContain(t);
    expect(hashToken(t)).not.toBe(hashToken(erzeugeToken()));
  });
  it("lehnt falsche Formen ab", () => {
    expect(sieheWieTokenAus("")).toBe(false);
    expect(sieheWieTokenAus("kurz")).toBe(false);
    expect(sieheWieTokenAus(undefined)).toBe(false);
    expect(sieheWieTokenAus("a".repeat(43) + "!")).toBe(false);
  });
});

describe("entscheideAnmeldung", () => {
  it("neue Adresse: anlegen und senden", () => {
    expect(entscheideAnmeldung(null, jetzt, 0)).toBe("anlegen_und_senden");
  });
  it("bereits bestätigt: nichts senden", () => {
    expect(entscheideAnmeldung({ status: "confirmed", confirmationSentAt: vorMinuten(999) }, jetzt, 0)).toBe(
      "nichts_senden",
    );
  });
  it("offene Anmeldung innerhalb der Sperrfrist: nichts senden", () => {
    expect(
      entscheideAnmeldung({ status: "pending", confirmationSentAt: vorMinuten(MAIL_SPERRE_MINUTEN - 1) }, jetzt, 0),
    ).toBe("nichts_senden");
  });
  it("offene Anmeldung nach der Sperrfrist: erneut senden", () => {
    expect(
      entscheideAnmeldung({ status: "pending", confirmationSentAt: vorMinuten(MAIL_SPERRE_MINUTEN + 1) }, jetzt, 0),
    ).toBe("erneut_senden");
  });
  it("offene Anmeldung ohne Versanddatum (Mail war fehlgeschlagen): erneut senden", () => {
    expect(entscheideAnmeldung({ status: "pending", confirmationSentAt: null }, jetzt, 0)).toBe("erneut_senden");
  });
  it("abgemeldete Adresse braucht eine neue Bestätigung", () => {
    expect(entscheideAnmeldung({ status: "unsubscribed", confirmationSentAt: vorMinuten(5000) }, jetzt, 0)).toBe(
      "erneut_senden",
    );
  });
  it("Stundenlimit stoppt neue Mails", () => {
    expect(entscheideAnmeldung(null, jetzt, MAX_BESTAETIGUNGSMAILS_PRO_STUNDE)).toBe("limit_erreicht");
    expect(entscheideAnmeldung(null, jetzt, MAX_BESTAETIGUNGSMAILS_PRO_STUNDE - 1)).toBe("anlegen_und_senden");
  });
  it("Sperrfrist und bestätigt gehen dem Limit vor (keine Auskunft über bestehende Adressen)", () => {
    expect(
      entscheideAnmeldung({ status: "confirmed", confirmationSentAt: null }, jetzt, MAX_BESTAETIGUNGSMAILS_PRO_STUNDE),
    ).toBe("nichts_senden");
  });
});

describe("Ablauf", () => {
  it("Link ist 48 Stunden gültig", () => {
    const ablauf = ablaufZeitpunkt(jetzt);
    expect(ablauf.getTime() - jetzt.getTime()).toBe(48 * 60 * 60 * 1000);
    expect(istAbgelaufen(ablauf, jetzt)).toBe(false);
    expect(istAbgelaufen(ablauf, new Date(ablauf.getTime() + 1))).toBe(true);
  });
  it("fehlender Ablauf gilt als abgelaufen", () => {
    expect(istAbgelaufen(null, jetzt)).toBe(true);
  });
});

describe("newsletterEmailSchema", () => {
  it("nimmt gültige Adressen an und normalisiert sie", () => {
    expect(newsletterEmailSchema.parse("  Marco.K@Example.DE ")).toBe("marco.k@example.de");
  });
  it("lehnt ungültige Adressen mit der Meldung aus dem Design ab", () => {
    for (const falsch of ["", "kein-at", "a@b", "a b@c.de", "@example.de"]) {
      const r = newsletterEmailSchema.safeParse(falsch);
      expect(r.success).toBe(false);
      if (!r.success) expect(r.error.issues[0].message).toBe("Bitte gib eine gültige E-Mail-Adresse ein.");
    }
  });
  it("lehnt zu lange Adressen ab", () => {
    expect(newsletterEmailSchema.safeParse("a".repeat(250) + "@example.de").success).toBe(false);
  });
});
