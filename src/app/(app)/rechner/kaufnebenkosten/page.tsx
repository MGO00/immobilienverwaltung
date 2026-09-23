import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getImmobilie } from "@/lib/data/immobilie-detail";
import { createClient } from "@/lib/supabase/server";
import { KaufnebenkostenFormular } from "./formular";

export default async function KaufnebenkostenPage({
  searchParams,
}: {
  searchParams: Promise<{ immobilie?: string }>;
}) {
  const { immobilie: immobilieId } = await searchParams;
  const supabase = await createClient();
  const immobilie = immobilieId ? await getImmobilie(supabase, immobilieId) : null;

  return (
    <div className="px-6 py-8">
      <Link
        href={immobilie ? `/immobilien/${immobilie.id}/rechner` : "/rechner"}
        className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.06em] text-foreground uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowLeft className="size-3.5" />
        {immobilie ? immobilie.bezeichnung : "Alle Rechner"}
      </Link>
      <h1 className="mt-3 text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">Kaufnebenkosten</h1>

      <KaufnebenkostenFormular
        immobilie={
          immobilie
            ? { id: immobilie.id, bezeichnung: immobilie.bezeichnung, kaufpreis: immobilie.kaufpreis, bundesland: immobilie.bundesland }
            : null
        }
      />
    </div>
  );
}
