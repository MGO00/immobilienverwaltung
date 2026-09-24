import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InteressentZeile } from "@/components/kaufpruefung/interessent-zeile";
import {
  INTERESSENT_STATUS,
  INTERESSENT_STATUS_LABEL,
  type InteressentStatus,
} from "@/lib/constants/interessent";
import { getInteressenten } from "@/lib/data/interessenten";
import { getTarif } from "@/lib/data/tarif";
import { LimitHinweis } from "@/components/tarif/limit-hinweis";
import { grenzeFuer, limitErreicht, limitMeldung } from "@/lib/constants/tarife";
import { formatDate } from "@/lib/format";
import { zaehleAktive, zaehleNachStatus } from "@/lib/interessent-regeln";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function KaufpruefungPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const filter = INTERESSENT_STATUS.find((s) => s === statusParam) ?? null;

  const supabase = await createClient();
  const [alle, tarif] = await Promise.all([getInteressenten(supabase), getTarif(supabase)]);
  const aktive = zaehleAktive(alle);
  const grenze = grenzeFuer(tarif, "aktiveInteressenten");
  const limitErreichtJetzt = limitErreicht(aktive, grenze);
  const proStatus = zaehleNachStatus(alle);
  const angezeigt = filter ? alle.filter((i) => i.status === filter) : alle;

  const reiter: { label: string; href: string; anzahl: number; aktiv: boolean }[] = [
    { label: "Alle", href: "/kaufpruefung", anzahl: alle.length, aktiv: filter === null },
    ...INTERESSENT_STATUS.map((s: InteressentStatus) => ({
      label: INTERESSENT_STATUS_LABEL[s],
      href: `/kaufpruefung?status=${s}`,
      anzahl: proStatus[s],
      aktiv: filter === s,
    })),
  ];

  return (
    <div className="px-6 py-8">
      <p className="text-xs font-semibold tracking-[0.06em] text-neutral-600 uppercase">Stand: {formatDate(new Date())}</p>
      <div className="mt-1 flex items-center justify-between gap-4">
        <h1 className="text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">Kaufprüfung</h1>
        {limitErreichtJetzt ? (
          <Button disabled aria-describedby="interessenten-limit">
            <Plus className="size-4" />
            Interessent hinzufügen
          </Button>
        ) : (
          <Button asChild>
            <Link href="/kaufpruefung/neu">
              <Plus className="size-4" />
              Interessent hinzufügen
            </Link>
          </Button>
        )}
      </div>
      {grenze !== null && (
        <p className="mt-2 text-sm text-neutral-600 tabular-nums">
          {aktive} von {grenze} aktiven Interessenten
        </p>
      )}
      {limitErreichtJetzt && (
        <div className="mt-3">
          <LimitHinweis id="interessenten-limit" text={limitMeldung(tarif, "aktiveInteressenten")} />
        </div>
      )}

      {alle.length === 0 ? (
        <div className="mt-8 max-w-[560px]">
          <h2 className="text-lg font-semibold">Prüfe dein erstes Kaufobjekt</h2>
          <p className="mt-2 text-sm text-neutral-700">
            Hier sammelst du Immobilien, die du erst kaufen möchtest, und verfolgst ihren Stand von
            „beobachtet“ bis „gekauft“. Für eine erste Einschätzung reichen Kaufpreis und erwartete Miete —
            alles andere kannst du später ergänzen.
          </p>
          <div className="mt-4 flex gap-3">
            <Button asChild>
              <Link href="/kaufpruefung/neu">Ersten Interessenten hinzufügen</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/rechner">Erst mal rechnen</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <nav aria-label="Status filtern" className="mt-6 flex gap-1 overflow-x-auto border-b border-border">
            {reiter.map((r) => (
              <Link
                key={r.label}
                href={r.href}
                aria-current={r.aktiv ? "page" : undefined}
                className={cn(
                  "-mb-px flex shrink-0 items-center gap-1.5 border-b-2 border-transparent px-3 py-2.5 text-sm font-semibold whitespace-nowrap text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  r.aktiv && "border-foreground text-foreground",
                )}
              >
                {r.label}
                <span className="text-xs font-normal tabular-nums">{r.anzahl}</span>
              </Link>
            ))}
          </nav>

          {angezeigt.length === 0 ? (
            <p className="mt-6 text-sm text-neutral-600">Keine Interessenten mit diesem Status.</p>
          ) : (
            <div className="mt-2">
              {angezeigt.map((interessent) => (
                <InteressentZeile key={interessent.id} interessent={interessent} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
