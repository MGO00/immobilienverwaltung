"use client";

import { useState } from "react";
import { Info, TriangleAlert } from "lucide-react";
import { ErgebnisUngueltig } from "@/components/rechner/ergebnis-ungueltig";
import { FeldHilfe } from "@/components/rechner/feld-hilfe";
import { useHeute } from "@/components/rechner/use-heute";
import { useZahlFeld } from "@/components/rechner/use-zahl-feld";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ZahlInput } from "@/components/ui/zahl-input";
import { fristenMietspiegel, mieterhoehungIndex, mieterhoehungMietspiegel } from "@/lib/calculators/mieterhoehung";
import { formatIsoDatum } from "@/lib/datum";
import { formatArea, formatCurrency, formatPercent } from "@/lib/format";
import {
  HILFE_INDEX,
  HILFE_VERGLEICHSMIETE,
  HINWEIS_LETZTE_ANPASSUNG,
  HINWEIS_LETZTE_ERHOEHUNG,
  HINWEIS_MIETE_VOR_DREI_JAHREN,
  HINWEIS_REFORM_INDEX,
  HINWEIS_STAFFELMIETE,
  HINWEISE_MIETSPIEGEL,
  PFLICHTHINWEIS,
  suchbegriffMietspiegel,
  warnungSperrjahr,
  warnungZugangZuFrueh,
} from "@/lib/rechner/mieterhoehung-texte";
import { REGEL } from "@/lib/validation/zahl";
import type { EinheitStatus } from "@/lib/validation/immobilie";
import { formatEingabe, formatEingabeOptional } from "@/lib/zahl";

export type MieterhoehungObjekt = {
  id: string;
  bezeichnung: string;
  ort: string | null;
  /** Nur beim Mehrfamilienhaus mit mehreren Einheiten. */
  mitAuswahl: boolean;
  einheiten: { id: string; name: string; flaecheQm: number | null; kaltmieteMonat: number; status: EinheitStatus }[];
  startEinheitId: string;
};

type Modus = "mietspiegel" | "index";

