"use client";

import Link from "next/link";
import { useTransition, useState } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BUNDESLAENDER, bundeslandLabel } from "@/lib/constants/steuersaetze";
import { laufendeKostenFelder, LAUFENDE_KOSTEN_LABEL } from "@/lib/constants/laufende-kosten";
import { OBJEKTART_LABEL } from "@/lib/constants/objektart";
import { FotoUpload } from "@/components/immobilie/foto-upload";
import type { EinheitZeile, ImmobilieDetail, LaufenderKostenZeile } from "@/lib/data/immobilie-detail";
import type { EinheitStatus } from "@/lib/validation/immobilie";
import { immobilieAktualisieren, immobilieLoeschen } from "./actions";

function zuZahl(wert: string): number | null {
  if (wert.trim() === "") return null;
  const zahl = Number(wert.replace(",", "."));
  return Number.isFinite(zahl) ? zahl : null;
}

export function BearbeitenForm({
  immobilie,
  einheit,
  laufendeKosten,
}: {
  immobilie: ImmobilieDetail;
  einheit: EinheitZeile | null;
  laufendeKosten: LaufenderKostenZeile[];
}) {
  const istMfh = immobilie.art === "mehrfamilienhaus";
  const istHaus = immobilie.art === "einfamilienhaus";

  const [bezeichnung, setBezeichnung] = useState(immobilie.bezeichnung);
  const [strasseHausnummer, setStrasseHausnummer] = useState(immobilie.strasseHausnummer ?? "");
  const [plz, setPlz] = useState(immobilie.plz ?? "");
  const [ort, setOrt] = useState(immobilie.ort ?? "");
  const [bundesland, setBundesland] = useState(immobilie.bundesland ?? "");
  const [baujahr, setBaujahr] = useState(immobilie.baujahr?.toString() ?? "");
  const [wohnflaecheQm, setWohnflaecheQm] = useState(einheit?.flaecheQm?.toString() ?? "");
  const [grundstuecksflaecheQm, setGrundstuecksflaecheQm] = useState(
    immobilie.grundstuecksflaecheQm?.toString() ?? "",
  );
  const [kaufdatum, setKaufdatum] = useState(immobilie.kaufdatum ?? "");
  const [kaufpreis, setKaufpreis] = useState(immobilie.kaufpreis.toString());
  const [kaufnebenkostenBetrag, setKaufnebenkostenBetrag] = useState(
    immobilie.kaufnebenkostenBetrag?.toString() ?? "",
  );
  const [ohneFinanzierung, setOhneFinanzierung] = useState(!immobilie.darlehenBetrag);
  const [darlehenBetrag, setDarlehenBetrag] = useState(immobilie.darlehenBetrag?.toString() ?? "");
  const [sollzinsProzent, setSollzinsProzent] = useState(immobilie.sollzinsProzent?.toString() ?? "");
  const [tilgungProzent, setTilgungProzent] = useState(immobilie.tilgungProzent?.toString() ?? "");
  const [zinsbindungBis, setZinsbindungBis] = useState(immobilie.zinsbindungBis ?? "");
  const [status, setStatus] = useState<EinheitStatus>(einheit?.status ?? "leer");
  const [kaltmieteMonat, setKaltmieteMonat] = useState(einheit?.kaltmieteMonat.toString() ?? "");
  const [kostenState, setKostenState] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const posten of laufendeKosten) {
      initial[posten.typ] = posten.betragMonat.toString();
    }
    return initial;
  });

  const [fehler, setFehler] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [loeschenOffen, setLoeschenOffen] = useState(false);
  const [loeschFehler, setLoeschFehler] = useState<string | null>(null);
  const [loeschtPending, startLoeschTransition] = useTransition();

  const kostenFelder = laufendeKostenFelder(immobilie.art);

  function speichern() {
    setFehler(null);
    const laufendeKostenPayload: Record<string, number> = {};
    for (const [typ, wert] of Object.entries(kostenState)) {
      const zahl = zuZahl(wert);
      if (zahl && zahl > 0) laufendeKostenPayload[typ] = zahl;
    }

    startTransition(async () => {
      const ergebnis = await immobilieAktualisieren({
        id: immobilie.id,
        art: immobilie.art,
        bezeichnung: bezeichnung.trim(),
        strasseHausnummer: strasseHausnummer.trim() || null,
        plz: plz.trim() || null,
        ort: ort.trim() || null,
        bundesland: bundesland || null,
        baujahr: zuZahl(baujahr),
        grundstuecksflaecheQm: istHaus ? zuZahl(grundstuecksflaecheQm) : null,
        wohnflaecheQm: !istMfh ? zuZahl(wohnflaecheQm) : null,
        kaufdatum: kaufdatum || null,
        kaufpreis: zuZahl(kaufpreis) ?? 0,
        kaufnebenkostenBetrag: zuZahl(kaufnebenkostenBetrag),
        ohneFinanzierung,
        darlehenBetrag: zuZahl(darlehenBetrag),
        sollzinsProzent: zuZahl(sollzinsProzent),
        tilgungProzent: zuZahl(tilgungProzent),
        zinsbindungBis: zinsbindungBis || null,
        kaltmieteMonat: !istMfh ? zuZahl(kaltmieteMonat) : null,
        status: !istMfh ? status : null,
        laufendeKosten: laufendeKostenPayload,
      });
      if (ergebnis?.error) {
        setFehler(ergebnis.error);
      }
    });
  }

  function loeschen() {
    setLoeschFehler(null);
    startLoeschTransition(async () => {
      const ergebnis = await immobilieLoeschen(immobilie.id);
      if (ergebnis?.error) {
        setLoeschFehler(ergebnis.error);
      }
    });
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <Link
        href={`/immobilien/${immobilie.id}`}
        className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.06em] text-foreground uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowLeft className="size-3.5" />
        Zurück zur Immobilie
      </Link>
      <h1 className="mt-3 text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">Immobilie bearbeiten</h1>
      <p className="mt-1 text-sm text-neutral-600">Pflicht sind nur Bezeichnung, Kaufpreis und Miete.</p>

      {fehler && (
        <div className="mt-4 flex items-start gap-2 border border-error-border bg-error-bg p-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" />
          <p className="text-[13px] text-error">{fehler}</p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-4">
        <h4 className="text-sm font-semibold">Foto</h4>
        <FotoUpload modus="sofort" propertyId={immobilie.id} fotoUrl={immobilie.fotoUrl} hoehe={148} breite={220} />
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-4">
        <h4 className="text-sm font-semibold">Objekt</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Objektart</Label>
            <p className="flex h-8 items-center text-sm text-neutral-600">{OBJEKTART_LABEL[immobilie.art]}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bezeichnung">Bezeichnung</Label>
            <Input id="bezeichnung" value={bezeichnung} onChange={(e) => setBezeichnung(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="strasse">Straße und Hausnummer</Label>
            <Input id="strasse" value={strasseHausnummer} onChange={(e) => setStrasseHausnummer(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ort">Ort</Label>
            <Input id="ort" value={ort} onChange={(e) => setOrt(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plz">PLZ</Label>
            <Input id="plz" value={plz} onChange={(e) => setPlz(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bundesland">Bundesland</Label>
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
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="baujahr">Baujahr</Label>
            <Input id="baujahr" type="number" value={baujahr} onChange={(e) => setBaujahr(e.target.value)} />
          </div>
          {!istMfh && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wohnflaeche">Wohnfläche</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  id="wohnflaeche"
                  type="number"
                  min={0}
                  value={wohnflaecheQm}
                  onChange={(e) => setWohnflaecheQm(e.target.value)}
                />
                <span className="text-sm text-neutral-600">m²</span>
              </div>
            </div>
          )}
        </div>
        {istMfh && (
          <p className="text-xs text-neutral-600">
            Die Wohnfläche ergibt sich aus der Summe der Einheiten (Tab „Einheiten&rdquo;).
          </p>
        )}
        {istHaus && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="grundstuecksflaeche">Grundstücksfläche</Label>
            <div className="flex items-center gap-1.5">
              <Input
                id="grundstuecksflaeche"
                type="number"
                min={0}
                value={grundstuecksflaecheQm}
                onChange={(e) => setGrundstuecksflaecheQm(e.target.value)}
              />
              <span className="text-sm text-neutral-600">m²</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-4">
        <h4 className="text-sm font-semibold">Kauf und Finanzierung</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kaufdatum">Kaufdatum</Label>
            <Input id="kaufdatum" type="date" value={kaufdatum} onChange={(e) => setKaufdatum(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kaufpreis">Kaufpreis</Label>
            <div className="flex items-center gap-1.5">
              <Input id="kaufpreis" type="number" min={0} value={kaufpreis} onChange={(e) => setKaufpreis(e.target.value)} />
              <span className="text-sm text-neutral-600">€</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kaufnebenkosten">Kaufnebenkosten</Label>
          <div className="flex items-center gap-1.5">
            <Input
              id="kaufnebenkosten"
              type="number"
              min={0}
              value={kaufnebenkostenBetrag}
              onChange={(e) => setKaufnebenkostenBetrag(e.target.value)}
            />
            <span className="text-sm text-neutral-600">€</span>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={ohneFinanzierung}
            onCheckedChange={(checked) => setOhneFinanzierung(checked === true)}
          />
          Ohne Finanzierung (Eigenkapital)
        </label>
        {!ohneFinanzierung && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="darlehen">Darlehen</Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    id="darlehen"
                    type="number"
                    min={0}
                    value={darlehenBetrag}
                    onChange={(e) => setDarlehenBetrag(e.target.value)}
                  />
                  <span className="text-sm text-neutral-600">€</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="zinsbindung">Zinsbindung bis</Label>
                <Input
                  id="zinsbindung"
                  type="date"
                  value={zinsbindungBis}
                  onChange={(e) => setZinsbindungBis(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="zins">Zins</Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    id="zins"
                    type="number"
                    step="0.1"
                    min={0}
                    value={sollzinsProzent}
                    onChange={(e) => setSollzinsProzent(e.target.value)}
                  />
                  <span className="text-sm text-neutral-600">%</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tilgung">Tilgung</Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    id="tilgung"
                    type="number"
                    step="0.1"
                    min={0}
                    value={tilgungProzent}
                    onChange={(e) => setTilgungProzent(e.target.value)}
                  />
                  <span className="text-sm text-neutral-600">%</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-4">
        <h4 className="text-sm font-semibold">Miete und Kosten</h4>
        {istMfh ? (
          <p className="text-sm text-neutral-600">
            Kaltmiete und Status werden je Einheit über den Tab „Einheiten&rdquo; gepflegt.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <Label>Nutzung</Label>
              <div className="inline-flex w-fit border border-border">
                {(["vermietet", "selbstgenutzt", "leer"] as EinheitStatus[]).map((wert) => (
                  <button
                    key={wert}
                    type="button"
                    onClick={() => setStatus(wert)}
                    className={`border-border px-3 py-1.5 text-sm font-semibold first:border-r ${
                      status === wert ? "bg-neutral-900 text-neutral-100" : "text-neutral-700"
                    }`}
                  >
                    {wert}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kaltmiete">Kaltmiete pro Monat</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  id="kaltmiete"
                  type="number"
                  min={0}
                  value={kaltmieteMonat}
                  onChange={(e) => setKaltmieteMonat(e.target.value)}
                />
                <span className="text-sm text-neutral-600">€</span>
              </div>
            </div>
          </>
        )}

        <div>
          <p className="mb-2 text-sm font-medium">Laufende Kosten pro Monat</p>
          <div className="grid grid-cols-2 gap-3">
            {kostenFelder.map((typ) => (
              <div key={typ} className="flex flex-col gap-1.5">
                <Label htmlFor={`kosten-${typ}`}>{LAUFENDE_KOSTEN_LABEL[typ]}</Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    id={`kosten-${typ}`}
                    type="number"
                    min={0}
                    value={kostenState[typ] ?? ""}
                    onChange={(e) => setKostenState({ ...kostenState, [typ]: e.target.value })}
                  />
                  <span className="text-sm text-neutral-600">€</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 border-t border-border pt-6">
        <Button onClick={speichern} disabled={pending}>
          {pending ? "Speichert …" : "Speichern"}
        </Button>
        <Button variant="ghost" asChild className="text-primary">
          <Link href={`/immobilien/${immobilie.id}`}>Abbrechen</Link>
        </Button>
      </div>

      <div className="mt-8 border border-error-border bg-error-bg p-4">
        <p className="text-[15px] font-semibold text-error">Immobilie löschen</p>
        <p className="mt-1 text-sm text-neutral-700">
          Die Immobilie samt Einheiten, Notizen und Berechnungen wird dauerhaft entfernt.
        </p>
        <Button
          variant="outline"
          className="mt-3 border-error text-error"
          onClick={() => setLoeschenOffen(true)}
        >
          Immobilie löschen
        </Button>
      </div>

      <Dialog open={loeschenOffen} onOpenChange={setLoeschenOffen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Immobilie löschen?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-700">„{immobilie.bezeichnung}&rdquo; wird dauerhaft gelöscht.</p>
          <div className="flex items-start gap-2 border border-error-border bg-error-bg p-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" />
            <p className="text-[13px] text-error">
              Einheiten, Notizen und alle gespeicherten Berechnungen dieser Immobilie werden mit gelöscht. Das
              lässt sich nicht rückgängig machen.
            </p>
          </div>
          {loeschFehler && <p className="text-[13px] text-error">{loeschFehler}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoeschenOffen(false)}>
              Abbrechen
            </Button>
            <Button variant="outline" className="border-error text-error" onClick={loeschen} disabled={loeschtPending}>
              {loeschtPending ? "Wird gelöscht …" : "Endgültig löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
