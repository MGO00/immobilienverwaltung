import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getImmobilie } from "@/lib/data/immobilie-detail";
import { getInteressent } from "@/lib/data/interessenten";
import { createClient } from "@/lib/supabase/server";
import { KaufnebenkostenFormular } from "./formular";
import { rechnerMetadata } from "@/lib/seo/rechner";

export const metadata = rechnerMetadata("kaufnebenkosten");

export default async function KaufnebenkostenPage({
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
  const immobilie = immobilieId ? await getImmobilie(supabase, immobilieId) : null;
  // Ein Interessent aus der Kaufprüfung dient nur zur Vorbefüllung (ohne Übernehmen-Button).
  const interessent = user && !immobilie && interessentParam ? await getInteressent(supabase, interessentParam) : null;

  return (
    <div className="px-6 py-8">
      <Link
        href={immobilie ? `/immobilien/${immobilie.id}/rechner` : interessent ? `/kaufpruefung/${interessent.id}` : "/rechner"}
        className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.06em] text-foreground uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowLeft className="size-3.5" />
        {immobilie ? immobilie.bezeichnung : interessent ? interessent.bezeichnung : "Alle Rechner"}
      </Link>
      <h1 className="mt-3 text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">Kaufnebenkosten</h1>

      <KaufnebenkostenFormular
        interessent={interessent ? { kaufpreis: interessent.kaufpreis, bundesland: interessent.bundesland } : null}
        immobilie={
          immobilie
            ? { id: immobilie.id, bezeichnung: immobilie.bezeichnung, kaufpreis: immobilie.kaufpreis, bundesland: immobilie.bundesland }
            : null
        }
      />
    </div>
  );
}
