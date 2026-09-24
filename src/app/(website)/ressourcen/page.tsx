import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PilleBereit, SeitenKopf, Seitenrahmen } from "@/components/website/bausteine";
import { RESSOURCEN_EINLEITUNG, RESSOURCEN_KARTEN } from "@/lib/ressourcen/inhalte";
import { websiteMetadata } from "@/lib/seo/rechner";

export const metadata = websiteMetadata("ressourcen");

export default function RessourcenPage() {
  return (
    <Seitenrahmen className="pt-11 md:pt-12">
      <SeitenKopf titel="Ressourcen" text={RESSOURCEN_EINLEITUNG} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        {RESSOURCEN_KARTEN.map((karte) => (
          <Link
            key={karte.href}
            href={karte.href}
            className="flex flex-col gap-2 rounded-[10px] border border-border p-6 text-foreground hover:border-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="text-xs text-neutral-700 tabular-nums">{karte.meta}</span>
              <PilleBereit />
            </span>
            <span className="mt-2 text-[19px] leading-[1.25] font-semibold">{karte.titel}</span>
            <span className="max-w-[440px] flex-1 text-sm leading-[1.55] text-neutral-800 text-pretty">{karte.text}</span>
            <span className="mt-3 flex items-center gap-1 text-[13px] font-semibold">
              {karte.cta}
              <ArrowRight className="size-3.5" strokeWidth={2.25} />
            </span>
          </Link>
        ))}
      </div>
    </Seitenrahmen>
  );
}
