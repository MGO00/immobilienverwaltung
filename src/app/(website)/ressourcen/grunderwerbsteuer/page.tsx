import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Seitenrahmen, ZurueckLink } from "@/components/website/bausteine";
import { GrunderwerbsteuerTabelle } from "@/components/website/grunderwerbsteuer-tabelle";
import { GRUNDERWERBSTEUER_EINLEITUNG } from "@/lib/ressourcen/inhalte";
import { websiteMetadata } from "@/lib/seo/rechner";

export const metadata = websiteMetadata("grunderwerbsteuer");

export default function GrunderwerbsteuerPage() {
  return (
    <Seitenrahmen>
      <ZurueckLink href="/ressourcen">Ressourcen</ZurueckLink>
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-14">
        <div>
          <h1 className="text-[25px] leading-[1.2] font-semibold">Grunderwerbsteuer nach Bundesland</h1>
          <p className="mt-3 text-sm leading-[1.6] text-neutral-800 text-pretty">{GRUNDERWERBSTEUER_EINLEITUNG}</p>
        </div>
        <div>
          <GrunderwerbsteuerTabelle />
          <div className="mt-6 border-t border-border pt-6">
            <Button asChild>
              <Link href="/rechner/kaufnebenkosten">
                Jetzt deine Kaufnebenkosten berechnen
                <ArrowRight className="size-4" strokeWidth={2.25} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Seitenrahmen>
  );
}
