"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BUNDESLAENDER, bundeslandLabel } from "@/lib/constants/steuersaetze";
import type { Interessent } from "@/lib/data/interessenten";
import type { InteressentFormState } from "@/app/(app)/kaufpruefung/actions";
import type { InteressentEingabe } from "@/lib/validation/interessent";
import type { ObjektArt } from "@/lib/validation/immobilie";

const OBJEKTARTEN: { wert: ObjektArt; label: string; hinweis: string }[] = [
  { wert: "eigentumswohnung", label: "Eigentumswohnung", hinweis: "Eine Wohnung" },
  { wert: "einfamilienhaus", label: "Einfamilien-/Doppelhaus", hinweis: "Ein Haus" },
  { wert: "mehrfamilienhaus", label: "Mehrfamilienhaus", hinweis: "Mehrere Einheiten" },
];

function zuZahl(wert: string): number | null {
  if (wert.trim() === "") return null;
  const zahl = Number(wert.replace(",", "."));
  return Number.isFinite(zahl) ? zahl : null;
}

const text = (wert: number | null) => (wert === null ? "" : String(wert));

// Ein einstufiges Formular (kein Assistent) für Anlegen und Bearbeiten: eine
// grobe erste Einschätzung braucht nur wenige Angaben. Status gibt es hier
// nicht — neue Interessenten starten immer bei "beobachtet".
export function InteressentFormular({
  initial,
  titel,
  speichernLabel,
  abbrechenHref,
  onSpeichern,
}: {
  initial: Interessent | null;
  titel: string;
  speichernLabel: string;
  abbrechenHref: string;
  onSpeichern: (eingabe: InteressentEingabe) => Promise<InteressentFormState>;
}) {
  const [art, setArt] = useState<ObjektArt | null>(initial?.art ?? null);
  const [bezeichnung, setBezeichnung] = useState(initial?.bezeichnung ?? "");
  const [strasse, setStrasse] = useState(initial?.strasseHausnummer ?? "");
  const [plz, setPlz] = useState(initial?.plz ?? "");
  const [ort, setOrt] = useState(initial?.ort ?? "");
  const [bundesland, setBundesland] = useState(initial?.bundesland ?? "");
  const [kaufpreis, setKaufpreis] = useState(text(initial?.kaufpreis ?? null));
  const [flaeche, setFlaeche] = useState(text(initial?.flaecheQm ?? null));
  const [miete, setMiete] = useState(text(initial?.kaltmieteMonat ?? null));
  const [darlehen, setDarlehen] = useState(text(initial?.darlehenBetrag ?? null));
  const [zins, setZins] = useState(text(initial?.sollzinsProzent ?? null));
  const [tilgung, setTilgung] = useState(text(initial?.tilgungProzent ?? null));
  const [inserat, setInserat] = useState(initial?.inseratUrl ?? "");
  const hatFinanzierung = Boolean(initial?.darlehenBetrag || initial?.sollzinsProzent || initial?.tilgungProzent);
  const [finanzierungOffen, setFinanzierungOffen] = useState(hatFinanzierung);

  const [fehler, setFehler] = useState<Record<string, string>>({});
  const [speichernFehler, setSpeichernFehler] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function speichern() {
    const neueFehler: Record<string, string> = {};
    if (!art) neueFehler.art = "Wähl die Objektart.";
    if (!bezeichnung.trim()) neueFehler.bezeichnung = "Gib dem Interessenten eine Bezeichnung.";
    if (!(zuZahl(kaufpreis) ?? 0)) neueFehler.kaufpreis = "Trag den Kaufpreis ein.";
    setFehler(neueFehler);
    setSpeichernFehler(null);
    if (Object.keys(neueFehler).length > 0 || !art) return;

    startTransition(async () => {
      const ergebnis = await onSpeichern({
        art,
        bezeichnung: bezeichnung.trim(),
        strasseHausnummer: strasse.trim() || null,
        plz: plz.trim() || null,
        ort: ort.trim() || null,
        bundesland: bundesland || null,
        kaufpreis: zuZahl(kaufpreis) ?? 0,
        flaecheQm: zuZahl(flaeche),
        kaltmieteMonat: zuZahl(miete),
        // Eingeklappte Finanzierung wird nicht gespeichert, auch wenn Werte darin standen.
        darlehenBetrag: finanzierungOffen ? zuZahl(darlehen) : null,
        sollzinsProzent: finanzierungOffen ? zuZahl(zins) : null,
        tilgungProzent: finanzierungOffen ? zuZahl(tilgung) : null,
        inseratUrl: inserat.trim() || null,
      });
      // Bei Erfolg leitet die Server Action weiter; hier kommt nur ein Fehler an.
      if (ergebnis?.fieldErrors) setFehler(ergebnis.fieldErrors);
      if (ergebnis?.error) setSpeichernFehler(ergebnis.error);
    });
  }

  const fehlerListe = Object.values(fehler);

  return (
    <div className="mx-auto max-w-[720px]">
      <h1 className="text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">{titel}</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Eine erste, grobe Einschätzung — nur Kaufpreis und Bezeichnung sind Pflicht.
      </p>

      {fehlerListe.length > 0 && (
        <div className="mt-6 flex items-start gap-2 border border-error-border bg-error-bg p-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" />
          <div className="text-[13px] text-error">
            <p className="font-semibold">
              {fehlerListe.length === 1 ? "Ein Feld fehlt noch" : `Es fehlen noch ${fehlerListe.length} Angaben`}
            </p>
            <ul className="mt-1 list-disc pl-4">
              {fehlerListe.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {speichernFehler && (
        <div className="mt-6 flex items-start gap-2 border border-error-border bg-error-bg p-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" />
          <p className="text-[13px] text-error">{speichernFehler}</p>
        </div>
      )}

      <section className="mt-8 flex flex-col gap-4">
        <h2 className="text-sm font-semibold tracking-[0.06em] text-neutral-600 uppercase">Objekt</h2>
        <div role="radiogroup" aria-label="Objektart" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {OBJEKTARTEN.map((option) => (
            <button
              key={option.wert}
              type="button"
              role="radio"
              aria-checked={art === option.wert}
              onClick={() => setArt(option.wert)}
              className={`border p-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                art === option.wert ? "border-foreground" : "border-border"
              } ${fehler.art ? "bg-error-bg" : ""}`}
            >
              <span className="block font-semibold">{option.label}</span>
              <span className="mt-1 block text-xs text-neutral-600">{option.hinweis}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bezeichnung">Bezeichnung</Label>
          <Input
            id="bezeichnung"
            value={bezeichnung}
            onChange={(e) => setBezeichnung(e.target.value)}
            placeholder="z. B. Altbauwohnung Connewitz"
            aria-invalid={Boolean(fehler.bezeichnung)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="strasse">Straße und Hausnummer (optional)</Label>
          <Input id="strasse" value={strasse} onChange={(e) => setStrasse(e.target.value)} />
        </div>
        <div className="grid grid-cols-[2.2fr_1fr] gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ort">Ort (optional)</Label>
            <Input id="ort" value={ort} onChange={(e) => setOrt(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plz">PLZ (optional)</Label>
            <Input id="plz" value={plz} onChange={(e) => setPlz(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bundesland">Bundesland (optional)</Label>
          <Select value={bundesland} onValueChange={setBundesland}>
            <SelectTrigger id="bundesland" className="w-full">
              <SelectValue placeholder="Bundesland wählen" />
            </SelectTrigger>
            <SelectContent>
              {BUNDESLAENDER.map((land) => (
                <SelectItem key={land} value={land}>
                  {bundeslandLabel(land)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-neutral-600">Wird für die Grunderwerbsteuer im Kaufnebenkosten-Rechner gebraucht.</p>
        </div>
      </section>

      <section className="mt-8 flex flex-col gap-4 border-t border-border pt-6">
        <h2 className="text-sm font-semibold tracking-[0.06em] text-neutral-600 uppercase">Kauf und Miete</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kaufpreis">Kaufpreis</Label>
          <div className="flex items-center gap-1.5">
            <Input
              id="kaufpreis"
              type="number"
              min={0}
              value={kaufpreis}
              onChange={(e) => setKaufpreis(e.target.value)}
              aria-invalid={Boolean(fehler.kaufpreis)}
            />
            <span className="text-sm text-neutral-600">€</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="flaeche">Fläche gesamt (optional)</Label>
            <div className="flex items-center gap-1.5">
              <Input id="flaeche" type="number" min={0} value={flaeche} onChange={(e) => setFlaeche(e.target.value)} />
              <span className="text-sm text-neutral-600">m²</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="miete">Erwartete Kaltmiete pro Monat (optional)</Label>
            <div className="flex items-center gap-1.5">
              <Input id="miete" type="number" min={0} value={miete} onChange={(e) => setMiete(e.target.value)} />
              <span className="text-sm text-neutral-600">€</span>
            </div>
          </div>
        </div>
        {art === "mehrfamilienhaus" && (
          <p className="text-xs text-neutral-600">
            Beim Mehrfamilienhaus reichen hier Gesamtwerte. Einheiten legst du an, sobald du die Immobilie in den Bestand übernimmst.
          </p>
        )}
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <button
          type="button"
          onClick={() => setFinanzierungOffen((offen) => !offen)}
          aria-expanded={finanzierungOffen}
          aria-controls="finanzierung-felder"
          className="flex w-full items-center justify-between text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="text-sm font-semibold tracking-[0.06em] text-neutral-600 uppercase">
            Geplante Finanzierung (optional)
          </span>
          <ChevronDown className={`size-4 transition-transform ${finanzierungOffen ? "rotate-180" : ""}`} />
        </button>
        {finanzierungOffen && (
          <div id="finanzierung-felder" className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="darlehen">Geplantes Darlehen</Label>
              <div className="flex items-center gap-1.5">
                <Input id="darlehen" type="number" min={0} value={darlehen} onChange={(e) => setDarlehen(e.target.value)} />
                <span className="text-sm text-neutral-600">€</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="zins">Sollzins</Label>
                <div className="flex items-center gap-1.5">
                  <Input id="zins" type="number" min={0} step="any" value={zins} onChange={(e) => setZins(e.target.value)} />
                  <span className="text-sm text-neutral-600">%</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tilgung">Tilgung</Label>
                <div className="flex items-center gap-1.5">
                  <Input id="tilgung" type="number" min={0} step="any" value={tilgung} onChange={(e) => setTilgung(e.target.value)} />
                  <span className="text-sm text-neutral-600">%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="mt-8 flex flex-col gap-1.5 border-t border-border pt-6">
        <h2 className="text-sm font-semibold tracking-[0.06em] text-neutral-600 uppercase">Inserat</h2>
        <Label htmlFor="inserat" className="mt-2">Link zum Inserat (optional)</Label>
        <Input
          id="inserat"
          type="url"
          inputMode="url"
          value={inserat}
          onChange={(e) => setInserat(e.target.value)}
          placeholder="https://"
          aria-invalid={Boolean(fehler.inseratUrl)}
        />
        {fehler.inseratUrl && <p className="text-xs text-error">{fehler.inseratUrl}</p>}
      </section>

      <div className="mt-8 flex gap-3 border-t border-border pt-6">
        <Button type="button" onClick={speichern} disabled={pending}>
          {pending ? "Speichert …" : speichernLabel}
        </Button>
        <Button asChild variant="outline">
          <Link href={abbrechenHref}>Abbrechen</Link>
        </Button>
      </div>
    </div>
  );
}
