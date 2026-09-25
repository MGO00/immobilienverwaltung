import { RechnerKarten } from "@/components/rechner/rechner-karten";
import { rechnerAnzahl } from "@/lib/rechner/liste";
import { rechnerMetadata } from "@/lib/seo/rechner";

export const metadata = rechnerMetadata("uebersicht");

export default function RechnerPage() {
  return (
    <div className="px-6 py-8">
      <p className="text-xs font-semibold tracking-[0.08em] text-neutral-700 uppercase">Werkzeuge</p>
      <h1 className="mt-1 text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">Rechner</h1>
      <p className="mt-4 max-w-[560px] text-sm text-neutral-700">
        {rechnerAnzahl(true)} Rechner rund um Kauf, Finanzierung und laufenden Ertrag einer Immobilie. Von einer
        Immobilien-Detailseite aus öffnen sie sich mit den Werten des Objekts vorbefüllt.
      </p>
      <RechnerKarten />
    </div>
  );
}
