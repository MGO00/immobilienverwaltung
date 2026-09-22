import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OBJEKTART_LABEL } from "@/lib/constants/objektart";
import { getImmobilie } from "@/lib/data/immobilie-detail";
import { createClient } from "@/lib/supabase/server";
import { DetailTabs } from "./detail-tabs";

export default async function ImmobilieDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const immobilie = await getImmobilie(supabase, id);

  if (!immobilie) notFound();

  const adresse = [immobilie.strasseHausnummer, [immobilie.plz, immobilie.ort].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="px-6 py-8">
      <Link
        href="/uebersicht"
        className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.06em] text-foreground uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowLeft className="size-3.5" />
        Alle Immobilien
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <Badge variant="outline" className="text-neutral-700">
            {OBJEKTART_LABEL[immobilie.art]}
          </Badge>
          <h1 className="mt-2 text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">
            {immobilie.bezeichnung}
          </h1>
          {adresse && <p className="mt-1 text-sm text-neutral-600">{adresse}</p>}
        </div>
        <Button asChild variant="outline">
          <Link href={`/immobilien/${id}/bearbeiten`}>Bearbeiten</Link>
        </Button>
      </div>

      <DetailTabs id={id} />

      <div className="mt-6">{children}</div>
    </div>
  );
}
