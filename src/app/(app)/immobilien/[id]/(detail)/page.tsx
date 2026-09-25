import { notFound } from "next/navigation";
import {
  annuitaetMonat,
  bruttorendite,
  cashflowMonat,
  jahreskaltmiete,
  kaufpreisfaktor,
  kaltmieteMonatVermietet,
  wohnflaecheGesamt,
} from "@/lib/calculators/immobilie";
import { OBJEKTART_LABEL } from "@/lib/constants/objektart";
import { getEinheiten, getImmobilie, getLaufendeKosten } from "@/lib/data/immobilie-detail";
import { formatArea, formatCurrency, formatDezimal, formatPercent } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function ImmobilieUebersichtTab({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [immobilie, einheiten, kosten] = await Promise.all([
    getImmobilie(supabase, id),
    getEinheiten(supabase, id),
    getLaufendeKosten(supabase, id),
  ]);

  if (!immobilie) notFound();

  const kaltmieteMonat = kaltmieteMonatVermietet(einheiten);
  const jahreskaltmieteWert = jahreskaltmiete(einheiten);
  const laufendeKostenMonat = kosten.reduce((s, k) => s + k.betragMonat, 0);
  const annuitaet = annuitaetMonat(immobilie.darlehenBetrag, immobilie.sollzinsProzent, immobilie.tilgungProzent);
  const cashflow = cashflowMonat(kaltmieteMonat, annuitaet, laufendeKostenMonat);
  const rendite = bruttorendite(jahreskaltmieteWert, immobilie.kaufpreis);
  const faktor = kaufpreisfaktor(immobilie.kaufpreis, jahreskaltmieteWert);
  const wohnflaeche = immobilie.art === "mehrfamilienhaus" ? wohnflaecheGesamt(einheiten) : einheiten[0]?.flaecheQm ?? null;

  const leerZahl = einheiten.filter((e) => e.status === "leer").length;
  const nutzung =
    leerZahl === 0 ? "vermietet" : leerZahl === einheiten.length ? "leer" : "teilweise vermietet";

  const kpis = [
    { label: "Kaufpreis", wert: formatCurrency(immobilie.kaufpreis, 0), hinweis: "ohne Nebenkosten" },
    {
      label: "Kaltmiete / Monat",
      wert: formatCurrency(kaltmieteMonat, 0),
      hinweis: einheiten.length === 1 ? "eine Einheit" : `${einheiten.length} Einheiten`,
    },
    {
      label: "Cashflow / Monat",
      wert: formatCurrency(cashflow, 0),
      hinweis: annuitaet === null ? "ohne Finanzierung" : "nach Zins und Tilgung",
    },
    {
      label: "Bruttorendite",
      wert: rendite !== null ? formatPercent(rendite * 100, 1) : "—",
      hinweis: "Jahresmiete ÷ Kaufpreis",
    },
    {
      label: "Kaufpreisfaktor",
      wert: faktor !== null ? formatDezimal(faktor, 1) : "—",
      hinweis: "Jahresmieten",
    },
  ];

  const stammdaten: { label: string; wert: string }[] = [
    { label: "Objektart", wert: OBJEKTART_LABEL[immobilie.art] },
    {
      label: "Adresse",
      wert:
        [immobilie.strasseHausnummer, [immobilie.plz, immobilie.ort].filter(Boolean).join(" ")]
          .filter(Boolean)
          .join(", ") || "—",
    },
    { label: "Baujahr", wert: immobilie.baujahr ? String(immobilie.baujahr) : "—" },
    {
      label: immobilie.art === "mehrfamilienhaus" ? "Wohnfläche gesamt" : "Wohnfläche",
      wert: wohnflaeche ? formatArea(wohnflaeche) : "—",
    },
    ...(immobilie.grundstuecksflaecheQm
      ? [{ label: "Grundstücksfläche", wert: formatArea(immobilie.grundstuecksflaecheQm) }]
      : []),
    { label: "Einheiten", wert: String(einheiten.length) },
    { label: "Nutzung", wert: nutzung },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {kpis.map((kpi) => (
          <div key={kpi.label}>
            <p className="text-xs text-neutral-600">{kpi.label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{kpi.wert}</p>
            <p className="mt-0.5 text-xs text-neutral-600">{kpi.hinweis}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <div
          className="flex h-[188px] w-[280px] items-center justify-center overflow-hidden bg-neutral-100"
          style={{ borderRadius: 10 }}
        >
          {immobilie.fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={immobilie.fotoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="text-neutral-400"
            >
              <rect x="3" y="4" width="18" height="16" rx="1" />
              <circle cx="8.5" cy="9.5" r="1.5" />
              <path d="M21 16l-5-5-4 4-3-3-6 6" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">Stammdaten</p>
          <dl className="mt-2 flex flex-col gap-2 text-sm">
            {stammdaten.map((zeile) => (
              <div key={zeile.label} className="flex justify-between border-b border-border pb-2">
                <dt className="text-neutral-600">{zeile.label}</dt>
                <dd>{zeile.wert}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
