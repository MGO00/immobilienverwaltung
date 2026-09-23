import { notFound } from "next/navigation";
import { RechnerKarten } from "@/components/rechner/rechner-karten";
import { getImmobilie } from "@/lib/data/immobilie-detail";
import { createClient } from "@/lib/supabase/server";

export default async function RechnerTabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const immobilie = await getImmobilie(supabase, id);
  if (!immobilie) notFound();

  return (
    <div>
      <p className="max-w-[560px] text-sm text-neutral-700">
        Die Rechner sind mit den Daten dieser Immobilie vorbefüllt.
      </p>
      <RechnerKarten immobilieId={id} />
    </div>
  );
}
