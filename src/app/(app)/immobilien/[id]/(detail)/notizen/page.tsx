import { notFound } from "next/navigation";
import { getImmobilie, getNotizen } from "@/lib/data/immobilie-detail";
import { createClient } from "@/lib/supabase/server";
import { NotizenTab } from "./notizen-tab";

export default async function NotizenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [immobilie, notizen] = await Promise.all([getImmobilie(supabase, id), getNotizen(supabase, id)]);
  if (!immobilie) notFound();

  return <NotizenTab propertyId={id} notizen={notizen} />;
}
