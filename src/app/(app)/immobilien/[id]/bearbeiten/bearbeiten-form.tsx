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
import { ZahlInput } from "@/components/ui/zahl-input";
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
import { kostenPostenFeld, ZAHLENFELDER_IMMOBILIE } from "@/lib/validation/immobilie";
import { zahlFehler } from "@/lib/validation/zahl";
import { formatEingabe, formatEingabeOptional } from "@/lib/zahl";
import { OBJEKTART_LABEL } from "@/lib/constants/objektart";
import { FotoUpload } from "@/components/immobilie/foto-upload";
import type { EinheitZeile, ImmobilieDetail, LaufenderKostenZeile } from "@/lib/data/immobilie-detail";
import type { EinheitStatus } from "@/lib/validation/immobilie";
import { immobilieAktualisieren, immobilieLoeschen } from "./actions";

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
  const [baujahr, setBaujahr] = useState(formatEingabeOptional(immobilie.baujahr));
  const [wohnflaecheQm, setWohnflaecheQm] = useState(formatEingabeOptional(einheit?.flaecheQm));
  const [grundstuecksflaecheQm, setGrundstuecksflaecheQm] = useState(
    formatEingabeOptional(immobilie.grundstuecksflaecheQm),
  );
  const [kaufdatum, setKaufdatum] = useState(immobilie.kaufdatum ?? "");
  const [kaufpreis, setKaufpreis] = useState(formatEingabe(immobilie.kaufpreis));
  const [kaufnebenkostenBetrag, setKaufnebenkostenBetrag] = useState(
    formatEingabeOptional(immobilie.kaufnebenkostenBetrag),
  );
  const [ohneFinanzierung, setOhneFinanzierung] = useState(!immobilie.darlehenBetrag);
  const [darlehenBetrag, setDarlehenBetrag] = useState(formatEingabeOptional(immobilie.darlehenBetrag));
  const [sollzinsProzent, setSollzinsProzent] = useState(formatEingabeOptional(immobilie.sollzinsProzent));
  const [tilgungProzent, setTilgungProzent] = useState(formatEingabeOptional(immobilie.tilgungProzent));
  const [zinsbindungBis, setZinsbindungBis] = useState(immobilie.zinsbindungBis ?? "");
  const [status, setStatus] = useState<EinheitStatus>(einheit?.status ?? "leer");
  const [kaltmieteMonat, setKaltmieteMonat] = useState(formatEingabeOptional(einheit?.kaltmieteMonat));
  const [kostenState, setKostenState] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const posten of laufendeKosten) {
      initial[posten.typ] = formatEingabe(posten.betragMonat);
    }
    return initial;
  });

  const [fehler, setFehler] = useState<string | null>(null);
  const [feldFehler, setFeldFehler] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [loeschenOffen, setLoeschenOffen] = useState(false);
  const [loeschFehler, setLoeschFehler] = useState<string | null>(null);
  const [loeschtPending, startLoeschTransition] = useTransition();

  const kostenFelder = laufendeKostenFelder(immobilie.art);

  function speichern() {
    setFehler(null);

    // Zahlenfelder mit genau den Schemas prüfen, die auch der Server nutzt.
    const Z = ZAHLENFELDER_IMMOBILIE;
    const pruefungen: [string, Parameters<typeof zahlFehler>[0], string][] = [
      ["baujahr", Z.baujahr, baujahr],
      ["kaufpreis", Z.kaufpreis, kaufpreis],
      ["kaufnebenkostenBetrag", Z.kaufnebenkostenBetrag, kaufnebenkostenBetrag],
      ...Object.entries(kostenState).map(
        ([typ, wert]): [string, Parameters<typeof zahlFehler>[0], string] => [`kosten-${typ}`, kostenPostenFeld, wert],
      ),
    ];
    if (!istMfh) {
      pruefungen.push(["wohnflaecheQm", Z.wohnflaecheQm, wohnflaecheQm], ["kaltmieteMonat", Z.kaltmieteMonat, kaltmieteMonat]);
    }
    if (istHaus) pruefungen.push(["grundstuecksflaecheQm", Z.grundstuecksflaecheQm, grundstuecksflaecheQm]);
    if (!ohneFinanzierung) {
      pruefungen.push(
        ["darlehenBetrag", Z.darlehenBetrag, darlehenBetrag],
        ["sollzinsProzent", Z.sollzinsProzent, sollzinsProzent],
        ["tilgungProzent", Z.tilgungProzent, tilgungProzent],
      );
    }
    const neueFeldFehler: Record<string, string> = {};
    for (const [schluessel, schema, text] of pruefungen) {
      const meldung = zahlFehler(schema, text);
      if (meldung) neueFeldFehler[schluessel] = meldung;
    }
    setFeldFehler(neueFeldFehler);
    if (Object.keys(neueFeldFehler).length > 0) {
      setFehler("Bitte prüf die markierten Felder.");
      return;
    }

    // Zahlenfelder gehen als Text an den Server und werden dort mit denselben
    // Regeln eingelesen. Leere Kostenposten werden nicht mitgeschickt.
    const laufendeKostenPayload: Record<string, string> = {};
    for (const [typ, wert] of Object.entries(kostenState)) {
      if (wert.trim()) laufendeKostenPayload[typ] = wert.trim();
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
        baujahr,
        grundstuecksflaecheQm: istHaus ? grundstuecksflaecheQm : "",
        wohnflaecheQm: !istMfh ? wohnflaecheQm : "",
        kaufdatum: kaufdatum || null,
        kaufpreis,
        kaufnebenkostenBetrag,
        ohneFinanzierung,
        darlehenBetrag: ohneFinanzierung ? "" : darlehenBetrag,
        sollzinsProzent: ohneFinanzierung ? "" : sollzinsProzent,
        tilgungProzent: ohneFinanzierung ? "" : tilgungProzent,
        zinsbindungBis: zinsbindungBis || null,
        kaltmieteMonat: !istMfh ? kaltmieteMonat : "",
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
            <ZahlInput id="baujahr" ganzzahl value={baujahr} onChange={setBaujahr} fehler={feldFehler.baujahr} />
          </div>
          {!istMfh && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wohnflaeche">Wohnfläche</Label>
              <ZahlInput
                id="wohnflaeche"
                einheit="m²"
                value={wohnflaecheQm}
                onChange={setWohnflaecheQm}
                fehler={feldFehler.wohnflaecheQm}
              />
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
            <ZahlInput
              id="grundstuecksflaeche"
              einheit="m²"
              value={grundstuecksflaecheQm}
              onChange={setGrundstuecksflaecheQm}
              fehler={feldFehler.grundstuecksflaecheQm}
            />
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
            <ZahlInput id="kaufpreis" einheit="€" value={kaufpreis} onChange={setKaufpreis} fehler={feldFehler.kaufpreis} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kaufnebenkosten">Kaufnebenkosten</Label>
          <ZahlInput
            id="kaufnebenkosten"
            einheit="€"
            value={kaufnebenkostenBetrag}
            onChange={setKaufnebenkostenBetrag}
            fehler={feldFehler.kaufnebenkostenBetrag}
          />
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
                <ZahlInput
                  id="darlehen"
                  einheit="€"
                  value={darlehenBetrag}
                  onChange={setDarlehenBetrag}
                  fehler={feldFehler.darlehenBetrag}
                />
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
                <ZahlInput
                  id="zins"
                  einheit="%"
                  value={sollzinsProzent}
                  onChange={setSollzinsProzent}
                  fehler={feldFehler.sollzinsProzent}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tilgung">Tilgung</Label>
                <ZahlInput
                  id="tilgung"
                  einheit="%"
                  value={tilgungProzent}
                  onChange={setTilgungProzent}
                  fehler={feldFehler.tilgungProzent}
                />
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
              <ZahlInput
                id="kaltmiete"
                einheit="€"
                value={kaltmieteMonat}
                onChange={setKaltmieteMonat}
                fehler={feldFehler.kaltmieteMonat}
              />
            </div>
          </>
        )}

        <div>
          <p className="mb-2 text-sm font-medium">Laufende Kosten pro Monat</p>
          <div className="grid grid-cols-2 gap-3">
            {kostenFelder.map((typ) => (
              <div key={typ} className="flex flex-col gap-1.5">
                <Label htmlFor={`kosten-${typ}`}>{LAUFENDE_KOSTEN_LABEL[typ]}</Label>
                <ZahlInput
                  id={`kosten-${typ}`}
                  einheit="€"
                  value={kostenState[typ] ?? ""}
                  onChange={(wert) => setKostenState({ ...kostenState, [typ]: wert })}
                  fehler={feldFehler[`kosten-${typ}`]}
                />
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
