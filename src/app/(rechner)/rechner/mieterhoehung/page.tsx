import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getEinheiten, getImmobilie } from "@/lib/data/immobilie-detail";
import { createClient } from "@/lib/supabase/server";
import { rechnerMetadata } from "@/lib/seo/rechner";
import { MieterhoehungFormular, type MieterhoehungObjekt } from "./formular";

export const metadata = rechnerMetadata("mieterhoehung");

export default async function MieterhoehungPage({
  searchParams,
}: {
  searchParams: Promise<{ immobilie?: string; einheit?: string }>;
}) {
  const { immobilie: immobilieParam, einheit: einheitParam } = await searchParams;
  const supabase = await createClient();
  // Der Objektbezug gilt nur für angemeldete Nutzer. Zusätzlich zu den
  // Zugriffsregeln (RLS) wird bei fehlender Anmeldung gar nicht erst abgefragt.
  // ?interessent= gibt es hier bewusst nicht (kein Mietvertrag, siehe RECHNER_LISTE).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const immobilieId = user ? immobilieParam : undefined;

  let objekt: MieterhoehungObjekt | null = null;
  if (immobilieId) {
    const [immobilie, einheiten] = await Promise.all([
      getImmobilie(supabase, immobilieId),
      getEinheiten(supabase, immobilieId),
    ]);
    if (immobilie && einheiten.length > 0) {
      // &einheit= nur, wenn die Einheit zu dieser Immobilie gehört (getEinheiten liefert
      // nur deren Einheiten); sonst die erste vermietete, sonst die erste.
      const start =
        einheiten.find((e) => e.id === einheitParam) ??
        einheiten.find((e) => e.status === "vermietet") ??
        einheiten[0];
      objekt = {
        id: immobilie.id,
        bezeichnung: immobilie.bezeichnung,
        ort: immobilie.ort,
        mitAuswahl: immobilie.art === "mehrfamilienhaus" && einheiten.length > 1,
        einheiten: einheiten.map((e) => ({
          id: e.id,
          name: e.name,
          flaecheQm: e.flaecheQm,
          kaltmieteMonat: e.kaltmieteMonat,
          status: e.status,
        })),
        startEinheitId: start.id,
      };
    }
  }

  return (
    <div className="px-6 py-8">
      <Link
        href={objekt ? `/immobilien/${objekt.id}/rechner` : "/rechner"}
        className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.06em] text-foreground uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowLeft className="size-3.5" />
        {objekt?.bezeichnung ?? "Alle Rechner"}
      </Link>
      <h1 className="mt-3 text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">Mieterhöhung</h1>

      <MieterhoehungFormular objekt={objekt} />
    </div>
  );
}
