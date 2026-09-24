import { describe, expect, it } from "vitest";
import { FOTO_UPLOAD_MAX_BYTES, validiereFoto, validiereFotoUpload } from "./foto";

function datei(bytes: number, typ = "image/jpeg") {
  return new File([new Uint8Array(bytes)], "foto.jpg", { type: typ });
}

describe("Foto-Grenzen", () => {
  it("erlaubt die Auswahl bis 8 MB, den Upload aber nur bis 4 MB", () => {
    const sechsMb = datei(6 * 1024 * 1024);
    expect(validiereFoto(sechsMb)).toBeNull();
    expect(validiereFotoUpload(sechsMb)).toMatch(/zu groß/);
  });

  it("lässt Uploads bis genau 4 MB durch", () => {
    expect(validiereFotoUpload(datei(FOTO_UPLOAD_MAX_BYTES))).toBeNull();
    expect(validiereFotoUpload(datei(FOTO_UPLOAD_MAX_BYTES + 1))).not.toBeNull();
  });

  it("prüft beim Upload weiterhin das Format", () => {
    expect(validiereFotoUpload(datei(1000, "image/gif"))).toMatch(/JPG, PNG oder WebP/);
  });
});