function Umschalter<T extends string | number>({
  label,
  optionen,
  wert,
  onWechsel,
}: {
  label: string;
  optionen: { wert: T; text: string }[];
  wert: T;
  onWechsel: (wert: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex w-fit border border-border">
      {optionen.map((option) => (
        <button
          key={String(option.wert)}
          type="button"
          aria-pressed={wert === option.wert}
          onClick={() => onWechsel(option.wert)}
          className={`border-border px-3 py-1.5 text-sm font-semibold not-last:border-r focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
            wert === option.wert ? "bg-neutral-900 text-neutral-100" : "text-neutral-700"
          }`}
        >
          {option.text}
        </button>
      ))}
    </div>
  );
}

function Zeile({ label, wert, fett = false }: { label: string; wert: string; fett?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 border-b border-border py-2 text-sm ${fett ? "font-semibold" : ""}`}
    >
      {/* Beschriftung darf umbrechen, der Wert nie ("660,00 €" bleibt zusammen). */}
      <span className={`min-w-0 ${fett ? "" : "text-neutral-600"}`}>{label}</span>
      <span className="shrink-0 text-right whitespace-nowrap tabular-nums">{wert}</span>
    </div>
  );
}

function Warnung({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 flex items-start gap-2 border border-foreground p-3 text-sm">
      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

function Hinweise({ punkte }: { punkte: readonly string[] }) {
  return (
    <ul className="mt-4 flex list-disc flex-col gap-1 pl-4 text-xs leading-[1.55] text-neutral-600">
      {punkte.map((punkt) => (
        <li key={punkt}>{punkt}</li>
      ))}
    </ul>
  );
}

const mitVorzeichen = (text: string, wert: number) => (wert > 0 ? `+${text}` : text);

export function MieterhoehungFormular({ objekt }: { objekt: MieterhoehungObjekt | null }) {
  const heute = useHeute();
  const startEinheit = objekt?.einheiten.find((e) => e.id === objekt.startEinheitId) ?? null;

  const [modus, setModus] = useState<Modus>("mietspiegel");
  const [einheitId, setEinheitId] = useState(objekt?.startEinheitId ?? "");
  const miete = useZahlFeld(
    startEinheit ? formatEingabe(startEinheit.kaltmieteMonat, { betrag: true }) : "",
    REGEL.rechnerBetrag,
  );
  const flaeche = useZahlFeld(formatEingabeOptional(startEinheit?.flaecheQm), REGEL.flaecheMiete);
  const vergleichsmiete = useZahlFeld("", REGEL.vergleichsmieteQm);
  const mieteVorDreiJahren = useZahlFeld("", REGEL.rechnerBetrag);
  const [kappung, setKappung] = useState<15 | 20>(15);
  const [letzteErhoehung, setLetzteErhoehung] = useState("");
  const indexAlt = useZahlFeld("", REGEL.verbraucherpreisindex);
  const indexNeu = useZahlFeld("", REGEL.verbraucherpreisindex);
  const [letzteAnpassung, setLetzteAnpassung] = useState("");
  // Leer = heute (erst im Browser bekannt, siehe useHeute).
  const [zugang, setZugang] = useState("");

  // Beim Wechsel der Einheit nur Miete und Fläche neu setzen; Modus, Kappungsgrenze
  // und Datumsfelder bleiben.
  function einheitWaehlen(id: string) {
    setEinheitId(id);
    const einheit = objekt?.einheiten.find((e) => e.id === id);
    if (!einheit) return;
    miete.setze(formatEingabe(einheit.kaltmieteMonat, { betrag: true }));
    flaeche.setze(formatEingabeOptional(einheit.flaecheQm));
  }

  // --- Modus Mietspiegel
  const mietspiegelUngueltig =
    miete.ungueltig || flaeche.ungueltig || vergleichsmiete.ungueltig || mieteVorDreiJahren.ungueltig;
  const mietspiegelFehlt = [
    miete.wert === null && "die aktuelle Miete",
    flaeche.wert === null && "die Wohnfläche",
    vergleichsmiete.wert === null && "die Vergleichsmiete",
    mieteVorDreiJahren.wert === null && "die Miete vor drei Jahren",
    !letzteErhoehung && "das Datum der letzten Erhöhung",
  ].filter((t): t is string => Boolean(t));
  const fristen = letzteErhoehung && heute ? fristenMietspiegel(letzteErhoehung, zugang || null, heute) : null;
  const mietspiegel =
    !mietspiegelUngueltig && mietspiegelFehlt.length === 0 && heute
      ? mieterhoehungMietspiegel({
          mieteAktuell: miete.wert!,
          flaecheQm: flaeche.wert!,
          vergleichsmieteQm: vergleichsmiete.wert!,
          mieteVorDreiJahren: mieteVorDreiJahren.wert!,
          kappungProzent: kappung,
          letzteErhoehungAb: letzteErhoehung,
          geplanterZugang: zugang || null,
          heute,
        })
      : null;

  // --- Modus Indexmiete
  const indexUngueltig = miete.ungueltig || indexAlt.ungueltig || indexNeu.ungueltig;
  const indexFehlt = [
    miete.wert === null && "die aktuelle Miete",
    indexAlt.wert === null && "den alten Index",
    indexNeu.wert === null && "den aktuellen Index",
    !letzteAnpassung && "das Datum der letzten Anpassung",
  ].filter((t): t is string => Boolean(t));
  const index =
    !indexUngueltig && indexFehlt.length === 0 && heute
      ? mieterhoehungIndex({
          mieteAktuell: miete.wert!,
          indexAlt: indexAlt.wert!,
          indexNeu: indexNeu.wert!,
          letzteAnpassungAb: letzteAnpassung,
          geplanterZugang: zugang || null,
          heute,
        })
      : null;

  const fehlt = modus === "mietspiegel" ? mietspiegelFehlt : indexFehlt;
  const ungueltig = modus === "mietspiegel" ? mietspiegelUngueltig : indexUngueltig;
  const einheit = objekt?.einheiten.find((e) => e.id === einheitId) ?? null;

  return (
    <>
      <div className="mt-4 flex max-w-[720px] items-start gap-2 border border-border p-3 text-sm text-neutral-800">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>{PFLICHTHINWEIS}</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col gap-4">
          <Umschalter
            label="Art der Mieterhöhung"
            optionen={[
              { wert: "mietspiegel" as Modus, text: "Mietspiegel" },
              { wert: "index" as Modus, text: "Indexmiete" },
            ]}
            wert={modus}
            onWechsel={setModus}
          />

          {objekt?.mitAuswahl && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="einheit">Einheit</Label>
              <Select value={einheitId} onValueChange={einheitWaehlen}>
                <SelectTrigger id="einheit" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {objekt.einheiten.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name} · {e.flaecheQm ? formatArea(e.flaecheQm) : "ohne Fläche"} ·{" "}
                      {formatCurrency(e.kaltmieteMonat, 0)} · {e.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {objekt && einheit && (
            <p className="text-xs text-neutral-600">
              Vorbefüllt mit Miete und Fläche von „{einheit.name}&rdquo;. Es wird nichts gespeichert.
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="miete">Aktuelle Nettokaltmiete pro Monat</Label>
            <ZahlInput id="miete" einheit="€" {...miete.feld} />
          </div>

          {modus === "mietspiegel" ? (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="flaeche">Wohnfläche</Label>
                <ZahlInput id="flaeche" einheit="m²" {...flaeche.feld} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="vergleichsmiete">Ortsübliche Vergleichsmiete</Label>
                <ZahlInput id="vergleichsmiete" einheit="€/m²" {...vergleichsmiete.feld} />
                <FeldHilfe
                  titel={HILFE_VERGLEICHSMIETE.titel}
                  punkte={HILFE_VERGLEICHSMIETE.punkte}
                  zusatz={objekt?.ort ? suchbegriffMietspiegel(objekt.ort) : null}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="miete-vor-drei-jahren">Nettokaltmiete vor drei Jahren</Label>
                <ZahlInput id="miete-vor-drei-jahren" einheit="€" {...mieteVorDreiJahren.feld} />
                <p className="text-xs text-neutral-600">
                  {fristen
                    ? `Maßgeblich ist die Miete am ${formatIsoDatum(fristen.stichtagKappung)}, drei Jahre vor dem Wirksamwerden der neuen Miete.`
                    : "Maßgeblich ist die Miete drei Jahre vor dem Wirksamwerden der neuen Miete."}{" "}
                  {HINWEIS_MIETE_VOR_DREI_JAHREN}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Kappungsgrenze</Label>
                <Umschalter
                  label="Kappungsgrenze"
                  optionen={[
                    { wert: 15 as const, text: "15 %" },
                    { wert: 20 as const, text: "20 %" },
                  ]}
                  wert={kappung}
                  onWechsel={setKappung}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="letzte-erhoehung">Letzte Erhöhung galt ab</Label>
                <Input
                  id="letzte-erhoehung"
                  type="date"
                  value={letzteErhoehung}
                  onChange={(e) => setLetzteErhoehung(e.target.value)}
                />
                <p className="text-xs text-neutral-600">{HINWEIS_LETZTE_ERHOEHUNG}</p>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="index-alt">Index alt</Label>
                  <ZahlInput id="index-alt" {...indexAlt.feld} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="index-neu">Index aktuell</Label>
                  <ZahlInput id="index-neu" {...indexNeu.feld} />
                </div>
              </div>
              <FeldHilfe titel={HILFE_INDEX.titel} punkte={HILFE_INDEX.punkte} />

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="letzte-anpassung">Letzte Anpassung galt ab</Label>
                <Input
                  id="letzte-anpassung"
                  type="date"
                  value={letzteAnpassung}
                  onChange={(e) => setLetzteAnpassung(e.target.value)}
                />
                <p className="text-xs text-neutral-600">{HINWEIS_LETZTE_ANPASSUNG}</p>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="zugang">
              {modus === "mietspiegel" ? "Geplanter Zugang des Verlangens" : "Geplanter Zugang der Erklärung"}
            </Label>
            <Input id="zugang" type="date" value={zugang || heute || ""} onChange={(e) => setZugang(e.target.value)} />
            <p className="text-xs text-neutral-600">Optional, Standard ist heute.</p>
          </div>

          <p className="text-xs text-neutral-600">{HINWEIS_STAFFELMIETE}</p>
        </div>

        <div className="h-fit border border-border p-4">
          <p className="text-sm font-semibold">Ergebnis</p>

          {ungueltig ? (
            <ErgebnisUngueltig zeilen={["Neue Miete", "Neue Miete ab"]} />
          ) : fehlt.length > 0 ? (
            <p className="mt-3 text-sm text-neutral-600">
              Trag {fehlt.join(", ").replace(/, ([^,]*)$/, " und $1")} ein, dann rechnet der Rechner.
            </p>
          ) : modus === "mietspiegel" && mietspiegel ? (
            <>
              {mietspiegel.zugangZuFrueh && (
                <Warnung>{warnungZugangZuFrueh(formatIsoDatum(mietspiegel.fruehesterZugang))}</Warnung>
              )}
              {mietspiegel.erhoehungMoeglich ? (
                <>
                  <p className="mt-3 text-xs text-neutral-600">Zulässige neue Miete</p>
                  <p className="mt-1 text-[30px] leading-[1.1] font-semibold tabular-nums">
                    {formatCurrency(mietspiegel.neueMiete)}
                  </p>
                  <p className="text-sm text-neutral-700 tabular-nums">
                    {mitVorzeichen(formatCurrency(mietspiegel.erhoehungEuro), mietspiegel.erhoehungEuro)} (
                    {mitVorzeichen(formatPercent(mietspiegel.erhoehungProzent), mietspiegel.erhoehungProzent)})
                  </p>
                  <p className="mt-3 text-sm font-semibold">
                    Es greift:{" "}
                    {mietspiegel.greifendeGrenze === "kappung"
                      ? `die Kappungsgrenze (${kappung} %)`
                      : "die ortsübliche Vergleichsmiete"}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-3 text-[20px] leading-[1.2] font-semibold">Derzeit keine Erhöhung möglich</p>
                  <p className="mt-1 text-sm text-neutral-700">
                    {mietspiegel.greifendeGrenze === "vergleichsmiete"
                      ? `Die aktuelle Miete liegt bereits auf oder über der ortsüblichen Vergleichsmiete (${formatCurrency(mietspiegel.grenzeVergleichsmiete)}).`
                      : `Die Kappungsgrenze ist ausgeschöpft: In drei Jahren darf die Miete höchstens um ${kappung} % steigen, also bis ${formatCurrency(mietspiegel.grenzeKappung)}.`}
                  </p>
                </>
              )}

              <div className="mt-4">
                <Zeile
                  label={`Grenze Vergleichsmiete (${formatCurrency(vergleichsmiete.wert!)}/m² × ${formatArea(flaeche.wert!)})`}
                  wert={formatCurrency(mietspiegel.grenzeVergleichsmiete)}
                />
                <Zeile
                  label={`Grenze Kappung (${formatCurrency(mieteVorDreiJahren.wert!)} + ${kappung} %)`}
                  wert={formatCurrency(mietspiegel.grenzeKappung)}
                />
                <Zeile
                  label="Miete pro m² vorher → nachher"
                  wert={`${formatCurrency(mietspiegel.mieteQmVorher)} → ${formatCurrency(mietspiegel.mieteQmNachher)}`}
                />
                <Zeile label="Frühester Zugang des Verlangens" wert={formatIsoDatum(mietspiegel.fruehesterZugang)} />
                {mietspiegel.erhoehungMoeglich && (
                  <Zeile label="Neue Miete ab" wert={formatIsoDatum(mietspiegel.wirksamAb)} fett />
                )}
              </div>

              <Hinweise punkte={HINWEISE_MIETSPIEGEL} />
            </>
          ) : modus === "index" && index ? (
            <>
              <p className="mt-3 text-xs text-neutral-600">Neue Miete</p>
              <p className="mt-1 text-[30px] leading-[1.1] font-semibold tabular-nums">
                {formatCurrency(index.neueMiete)}
              </p>
              <p className="text-sm text-neutral-700 tabular-nums">
                {mitVorzeichen(formatCurrency(index.aenderungEuro), index.aenderungEuro)} (
                {mitVorzeichen(formatPercent(index.aenderungProzent), index.aenderungProzent)})
                {index.aenderungEuro < 0 && " — der Index ist gesunken, die Miete sinkt."}
              </p>
              <div className="mt-4">
                <Zeile label="Zugang der Erklärung" wert={formatIsoDatum(index.zugang)} />
                <Zeile label="Neue Miete ab" wert={formatIsoDatum(index.wirksamAb)} fett />
              </div>
              {index.sperrjahrGreift && (
                <>
                  <p className="mt-3 text-sm text-neutral-700">
                    Nach dem Zugang wäre es der {formatIsoDatum(index.wirksamNachZugang)}; weil die Miete mindestens
                    ein Jahr unverändert bleiben muss, gilt die neue Miete erst ab {formatIsoDatum(index.wirksamAb)}.
                  </p>
                  <Warnung>{warnungSperrjahr(formatIsoDatum(index.sichererZugangAb))}</Warnung>
                </>
              )}
              <Hinweise punkte={[HINWEIS_REFORM_INDEX]} />
            </>
          ) : (
            <p className="mt-3 text-sm text-neutral-600">Einen Moment …</p>
          )}
        </div>
      </div>
    </>
  );
}
