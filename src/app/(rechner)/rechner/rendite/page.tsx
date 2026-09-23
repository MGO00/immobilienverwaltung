import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getEinheiten, getImmobilie, getLaufendeKosten } from "@/lib/data/immobilie-detail";
import { kaltmieteMonatVermietet } from "@/lib/calculators/immobilie";
import { createClient } from "@/lib/supabase/server";
import { RenditeFormular } from "./formular";

export default async function RenditePage({
  searchParams,
}: {
  searchParams: Promise<{ immobilie?: string }>;
}) {
  const { immobilie: immobilieId } = await searchParams;
  const supabase = await createClient();

  let vorbefuellung = null;
  let objektName: string | null = null;
  if (immobilieId) {
    const [immobilie, einheiten, kosten] = await Promise.all([
      getImmobilie(supabase, immobilieId),
      getEinheiten(supabase, immobilieId),
      getLaufendeKosten(supabase, immobilieId),
    ]);
    if (immobilie) {
      objektName = immobilie.bezeichnung;
      vorbefuellung = {
        kaufpreis: immobilie.kaufpreis,
        kaufnebenkostenBetrag: immobilie.kaufnebenkostenBetrag,
        kaltmieteMonat: kaltmieteMonatVermietet(einheiten),
        kostenMonat: kosten.reduce((s, k) => s + k.betragMonat, 0),
      };
    }
  }

  return (
    <div className="px-6 py-8">
      <Link
        href={immobilieId && objektName ? `/immobilien/${immobilieId}/rechner` : "/rechner"}
        className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.06em] text-foreground uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowLeft className="size-3.5" />
        {objektName ?? "Alle Rechner"}
      </Link>
      <h1 className="mt-3 text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">Rendite</h1>

      <RenditeFormular vorbefuellung={vorbefuellung} immobilieId={immobilieId ?? null} />
    </div>
  );
}
