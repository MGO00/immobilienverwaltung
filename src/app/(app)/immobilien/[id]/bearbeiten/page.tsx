import { notFound } from "next/navigation";
import { getEinheiten, getImmobilie, getLaufendeKosten } from "@/lib/data/immobilie-detail";
import { createClient } from "@/lib/supabase/server";
import { BearbeitenForm } from "./bearbeiten-form";

export default async function BearbeitenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [immobilie, einheiten, laufendeKosten] = await Promise.all([
    getImmobilie(supabase, id),
    getEinheiten(supabase, id),
    getLaufendeKosten(supabase, id),
  ]);
  if (!immobilie) notFound();

  const einzigeEinheit = immobilie.art === "mehrfamilienhaus" ? null : (einheiten[0] ?? null);

  return <BearbeitenForm immobilie={immobilie} einheit={einzigeEinheit} laufendeKosten={laufendeKosten} />;
}
