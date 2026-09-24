import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SeitenKopf, Seitenrahmen, ZurueckLink } from "@/components/website/bausteine";
import { glossarGruppen } from "@/lib/ressourcen/glossar";
import { GLOSSAR_EINLEITUNG } from "@/lib/ressourcen/inhalte";
import { websiteMetadata } from "@/lib/seo/rechner";

export const metadata = websiteMetadata("glossar");

export default function GlossarPage() {
  return (
    <Seitenrahmen>
      <ZurueckLink href="/ressourcen">Ressourcen</ZurueckLink>
      <SeitenKopf titel="Glossar" text={GLOSSAR_EINLEITUNG} />

      <div className="max-w-[820px] border-t border-border">
        {glossarGruppen().map((gruppe) => (
          <div
            key={gruppe.buchstabe}
            className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 border-b border-border py-6 md:grid-cols-[56px_minmax(0,1fr)] md:gap-6"
          >
            <div className="text-[21px] leading-none font-semibold text-neutral-700" aria-hidden="true">
              {gruppe.buchstabe}
            </div>
            <dl className="flex flex-col gap-5">
              {gruppe.eintraege.map((eintrag) => (
                <div key={eintrag.id} id={eintrag.id} className="scroll-mt-20">
                  <dt className="text-base font-semibold">{eintrag.begriff}</dt>
                  <dd className="mt-1 max-w-[600px] text-sm leading-[1.6] text-neutral-800 text-pretty">{eintrag.text}</dd>
                  <dd className="mt-2">
                    <Link
                      href={eintrag.href}
                      className="inline-flex items-center gap-1 text-[13px] text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      {eintrag.linkText}
                      <ArrowRight className="size-[13px]" strokeWidth={2.25} />
                    </Link>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </Seitenrahmen>
  );
}
