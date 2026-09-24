import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { Abschnitt, AbschnittKopf } from "@/components/start/abschnitt";
import { FaqListe } from "@/components/start/faq-liste";
import { KontoGeloeschtHinweis } from "@/components/start/konto-geloescht-hinweis";
import { Hero } from "@/components/start/hero";
import { NewsletterKarte } from "@/components/start/newsletter-karte";
import { StartHeader } from "@/components/start/start-header";
import { newsletterKonfiguriert } from "@/lib/newsletter/konfiguration";
import { startseiteMetadata } from "@/lib/seo/rechner";
import { START_FAQ, START_FAQ_KONTAKT, START_RECHNER, START_SCHRITTE } from "@/lib/start/inhalte";

export const metadata = startseiteMetadata();

// Öffentliche Startseite für Besucher ohne Anmeldung. Angemeldete Nutzer leitet
// src/proxy.ts schon vorher direkt auf /uebersicht weiter.
export default function StartPage() {
  return (
    <div className="flex min-h-full flex-col">
      <StartHeader />
      <Suspense fallback={null}>
        <KontoGeloeschtHinweis />
      </Suspense>

      <main className="flex-1">
        <Hero />

        <Abschnitt id="rechner">
          <AbschnittKopf
            titel="Vier Rechner, ohne Anmeldung"
            text="Jeder Rechner funktioniert für sich. Ergebnisse des Kaufnebenkosten-Rechners kannst du mit Konto direkt einer Immobilie zuordnen."
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
            {START_RECHNER.map((rechner) => (
              <Link
                key={rechner.nr}
                href={rechner.href}
                className="flex flex-col gap-2 rounded-[10px] border border-border p-4 text-foreground hover:border-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="text-xs text-neutral-700 tabular-nums">{rechner.nr}</span>
                <span className="text-[17px] font-semibold">{rechner.titel}</span>
                <span className="flex-1 text-[13px] leading-[1.5] text-neutral-800 text-pretty">{rechner.text}</span>
                <span className="mt-2 flex items-center gap-1 text-[13px] font-semibold">
                  Rechner öffnen
                  <ArrowRight className="size-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </Abschnitt>

        <Abschnitt>
          <AbschnittKopf titel="So funktioniert’s" text="Aus einer Rechnung wird eine Immobilie, die du laufend pflegst." />
          <ol className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {START_SCHRITTE.map((schritt) => (
              <li key={schritt.nr} className="border-t border-foreground pt-3">
                <p className="text-[13px] font-semibold text-neutral-700 tabular-nums">{schritt.nr}</p>
                <p className="mt-2 text-[17px] font-semibold">{schritt.titel}</p>
                <p className="mt-1.5 text-[13px] leading-[1.55] text-neutral-800 text-pretty">{schritt.text}</p>
              </li>
            ))}
          </ol>
        </Abschnitt>

        <Abschnitt>
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-14">
            <div>
              <h2 className="text-[21px] font-semibold">Häufige Fragen</h2>
              <p className="mt-1.5 text-sm text-neutral-700 text-pretty">{START_FAQ_KONTAKT}</p>
            </div>
            <FaqListe fragen={START_FAQ} />
          </div>
        </Abschnitt>

        {/* Nur mit eingerichtetem Mailversand und Secret-Key (siehe .env.example). */}
        {newsletterKonfiguriert() && (
          <Abschnitt ohneLinie>
            <NewsletterKarte />
          </Abschnitt>
        )}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1120px] justify-center gap-4 px-4 py-4 text-xs md:px-6">
          <a href="#impressum" className="text-neutral-700 hover:text-foreground">
            Impressum
          </a>
          <span className="text-neutral-400">·</span>
          <a href="#datenschutz" className="text-neutral-700 hover:text-foreground">
            Datenschutz
          </a>
        </div>
      </footer>
    </div>
  );
}
