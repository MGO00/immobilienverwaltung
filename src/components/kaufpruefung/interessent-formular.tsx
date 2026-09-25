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
import { ZAHLENFELDER_INTERESSENT, type InteressentEingabe } from "@/lib/validation/interessent";
import { zahlFehler } from "@/lib/validation/zahl";
import { formatEingabeOptional } from "@/lib/zahl";
import { ZahlInput } from "@/components/ui/zahl-input";
import type { ObjektArt } from "@/lib/validation/immobilie";

const OBJEKTARTEN: { wert: ObjektArt; label: string; hinweis: string }[] = [
  { wert: "eigentumswohnung", label: "Eigentumswohnung", hinweis: "Eine Wohnung" },
  { wert: "einfamilienhaus", label: "Einfamilien-/Doppelhaus", hinweis: "Ein Haus" },
  { wert: "mehrfamilienhaus", label: "Mehrfamilienhaus", hinweis: "Mehrere Einheiten" },
];

// Feldnamen für die Fehlerübersicht oben ("Sollzins: Bitte eine Zahl eingeben …").
const FELD_NAME: Record<string, string> = {
  kaufpreis: "Kaufpreis",
  flaecheQm: "Fläche",
  kaltmieteMonat: "Erwartete Kaltmiete",
  darlehenBetrag: "Geplantes Darlehen",
  sollzinsProzent: "Sollzins",
  tilgungProzent: "Tilgung",
};

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
  const [kaufpreis, setKaufpreis] = useState(formatEingabeOptional(initial?.kaufpreis, { betrag: true }));
  const [flaeche, setFlaeche] = useState(formatEingabeOptional(initial?.flaecheQm));
  const [miete, setMiete] = useState(formatEingabeOptional(initial?.kaltmieteMonat, { betrag: true }));
  const [darlehen, setDarlehen] = useState(formatEingabeOptional(initial?.darlehenBetrag, { betrag: true }));
  const [zins, setZins] = useState(formatEingabeOptional(initial?.sollzinsProzent));
  const [tilgung, setTilgung] = useState(formatEingabeOptional(initial?.tilgungProzent));
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
    // Zahlenfelder mit genau den Schemas prüfen, die auch der Server nutzt.
    const Z = ZAHLENFELDER_INTERESSENT;
    const pruefungen: [string, Parameters<typeof zahlFehler>[0], string][] = [
      ["kaufpreis", Z.kaufpreis, kaufpreis],
      ["flaecheQm", Z.flaecheQm, flaeche],
      ["kaltmieteMonat", Z.kaltmieteMonat, miete],
    ];
    if (finanzierungOffen) {
      pruefungen.push(
        ["darlehenBetrag", Z.darlehenBetrag, darlehen],
        ["sollzinsProzent", Z.sollzinsProzent, zins],
        ["tilgungProzent", Z.tilgungProzent, tilgung],
      );
    }
    for (const [schluessel, schema, text] of pruefungen) {
      const meldung = zahlFehler(schema, text);
      if (meldung) neueFehler[schluessel] = meldung;
    }
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
        // Zahlen als Text; der Server liest sie mit denselben Regeln ein.
        kaufpreis,
        flaecheQm: flaeche,
        kaltmieteMonat: miete,
        // Eingeklappte Finanzierung wird nicht gespeichert, auch wenn Werte darin standen.
        darlehenBetrag: finanzierungOffen ? darlehen : "",
        sollzinsProzent: finanzierungOffen ? zins : "",
        tilgungProzent: finanzierungOffen ? tilgung : "",
        inseratUrl: inserat.trim() || null,
      });
      // Bei Erfolg leitet die Server Action weiter; hier kommt nur ein Fehler an.
      if (ergebnis?.fieldErrors) setFehler(ergebnis.fieldErrors);
      if (ergebnis?.error) setSpeichernFehler(ergebnis.error);
    });
  }

  const fehlerListe = Object.entries(fehler);

  return (
    <div className="mx-auto max-w-[720px]">
      <h1 className="text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">{titel}</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Eine erste, grobe Einschätzung — nur Objektart, Bezeichnung und Kaufpreis sind Pflicht.
      </p>

      {fehlerListe.length > 0 && (
        <div className="mt-6 flex items-start gap-2 border border-error-border bg-error-bg p-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" />
          <div className="text-[13px] text-error">
            <p className="font-semibold">
              {fehlerListe.length === 1 ? "Bitte prüf diese Angabe" : `Bitte prüf diese ${fehlerListe.length} Angaben`}
            </p>
            <ul className="mt-1 list-disc pl-4">
              {fehlerListe.map(([schluessel, t]) => (
                <li key={schluessel}>{FELD_NAME[schluessel] ? `${FELD_NAME[schluessel]}: ${t}` : t}</li>
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
          <ZahlInput id="kaufpreis" einheit="€" value={kaufpreis} onChange={setKaufpreis} fehler={fehler.kaufpreis} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="flaeche">Fläche gesamt (optional)</Label>
            <ZahlInput id="flaeche" einheit="m²" value={flaeche} onChange={setFlaeche} fehler={fehler.flaecheQm} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="miete">Erwartete Kaltmiete pro Monat (optional)</Label>
            <ZahlInput id="miete" einheit="€" value={miete} onChange={setMiete} fehler={fehler.kaltmieteMonat} />
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
              <ZahlInput id="darlehen" einheit="€" value={darlehen} onChange={setDarlehen} fehler={fehler.darlehenBetrag} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="zins">Sollzins</Label>
                <ZahlInput id="zins" einheit="%" value={zins} onChange={setZins} fehler={fehler.sollzinsProzent} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tilgung">Tilgung</Label>
                <ZahlInput id="tilgung" einheit="%" value={tilgung} onChange={setTilgung} fehler={fehler.tilgungProzent} />
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
