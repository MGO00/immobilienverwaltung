import { notFound } from "next/navigation";
import { InteressentFormular } from "@/components/kaufpruefung/interessent-formular";
import { getInteressent } from "@/lib/data/interessenten";
import { createClient } from "@/lib/supabase/server";
import { interessentAktualisieren } from "../../actions";

export default async function InteressentBearbeitenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const interessent = await getInteressent(supabase, id);
  if (!interessent) notFound();

  return (
    <div className="px-6 py-8">
      <InteressentFormular
        initial={interessent}
        titel="Interessent bearbeiten"
        speichernLabel="Speichern"
        abbrechenHref={`/kaufpruefung/${interessent.id}`}
        onSpeichern={interessentAktualisieren.bind(null, interessent.id)}
      />
    </div>
  );
}
