import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InteressentFormular } from "@/components/kaufpruefung/interessent-formular";
import { LimitHinweis } from "@/components/tarif/limit-hinweis";
import { limitMeldung } from "@/lib/constants/tarife";
import { getTarifStatus } from "@/lib/data/tarif";
import { createClient } from "@/lib/supabase/server";
import { interessentAnlegen } from "../actions";

export default async function InteressentNeuPage() {
  const supabase = await createClient();
  const tarifStatus = await getTarifStatus(supabase);

  // Bei erreichter Grenze gar nicht erst ins Formular einsteigen lassen.
  if (tarifStatus.aktiveInteressenten.erreicht) {
    return (
      <div className="px-6 py-8">
        <div className="mx-auto max-w-[720px]">
          <h1 className="text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">Interessent hinzufügen</h1>
          <div className="mt-6">
            <LimitHinweis text={limitMeldung(tarifStatus.tarif, "aktiveInteressenten")} />
          </div>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/kaufpruefung">Zur Kaufprüfung</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <InteressentFormular
        initial={null}
        titel="Interessent hinzufügen"
        speichernLabel="Speichern"
        abbrechenHref="/kaufpruefung"
        onSpeichern={interessentAnlegen}
      />
    </div>
  );
}
