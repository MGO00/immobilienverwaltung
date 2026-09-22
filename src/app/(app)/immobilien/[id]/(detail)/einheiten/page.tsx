import { notFound } from "next/navigation";
import { getEinheiten, getImmobilie } from "@/lib/data/immobilie-detail";
import { createClient } from "@/lib/supabase/server";
import { EinheitenTab } from "./einheiten-tab";

export default async function EinheitenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [immobilie, einheiten] = await Promise.all([getImmobilie(supabase, id), getEinheiten(supabase, id)]);

  if (!immobilie) notFound();

  return <EinheitenTab propertyId={id} art={immobilie.art} einheiten={einheiten} />;
}
