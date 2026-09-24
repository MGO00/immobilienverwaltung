import { afterEach, describe, expect, it, vi } from "vitest";
import { siteUrl } from "./site-url";

describe("siteUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("nutzt NEXT_PUBLIC_SITE_URL ohne abschließenden Schrägstrich", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://beispiel.vercel.app/");
    expect(siteUrl()).toBe("https://beispiel.vercel.app");
  });

  it("fällt lokal auf localhost zurück", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("NODE_ENV", "development");
    expect(siteUrl()).toBe("http://localhost:3000");
  });

  it("wirft im Produktions-Build ohne Adresse einen Fehler statt localhost zu liefern", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(() => siteUrl()).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });
});
