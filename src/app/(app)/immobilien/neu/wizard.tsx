"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EinheitDialog, type EinheitFormWert } from "@/components/immobilie/einheit-dialog";
import { FotoUpload } from "@/components/immobilie/foto-upload";
import { StatusPille } from "@/components/immobilie/status-pille";
import { ZahlInput } from "@/components/ui/zahl-input";
import { formatArea, formatCurrency } from "@/lib/format";
import { BUNDESLAENDER, bundeslandLabel } from "@/lib/constants/steuersaetze";
import { laufendeKostenFelder, LAUFENDE_KOSTEN_LABEL } from "@/lib/constants/laufende-kosten";
import { annuitaetMonat, bruttorendite, cashflowMonat } from "@/lib/calculators/immobilie";
import {
  kostenPostenFeld,
  ZAHLENFELDER_IMMOBILIE,
  type EinheitStatus,
  type ObjektArt,
} from "@/lib/validation/immobilie";
import { zahlFehler, zahlWert } from "@/lib/validation/zahl";
import { parseDeZahl } from "@/lib/zahl";
import { erstelleImmobilie } from "./actions";

type ObjektArtOption = { wert: ObjektArt; label: string; hinweis: string };

const OBJEKTARTEN: ObjektArtOption[] = [
  { wert: "eigentumswohnung", label: "Eigentumswohnung", hinweis: "Genau eine Einheit" },
  { wert: "einfamilienhaus", label: "Einfamilien-/Doppelhaus", hinweis: "Genau eine Einheit" },
  { wert: "mehrfamilienhaus", label: "Mehrfamilienhaus", hinweis: "Mehrere Einheiten" },
];

type WizardState = {
  art: ObjektArt | null;
  bezeichnung: string;
  strasseHausnummer: string;
  plz: string;
  ort: string;
  bundesland: string;
  baujahr: string;
  wohnflaecheQm: string;
  grundstuecksflaecheQm: string;
  kaufdatum: string;
  kaufpreis: string;
  kaufnebenkostenBetrag: string;
  ohneFinanzierung: boolean;
  darlehenBetrag: string;
  sollzinsProzent: string;
  tilgungProzent: string;
  zinsbindungBis: string;
  status: EinheitStatus;
  kaltmieteMonat: string;
  einheiten: EinheitFormWert[];
  laufendeKosten: Record<string, string>;
  foto: File | null;
};

const LEER: WizardState = {
  art: null,
  bezeichnung: "",
  strasseHausnummer: "",
  plz: "",
  ort: "",
  bundesland: "",
  baujahr: "",
  wohnflaecheQm: "",
  grundstuecksflaecheQm: "",
  kaufdatum: "",
  kaufpreis: "",
  kaufnebenkostenBetrag: "",
  ohneFinanzierung: false,
  darlehenBetrag: "",
  sollzinsProzent: "3.5",
  tilgungProzent: "2.0",
  zinsbindungBis: "",
  status: "leer",
  kaltmieteMonat: "",
  einheiten: [],
  laufendeKosten: {},
  foto: null,
};

const SCHRITT_LABEL = ["1 · Objekt", "2 · Kauf und Finanzierung", "3 · Miete und Kosten"];

// Feldnamen für die Fehlerübersicht oben ("Zins: Bitte eine Zahl eingeben …").
const FELD_NAME: Record<string, string> = {
  baujahr: "Baujahr",
  wohnflaecheQm: "Wohnfläche",
  grundstuecksflaecheQm: "Grundstücksfläche",
  kaufpreis: "Kaufpreis",
  kaufnebenkostenBetrag: "Kaufnebenkosten",
  darlehenBetrag: "Darlehen",
  sollzinsProzent: "Zins",
  tilgungProzent: "Tilgung",
  kaltmieteMonat: "Kaltmiete",
  ...Object.fromEntries(Object.entries(LAUFENDE_KOSTEN_LABEL).map(([typ, label]) => [`kosten-${typ}`, label])),
};

function flaecheText(text: string): string {
  const flaeche = parseDeZahl(text);
  return flaeche ? formatArea(flaeche) : "—";
}

