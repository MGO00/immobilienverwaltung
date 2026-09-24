/* eslint-disable @next/next/no-img-element -- Artikelbilder kommen erst mit echten Artikeln; Bildquelle dann festlegen. */
import Link from "next/link";
import { PilleInVorbereitung, ZurueckLink } from "@/components/website/bausteine";
import { artikelMeta, type Artikel } from "@/lib/tipps/artikel";

// Wiederverwendbare Artikel-Vorlage für "Tipps & Tricks" (Handoff Runde 4, Schritt 2).
// Bewusst OHNE Route und ohne Beispielinhalt: Die erste Artikelseite (/tipps/<slug>)
// entsteht mit dem ersten echten Artikel. Keine öffentliche Seite mit Blindtext.
export function ArtikelVorlage({ artikel }: { artikel: Artikel }) {
  const meta = artikelMeta(artikel);

  return (
    <article className="mx-auto w-full max-w-[1120px] px-4 pt-10 pb-11 md:px-6 md:pb-16">
      <div className="mx-auto max-w-[680px]">
        <ZurueckLink href="/tipps">Tipps &amp; Tricks</ZurueckLink>
        <h1 className="text-[25px] leading-[1.2] font-semibold text-balance">{artikel.titel}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-3 border-b border-border pb-4 text-[13px] text-neutral-700 tabular-nums">
          {meta.map((teil, index) => (
            <span key={teil} className="flex items-center gap-3">
              {index > 0 && <span className="text-neutral-400">·</span>}
              {teil}
            </span>
          ))}
          {artikel.status === "in Vorbereitung" && <PilleInVorbereitung className="ml-auto" />}
        </div>

        {artikel.bild && (
          <img
            src={artikel.bild.src}
            alt={artikel.bild.alt}
            className="mt-6 aspect-video w-full rounded-[10px] object-cover"
          />
        )}

        <div className="mt-6 text-base leading-[1.7] text-neutral-900">
          <p className="mb-4 text-lg leading-[1.6] text-pretty">{artikel.einleitung}</p>
          {artikel.abschnitte.map((abschnitt, index) => {
            if (abschnitt.art === "zwischenueberschrift") {
              return (
                <h2 key={index} className="mt-8 mb-3 text-[19px] font-semibold">
                  {abschnitt.text}
                </h2>
              );
            }
            if (abschnitt.art === "liste") {
              return (
                <ul key={index} className="mb-4 flex list-disc flex-col gap-1.5 pl-5">
                  {abschnitt.punkte.map((punkt) => (
                    <li key={punkt}>{punkt}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={index} className="mb-4 text-pretty">
                {abschnitt.text}
              </p>
            );
          })}
        </div>

        {artikel.verwandt.length > 0 && (
          <div className="mt-14 border-t border-border pt-6">
            <h2 className="mb-4 text-[17px] font-semibold">Passend dazu</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {artikel.verwandt.map((inhalt) => (
                <Link
                  key={inhalt.href}
                  href={inhalt.href}
                  className="flex flex-col gap-1 rounded-[10px] border border-border px-4 py-3 text-foreground hover:border-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span className="text-[11px] tracking-[0.08em] text-neutral-700 uppercase">{inhalt.art}</span>
                  <span className="text-[15px] font-semibold">{inhalt.titel}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
