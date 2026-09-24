import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LimitHinweis } from "@/components/tarif/limit-hinweis";
import { limitMeldung } from "@/lib/constants/tarife";
import { getTarifStatus } from "@/lib/data/tarif";
import { createClient } from "@/lib/supabase/server";
import { ImmobilienAssistent } from "./wizard";

export default async function ImmobilieNeuPage() {
  const supabase = await createClient();
  const tarifStatus = await getTarifStatus(supabase);

  // Bei erreichter Grenze gar nicht erst in den Assistenten einsteigen lassen.
  if (tarifStatus.immobilien.erreicht) {
    return (
      <div className="px-6 py-8">
        <h1 className="text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">Immobilie hinzufügen</h1>
        <div className="mt-6">
          <LimitHinweis text={limitMeldung(tarifStatus.tarif, "immobilien")} />
        </div>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/uebersicht">Zur Übersicht</Link>
        </Button>
      </div>
    );
  }

  return <ImmobilienAssistent />;
}