export function ImmobilienAssistent() {
  const router = useRouter();
  const [schritt, setSchritt] = useState<1 | 2 | 3>(1);
  const [state, setState] = useState<WizardState>(LEER);
  const [fehler, setFehler] = useState<Record<string, string>>({});
  const [einheitDialogOffen, setEinheitDialogOffen] = useState(false);
  const [bearbeiteteEinheit, setBearbeiteteEinheit] = useState<number | null>(null);
  const [verwerfenOffen, setVerwerfenOffen] = useState(false);
  const [speichernFehler, setSpeichernFehler] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const istMfh = state.art === "mehrfamilienhaus";
  const istHaus = state.art === "einfamilienhaus";
  const kostenFelder = state.art ? laufendeKostenFelder(state.art) : [];
  const Z = ZAHLENFELDER_IMMOBILIE;

  function pruefeSchritt(nr: 1 | 2 | 3): Record<string, string> {
    const neueFehler: Record<string, string> = {};
    // Zahlenfelder mit genau den Schemas prüfen, die auch der Server nutzt.
    const zahl = (schluessel: string, schema: Parameters<typeof zahlFehler>[0], text: string) => {
      const meldung = zahlFehler(schema, text);
      if (meldung) neueFehler[schluessel] = meldung;
    };
    if (nr === 1) {
      if (!state.art) neueFehler.art = "Wähl eine Objektart.";
      if (!state.bezeichnung.trim()) neueFehler.bezeichnung = "Gib der Immobilie eine Bezeichnung.";
      zahl("baujahr", Z.baujahr, state.baujahr);
      if (!istMfh) zahl("wohnflaecheQm", Z.wohnflaecheQm, state.wohnflaecheQm);
      if (istHaus) zahl("grundstuecksflaecheQm", Z.grundstuecksflaecheQm, state.grundstuecksflaecheQm);
    }
    if (nr === 2) {
      zahl("kaufpreis", Z.kaufpreis, state.kaufpreis);
      zahl("kaufnebenkostenBetrag", Z.kaufnebenkostenBetrag, state.kaufnebenkostenBetrag);
      if (!state.ohneFinanzierung) {
        zahl("darlehenBetrag", Z.darlehenBetrag, state.darlehenBetrag);
        zahl("sollzinsProzent", Z.sollzinsProzent, state.sollzinsProzent);
        zahl("tilgungProzent", Z.tilgungProzent, state.tilgungProzent);
      }
    }
    if (nr === 3) {
      if (istMfh) {
        if (state.einheiten.length === 0) neueFehler.einheiten = "Leg mindestens eine Einheit an.";
      } else {
        zahl("kaltmieteMonat", Z.kaltmieteMonat, state.kaltmieteMonat);
        const kaltmiete = parseDeZahl(state.kaltmieteMonat);
        if (!neueFehler.kaltmieteMonat && (!kaltmiete || kaltmiete <= 0)) {
          neueFehler.kaltmieteMonat = "Trag die Kaltmiete ein.";
        }
      }
      for (const typ of kostenFelder) {
        zahl(`kosten-${typ}`, kostenPostenFeld, state.laufendeKosten[typ] ?? "");
      }
    }
    return neueFehler;
  }

  function weiter() {
    const neueFehler = pruefeSchritt(schritt);
    setFehler(neueFehler);
    if (Object.keys(neueFehler).length > 0) return;

    if (schritt < 3) {
      setSchritt((s) => (s + 1) as 1 | 2 | 3);
      return;
    }

    setSpeichernFehler(null);
    startTransition(async () => {
      // Zahlenfelder gehen als Text an den Server und werden dort mit denselben
      // Regeln eingelesen (src/lib/validation/zahl.ts). Nicht passende Felder leer.
      const laufendeKosten: Record<string, string> = {};
      for (const typ of kostenFelder) {
        const text = (state.laufendeKosten[typ] ?? "").trim();
        if (text) laufendeKosten[typ] = text;
      }

      let fotoFormData: FormData | null = null;
      if (state.foto) {
        fotoFormData = new FormData();
        fotoFormData.append("foto", state.foto);
      }

      const ergebnis = await erstelleImmobilie(
        {
          art: state.art!,
          bezeichnung: state.bezeichnung.trim(),
          strasseHausnummer: state.strasseHausnummer.trim() || null,
          plz: state.plz.trim() || null,
          ort: state.ort.trim() || null,
          bundesland: state.bundesland || null,
          baujahr: state.baujahr,
          grundstuecksflaecheQm: istHaus ? state.grundstuecksflaecheQm : "",
          wohnflaecheQm: !istMfh ? state.wohnflaecheQm : "",
          kaufdatum: state.kaufdatum || null,
          kaufpreis: state.kaufpreis,
          kaufnebenkostenBetrag: state.kaufnebenkostenBetrag,
          ohneFinanzierung: state.ohneFinanzierung,
          darlehenBetrag: state.ohneFinanzierung ? "" : state.darlehenBetrag,
          sollzinsProzent: state.ohneFinanzierung ? "" : state.sollzinsProzent,
          tilgungProzent: state.ohneFinanzierung ? "" : state.tilgungProzent,
          zinsbindungBis: state.zinsbindungBis || null,
          kaltmieteMonat: !istMfh ? state.kaltmieteMonat : "",
          status: !istMfh ? state.status : null,
          einheiten: istMfh
            ? state.einheiten.map((e) => ({
                name: e.name,
                flaecheQm: e.flaecheQm,
                kaltmieteMonat: e.kaltmieteMonat,
                status: e.status,
              }))
            : [],
          laufendeKosten,
        },
        fotoFormData,
      );

      if (ergebnis?.error) {
        setSpeichernFehler(ergebnis.error);
      }
    });
  }

  function zurueck() {
    if (schritt > 1) setSchritt((s) => (s - 1) as 1 | 2 | 3);
  }

  function abbrechen() {
    const hatAngaben = Boolean(state.art || state.bezeichnung.trim() || state.kaufpreis.trim());
    if (hatAngaben) {
      setVerwerfenOffen(true);
    } else {
      router.push("/uebersicht");
    }
  }

  // Die Vorschau rechnet nur mit gültigen Werten (dieselben Regeln wie beim Speichern),
  // nie z. B. mit einem abgelehnten Zins von 1.500 %.
  const kaufpreisZahl = zahlWert(Z.kaufpreis, state.kaufpreis) ?? 0;
  const bruttorenditeZahl = bruttorendite(
    (istMfh
      ? state.einheiten
          .filter((e) => e.status === "vermietet")
          .reduce((s, e) => s + (parseDeZahl(e.kaltmieteMonat) ?? 0), 0)
      : state.status === "vermietet"
        ? (zahlWert(Z.kaltmieteMonat, state.kaltmieteMonat) ?? 0)
        : 0) * 12,
    kaufpreisZahl,
  );
  const annuitaetZahl = state.ohneFinanzierung
    ? null
    : annuitaetMonat(
        zahlWert(Z.darlehenBetrag, state.darlehenBetrag),
        zahlWert(Z.sollzinsProzent, state.sollzinsProzent),
        zahlWert(Z.tilgungProzent, state.tilgungProzent),
      );
  const kaltmieteFuerCashflow = istMfh
    ? state.einheiten
        .filter((e) => e.status === "vermietet")
        .reduce((s, e) => s + (parseDeZahl(e.kaltmieteMonat) ?? 0), 0)
    : state.status === "vermietet"
      ? (zahlWert(Z.kaltmieteMonat, state.kaltmieteMonat) ?? 0)
      : 0;
  const laufendeKostenSumme = Object.values(state.laufendeKosten).reduce(
    (s, wert) => s + (zahlWert(kostenPostenFeld, wert) ?? 0),
    0,
  );
  const cashflowZahl = cashflowMonat(kaltmieteFuerCashflow, annuitaetZahl, laufendeKostenSumme);

  return (
    <div className="px-6 py-8">
      <h1 className="text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">
        Immobilie hinzufügen
      </h1>
      <p className="mt-1 text-sm text-neutral-600">Schritt {schritt} von 3</p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {SCHRITT_LABEL.map((label, i) => {
          const nr = (i + 1) as 1 | 2 | 3;
          const erledigtOderAktuell = nr <= schritt;
          return (
            <div
              key={label}
              className={`border-t-[3px] pt-2 text-sm font-semibold ${
                erledigtOderAktuell ? "border-foreground" : "border-border"
              } ${nr === schritt ? "text-foreground" : "text-neutral-600"}`}
            >
              {label}
            </div>
          );
        })}
      </div>

      {Object.keys(fehler).length > 0 && (
        <div className="mt-6 flex items-start gap-2 border border-error-border bg-error-bg p-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" />
          <div className="text-[13px] text-error">
            <p className="font-semibold">
              {Object.keys(fehler).length === 1
                ? "Bitte prüf diese Angabe"
                : `Bitte prüf diese ${Object.keys(fehler).length} Angaben`}
            </p>
            <ul className="mt-1 list-disc pl-4">
              {Object.entries(fehler).map(([schluessel, text]) => (
                <li key={schluessel}>
                  {FELD_NAME[schluessel] ? `${FELD_NAME[schluessel]}: ${text}` : text}
                </li>
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

      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_260px]">
        <div className="flex flex-col gap-6">
          {schritt === 1 && (
            <>
              <div className="grid grid-cols-3 gap-3">
                {OBJEKTARTEN.map((option) => (
                  <button
                    key={option.wert}
                    type="button"
                    onClick={() => setState({ ...state, art: option.wert })}
                    className={`border p-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      state.art === option.wert ? "border-foreground" : "border-border"
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
                  value={state.bezeichnung}
                  onChange={(e) => setState({ ...state, bezeichnung: e.target.value })}
                  placeholder="z. B. Wohnung Südvorstadt"
                  aria-invalid={Boolean(fehler.bezeichnung)}
                />
              </div>

              <div className="grid grid-cols-[2.2fr_1fr] gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="strasse">Straße und Hausnummer (optional)</Label>
                  <Input
                    id="strasse"
                    value={state.strasseHausnummer}
                    onChange={(e) => setState({ ...state, strasseHausnummer: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-[2.2fr_1fr] gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ort">Ort (optional)</Label>
                  <Input id="ort" value={state.ort} onChange={(e) => setState({ ...state, ort: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="plz">PLZ (optional)</Label>
                  <Input id="plz" value={state.plz} onChange={(e) => setState({ ...state, plz: e.target.value })} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bundesland">Bundesland (optional)</Label>
                <Select
                  value={state.bundesland}
                  onValueChange={(value) => setState({ ...state, bundesland: value })}
                >
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
                <p className="text-xs text-neutral-600">
                  Wird für die Grunderwerbsteuer im Kaufnebenkosten-Rechner gebraucht.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="baujahr">Baujahr (optional)</Label>
                  <ZahlInput
                    id="baujahr"
                    ganzzahl
                    value={state.baujahr}
                    onChange={(baujahr) => setState({ ...state, baujahr })}
                    fehler={fehler.baujahr}
                  />
                </div>
                {!istMfh && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="wohnflaeche">Wohnfläche (optional)</Label>
                    <ZahlInput
                      id="wohnflaeche"
                      einheit="m²"
                      value={state.wohnflaecheQm}
                      onChange={(wohnflaecheQm) => setState({ ...state, wohnflaecheQm })}
                      fehler={fehler.wohnflaecheQm}
                    />
                  </div>
                )}
              </div>
              {istMfh && (
                <p className="text-xs text-neutral-600">
                  Die Wohnfläche ergibt sich beim Mehrfamilienhaus automatisch aus der Summe der Einheiten
                  (Schritt 3).
                </p>
              )}

              {istHaus && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="grundstuecksflaeche">Grundstücksfläche (optional)</Label>
                  <ZahlInput
                    id="grundstuecksflaeche"
                    einheit="m²"
                    value={state.grundstuecksflaecheQm}
                    onChange={(grundstuecksflaecheQm) => setState({ ...state, grundstuecksflaecheQm })}
                    fehler={fehler.grundstuecksflaecheQm}
                  />
                </div>
              )}

            </>
          )}

          {schritt === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="kaufdatum">Kaufdatum (optional)</Label>
                  <Input
                    id="kaufdatum"
                    type="date"
                    value={state.kaufdatum}
                    onChange={(e) => setState({ ...state, kaufdatum: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="kaufpreis">Kaufpreis</Label>
                  <ZahlInput
                    id="kaufpreis"
                    einheit="€"
                    value={state.kaufpreis}
                    onChange={(kaufpreis) => setState({ ...state, kaufpreis })}
                    fehler={fehler.kaufpreis}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="kaufnebenkosten">Kaufnebenkosten (optional)</Label>
                <ZahlInput
                  id="kaufnebenkosten"
                  einheit="€"
                  value={state.kaufnebenkostenBetrag}
                  onChange={(kaufnebenkostenBetrag) => setState({ ...state, kaufnebenkostenBetrag })}
                  fehler={fehler.kaufnebenkostenBetrag}
                />
                <Link
                  href="/rechner/kaufnebenkosten"
                  target="_blank"
                  className="self-start text-xs font-semibold text-primary hover:underline"
                >
                  Nicht sicher? Im Rechner berechnen
                </Link>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={state.ohneFinanzierung}
                  onCheckedChange={(checked) => setState({ ...state, ohneFinanzierung: checked === true })}
                />
                Ohne Finanzierung (Eigenkapital)
              </label>

              {!state.ohneFinanzierung && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="darlehen">Darlehen</Label>
                      <ZahlInput
                        id="darlehen"
                        einheit="€"
                        value={state.darlehenBetrag}
                        onChange={(darlehenBetrag) => setState({ ...state, darlehenBetrag })}
                        fehler={fehler.darlehenBetrag}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="zinsbindung">Zinsbindung bis</Label>
                      <Input
                        id="zinsbindung"
                        type="date"
                        value={state.zinsbindungBis}
                        onChange={(e) => setState({ ...state, zinsbindungBis: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="zins">Zins</Label>
                      <ZahlInput
                        id="zins"
                        einheit="%"
                        value={state.sollzinsProzent}
                        onChange={(sollzinsProzent) => setState({ ...state, sollzinsProzent })}
                        fehler={fehler.sollzinsProzent}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="tilgung">Tilgung</Label>
                      <ZahlInput
                        id="tilgung"
                        einheit="%"
                        value={state.tilgungProzent}
                        onChange={(tilgungProzent) => setState({ ...state, tilgungProzent })}
                        fehler={fehler.tilgungProzent}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {schritt === 3 && (
            <>
              {!istMfh && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label>Nutzung</Label>
                    <div className="inline-flex w-fit border border-border">
                      {(["vermietet", "selbstgenutzt", "leer"] as EinheitStatus[]).map((wert) => (
                        <button
                          key={wert}
                          type="button"
                          onClick={() => setState({ ...state, status: wert })}
                          className={`px-3 py-1.5 text-sm font-semibold first:border-r border-border ${
                            state.status === wert ? "bg-neutral-900 text-neutral-100" : "text-neutral-700"
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
                      value={state.kaltmieteMonat}
                      onChange={(kaltmieteMonat) => setState({ ...state, kaltmieteMonat })}
                      fehler={fehler.kaltmieteMonat}
                    />
                    {state.status !== "vermietet" && (
                      <p className="text-xs text-neutral-600">
                        Gilt als Soll-Miete und zählt erst zur Jahreskaltmiete, wenn die Einheit vermietet ist.
                      </p>
                    )}
                  </div>
                </>
              )}

              {istMfh && (
                <div>
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-semibold">
                      Einheiten — {state.einheiten.length} angelegt ·{" "}
                      {formatCurrency(state.einheiten.reduce((s, e) => s + (parseDeZahl(e.kaltmieteMonat) ?? 0), 0))}{" "}
                      Kaltmiete
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setBearbeiteteEinheit(null);
                        setEinheitDialogOffen(true);
                      }}
                    >
                      <Plus className="size-4" />
                      Einheit hinzufügen
                    </Button>
                  </div>

                  {state.einheiten.length === 0 ? (
                    <p className="mt-3 text-sm text-neutral-600">Noch keine Einheit angelegt.</p>
                  ) : (
                    <table className="mt-3 w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-neutral-600">
                          <th className="py-2 font-medium">Einheit</th>
                          <th className="py-2 font-medium">Fläche</th>
                          <th className="py-2 font-medium">Kaltmiete</th>
                          <th className="py-2 font-medium">Status</th>
                          <th className="py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {state.einheiten.map((e, i) => (
                          <tr key={i} className="border-b border-border">
                            <td className="py-2">{e.name}</td>
                            <td className="py-2 tabular-nums">{flaecheText(e.flaecheQm)}</td>
                            <td className="py-2 tabular-nums">{formatCurrency(parseDeZahl(e.kaltmieteMonat) ?? 0)}</td>
                            <td className="py-2">
                              <StatusPille status={e.status} />
                            </td>
                            <td className="py-2 text-right">
                              <button
                                type="button"
                                className="text-xs font-semibold text-primary hover:underline"
                                onClick={() => {
                                  setBearbeiteteEinheit(i);
                                  setEinheitDialogOffen(true);
                                }}
                              >
                                Bearbeiten
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {fehler.einheiten && <p className="mt-2 text-xs text-error">{fehler.einheiten}</p>}
                </div>
              )}

              <div>
                <p className="mb-2 text-sm font-medium">
                  Laufende Kosten pro Monat (optional, nur nicht umlagefähige)
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {kostenFelder.map((typ) => (
                    <div key={typ} className="flex flex-col gap-1.5">
                      <Label htmlFor={`kosten-${typ}`}>{LAUFENDE_KOSTEN_LABEL[typ]}</Label>
                      <ZahlInput
                        id={`kosten-${typ}`}
                        einheit="€"
                        value={state.laufendeKosten[typ] ?? ""}
                        onChange={(wert) =>
                          setState({
                            ...state,
                            laufendeKosten: { ...state.laufendeKosten, [typ]: wert },
                          })
                        }
                        fehler={fehler[`kosten-${typ}`]}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium">Foto (optional)</p>
                <FotoUpload
                  modus="aufgeschoben"
                  hoehe={148}
                  breite={220}
                  onAuswahl={(datei) => setState((s) => ({ ...s, foto: datei }))}
                />
                <p className="mt-1.5 text-xs text-neutral-600">Ein Querformat pro Objekt.</p>
              </div>
            </>
          )}

          <div className="flex items-center gap-3 border-t border-border pt-6">
            <Button variant="outline" onClick={zurueck} disabled={schritt === 1}>
              Zurück
            </Button>
            <Button onClick={weiter} disabled={pending}>
              {pending ? "Speichert …" : schritt === 3 ? "Speichern" : "Weiter"}
            </Button>
            <Button variant="ghost" onClick={abbrechen} className="text-primary">
              Abbrechen
            </Button>
          </div>
        </div>

        {schritt >= 2 && (
          <div className="h-fit border border-border p-4">
            <p className="text-sm font-semibold">Vorschau</p>
            <dl className="mt-3 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-600">Bruttorendite</dt>
                <dd className="tabular-nums">
                  {bruttorenditeZahl !== null ? `${(bruttorenditeZahl * 100).toFixed(1)} %` : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-600">Annuität / Monat</dt>
                <dd className="tabular-nums">{annuitaetZahl !== null ? formatCurrency(annuitaetZahl) : "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-600">Cashflow / Monat</dt>
                <dd className="tabular-nums">{formatCurrency(cashflowZahl)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-neutral-600">
              Rechnet mit, sobald Kaufpreis, Miete und Finanzierung stehen. Keine Steuer- oder Anlageberatung.
            </p>
          </div>
        )}
      </div>

      <EinheitDialog
        key={einheitDialogOffen ? `offen-${bearbeiteteEinheit ?? "neu"}` : "geschlossen"}
        open={einheitDialogOffen}
        onOpenChange={setEinheitDialogOffen}
        initial={bearbeiteteEinheit !== null ? state.einheiten[bearbeiteteEinheit] : undefined}
        onSave={(wert) => {
          setState((s) => {
            const einheiten = [...s.einheiten];
            if (bearbeiteteEinheit !== null) {
              einheiten[bearbeiteteEinheit] = wert;
            } else {
              einheiten.push(wert);
            }
            return { ...s, einheiten };
          });
        }}
      />

      <Dialog open={verwerfenOffen} onOpenChange={setVerwerfenOffen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Änderungen verwerfen?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-700">
            Du hast Angaben gemacht, die noch nicht gespeichert sind. Verlässt du die Seite, sind sie weg.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerwerfenOffen(false)}>
              Weiter bearbeiten
            </Button>
            <Button
              variant="outline"
              className="border-error text-error"
              onClick={() => router.push("/uebersicht")}
            >
              Verwerfen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
