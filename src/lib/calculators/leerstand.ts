import { rundeCent } from "@/lib/rundung";

// Nur für den eigenständigen Cashflow-Rechner ohne Objektbezug: Dort gibt es
// keine Einheiten mit echtem Status, deshalb wird ein geschätzter
// Leerstand-Prozentsatz von der Kaltmiete abgezogen. Der objektgebundene
// Rechner nutzt weiterhin die echten Einheiten-Ist-Daten.
// Prozentwerte außerhalb von 0–100 werden auf diesen Bereich begrenzt.
export function begrenzeLeerstandProzent(leerstandProzent: number | null): number {
  if (leerstandProzent === null || !Number.isFinite(leerstandProzent)) return 0;
  return Math.min(100, Math.max(0, leerstandProzent));
}

export function kaltmieteNachLeerstand(kaltmieteMonat: number, leerstandProzent: number | null): number {
  const anteil = begrenzeLeerstandProzent(leerstandProzent) / 100;
  return rundeCent(kaltmieteMonat * (1 - anteil));
}
