import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { annuitaetMonat, kaltmieteMonatVermietet } from "@/lib/calculators/immobilie";
import { getEinheiten, getImmobilie, getLaufendeKosten } from "@/lib/data/immobilie-detail";
import { getInteressent } from "@/lib/data/interessenten";
import { createClient } from "@/lib/supabase/server";
import { CashflowFormular } from "./formular";
import { rechnerMetadata } from "@/lib/seo/rechner";
import { formatEingabe } from "@/lib/zahl";

// ?rate= kommt vom Finanzierungs-Rechner in Maschinenschreibweise ("718.75", siehe
// toFixed(2) dort). Für das Eingabefeld in deutsche Schreibweise umwandeln; alles
// andere wird ignoriert statt als unverständlicher Text im Feld zu landen.
function rateAusUrl(rate: string | undefined): string {
  return rate && /^\d+(\.\d+)?$/.test(rate) ? formatEingabe(Number(rate)) : "";
}

export const metadata = rechnerMetadata("cashflow");

export default async function CashflowPage({
  searchParams,
}: {
  searchParams: Promise<{ immobilie?: string; interessent?: string; rate?: string }>;
}) {
  const { immobilie: immobilieParam, interessent: interessentParam, rate: rateParam } = await searchParams;
  const supabase = await createClient();
  // Der Objektbezug gilt nur für angemeldete Nutzer. Zusätzlich zu den
  // Zugriffsregeln (RLS) wird bei fehlender Anmeldung gar nicht erst abgefragt.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const immobilieId = user ? immobilieParam : undefined;

  let objektName: string | null = null;
  let initial = {
    kaltmieteMonat: "",
    kostenMonat: "",
    ruecklageMonat: "",
    verwaltungMonat: "",
    rateMonat: rateAusUrl(rateParam),
  };
  let darlehenKontext: { darlehenBetrag: number | null; sollzinsProzent: number | null } | null = null;

  if (immobilieId) {
    const [immobilie, einheiten, kosten] = await Promise.all([
      getImmobilie(supabase, immobilieId),
      getEinheiten(supabase, immobilieId),
      getLaufendeKosten(supabase, immobilieId),
    ]);
    if (immobilie) {
      objektName = immobilie.bezeichnung;
      const summeNachTyp = (typen: string[]) =>
        kosten.filter((k) => typen.includes(k.typ)).reduce((s, k) => s + k.betragMonat, 0);
      const rate = annuitaetMonat(immobilie.darlehenBetrag, immobilie.sollzinsProzent, immobilie.tilgungProzent);
      initial = {
        kaltmieteMonat: formatEingabe(kaltmieteMonatVermietet(einheiten)),
        kostenMonat: formatEingabe(summeNachTyp(["hausgeld", "grundsteuer", "versicherung", "instandhaltung"])),
        ruecklageMonat: formatEingabe(summeNachTyp(["instandhaltungsruecklage"])),
        verwaltungMonat: formatEingabe(summeNachTyp(["verwaltung_sonstiges"])),
        rateMonat: rate !== null ? formatEingabe(rate) : "",
      };
      darlehenKontext = { darlehenBetrag: immobilie.darlehenBetrag, sollzinsProzent: immobilie.sollzinsProzent };
    }
  }

  // Interessent aus der Kaufprüfung: erwartete Miete und geplante Rate vorbefüllen.
  // Laufende Kosten sind dort nicht erfasst; es gibt keine echten Einheiten, deshalb
  // bleibt das Leerstand-Feld sichtbar.
  let interessentId: string | null = null;
  if (user && !immobilieId && interessentParam) {
    const interessent = await getInteressent(supabase, interessentParam);
    if (interessent) {
      objektName = interessent.bezeichnung;
      interessentId = interessent.id;
      const rate = annuitaetMonat(interessent.darlehenBetrag, interessent.sollzinsProzent, interessent.tilgungProzent);
      initial = {
        ...initial,
        kaltmieteMonat: interessent.kaltmieteMonat !== null ? formatEingabe(interessent.kaltmieteMonat) : "",
        rateMonat: rate !== null ? formatEingabe(rate) : "",
      };
      darlehenKontext = { darlehenBetrag: interessent.darlehenBetrag, sollzinsProzent: interessent.sollzinsProzent };
    }
  }

  return (
    <div className="px-6 py-8">
      <Link
        href={immobilieId && objektName ? `/immobilien/${immobilieId}/rechner` : interessentId ? `/kaufpruefung/${interessentId}` : "/rechner"}
        className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.06em] text-foreground uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowLeft className="size-3.5" />
        {objektName ?? "Alle Rechner"}
      </Link>
      <h1 className="mt-3 text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">Cashflow</h1>

      <CashflowFormular
        initial={initial}
        darlehenKontext={darlehenKontext}
        mitLeerstandFeld={!immobilieId || objektName === null}
      />
    </div>
  );
}
