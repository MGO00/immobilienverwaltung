import { PilleInVorbereitung, SeitenKopf, Seitenrahmen } from "@/components/website/bausteine";
import { TIPPS_EINLEITUNG, TIPPS_PLATZHALTER } from "@/lib/ressourcen/inhalte";
import { websiteMetadata } from "@/lib/seo/rechner";

export const metadata = websiteMetadata("tipps");

// Übersicht mit genau den zwei Platzhalter-Karten aus dem Handoff. Die Karten sind
// bewusst NICHT anklickbar (anders als im Prototyp): Es gibt noch keine Artikelseiten,
// und keine öffentliche Seite darf Blindtext zeigen. Die Artikel-Vorlage liegt als
// Baustein in src/components/tipps/artikel-vorlage.tsx.
export default function TippsPage() {
  return (
    <Seitenrahmen className="pt-11 md:pt-12">
      <SeitenKopf titel="Tipps & Tricks" text={TIPPS_EINLEITUNG} />
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        {TIPPS_PLATZHALTER.map((titel) => (
          <li key={titel} className="flex flex-col overflow-hidden rounded-[10px] border border-border">
            <div className="grid aspect-video w-full place-items-center bg-neutral-100 text-xs text-neutral-600">
              Bild folgt
            </div>
            <div className="flex flex-col gap-2 px-4 pt-4 pb-6">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-neutral-700">Lesedauer folgt</span>
                <PilleInVorbereitung />
              </div>
              <h2 className="text-lg leading-[1.25] font-semibold text-pretty">{titel}</h2>
              <p className="text-sm leading-[1.55] text-neutral-700">[Platzhalter] Teaser-Text folgt.</p>
            </div>
          </li>
        ))}
      </ul>
    </Seitenrahmen>
  );
}
