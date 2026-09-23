import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getEinheiten, getImmobilie, getLaufendeKosten } from "@/lib/data/immobilie-detail";
import { kaltmieteMonatVermietet } from "@/lib/calculators/immobilie";
import { getInteressent } from "@/lib/data/interessenten";
import { createClient } from "@/lib/supabase/server";
import { RenditeFormular } from "./formular";
import { rechnerMetadata } from "@/lib/seo/rechner";

export const metadata = rechnerMetadata("rendite");

export default async function RenditePage({
  searchParams,
}: {
  searchParams: Promise<{ immobilie?: string; interessent?: string }>;
}) {
  const { immobilie: immobilieParam, interessent: interessentParam } = await searchParams;
  const supabase = await createClient();
  // Der Objektbezug gilt nur für angemeldete Nutzer. Zusätzlich zu den
  // Zugriffsregeln (RLS) wird bei fehlender Anmeldung gar nicht erst abgefragt.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const immobilieId = user ? immobilieParam : undefined;

  let vorbefuellung = null;
  let objektName: string | null = null;
  let objektId: string | null = null;
  if (immobilieId) {
    const [immobilie, einheiten, kosten] = await Promise.all([
      getImmobilie(supabase, immobilieId),
      getEinheiten(supabase, immobilieId),
      getLaufendeKosten(supabase, immobilieId),
    ]);
    if (immobilie) {
      objektName = immobilie.bezeichnung;
      objektId = immobilie.id;
      vorbefuellung = {
        kaufpreis: immobilie.kaufpreis,
        kaufnebenkostenBetrag: immobilie.kaufnebenkostenBetrag,
        kaltmieteMonat: kaltmieteMonatVermietet(einheiten),
        kostenMonat: kosten.reduce((s, k) => s + k.betragMonat, 0),
      };
    }
  }

  // Interessent aus der Kaufprüfung: Kaufpreis und erwartete Miete vorbefüllen,
  // Kaufnebenkosten und laufende Kosten sind dort nicht erfasst.
  let interessentId: string | null = null;
  if (user && !objektId && interessentParam) {
    const interessent = await getInteressent(supabase, interessentParam);
    if (interessent) {
      objektName = interessent.bezeichnung;
      interessentId = interessent.id;
      vorbefuellung = {
        kaufpreis: interessent.kaufpreis,
        kaufnebenkostenBetrag: null,
        kaltmieteMonat: interessent.kaltmieteMonat ?? 0,
        kostenMonat: 0,
      };
    }
  }

  return (
    <div className="px-6 py-8">
      <Link
        href={objektId && objektName ? `/immobilien/${objektId}/rechner` : interessentId ? `/kaufpruefung/${interessentId}` : "/rechner"}
        className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.06em] text-foreground uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowLeft className="size-3.5" />
        {objektName ?? "Alle Rechner"}
      </Link>
      <h1 className="mt-3 text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">Rendite</h1>

      <RenditeFormular vorbefuellung={vorbefuellung} immobilieId={objektId} interessentId={interessentId} />
    </div>
  );
}
