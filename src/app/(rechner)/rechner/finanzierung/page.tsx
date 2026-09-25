import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getImmobilie } from "@/lib/data/immobilie-detail";
import { getInteressent } from "@/lib/data/interessenten";
import { createClient } from "@/lib/supabase/server";
import { FinanzierungFormular } from "./formular";
import { rechnerMetadata } from "@/lib/seo/rechner";

function zinsbindungJahre(kaufdatum: string | null, zinsbindungBis: string | null): string {
  if (!kaufdatum || !zinsbindungBis) return "10";
  const jahre = Math.round(
    (new Date(zinsbindungBis).getTime() - new Date(kaufdatum).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );
  // 1–40 Jahre wie im Eingabefeld (REGEL.zinsbindungJahre), sonst der Standard.
  return jahre > 0 && jahre <= 40 ? String(jahre) : "10";
}

export const metadata = rechnerMetadata("finanzierung");

export default async function FinanzierungPage({
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

  const interessent = user && !immobilie && interessentParam ? await getInteressent(supabase, interessentParam) : null;

  const vorbefuellung = immobilie
    ? {
        kaufpreis: immobilie.kaufpreis,
        kaufnebenkostenBetrag: immobilie.kaufnebenkostenBetrag,
        eigenkapital:
          immobilie.darlehenBetrag !== null
            ? Math.max(0, immobilie.kaufpreis + (immobilie.kaufnebenkostenBetrag ?? 0) - immobilie.darlehenBetrag)
            : null,
        sollzinsProzent: immobilie.sollzinsProzent,
        tilgungProzent: immobilie.tilgungProzent,
        zinsbindungJahre: zinsbindungJahre(immobilie.kaufdatum, immobilie.zinsbindungBis),
        startDatum: immobilie.kaufdatum,
      }
    : interessent
      ? {
          kaufpreis: interessent.kaufpreis,
          kaufnebenkostenBetrag: null,
          eigenkapital:
            interessent.darlehenBetrag !== null ? Math.max(0, interessent.kaufpreis - interessent.darlehenBetrag) : null,
          sollzinsProzent: interessent.sollzinsProzent,
          tilgungProzent: interessent.tilgungProzent,
          zinsbindungJahre: "10",
          startDatum: null,
        }
      : null;

  return (
    <div className="px-6 py-8">
      <Link
        href={immobilie ? `/immobilien/${immobilie.id}/rechner` : interessent ? `/kaufpruefung/${interessent.id}` : "/rechner"}
        className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.06em] text-foreground uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowLeft className="size-3.5" />
        {immobilie ? immobilie.bezeichnung : interessent ? interessent.bezeichnung : "Alle Rechner"}
      </Link>
      <h1 className="mt-3 text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">Finanzierung</h1>
      {!immobilie && !interessent && (
        <p className="mt-2 max-w-[560px] text-sm text-neutral-600">
          Ohne Objektbezug wird als Startdatum des Tilgungsplans standardmäßig heute angenommen.
        </p>
      )}

      <FinanzierungFormular vorbefuellung={vorbefuellung} immobilieId={immobilie?.id ?? null} interessentId={interessent?.id ?? null} />
    </div>
  );
}
