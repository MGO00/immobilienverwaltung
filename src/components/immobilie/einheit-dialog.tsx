"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ZahlInput } from "@/components/ui/zahl-input";
import { ZAHLENFELDER_EINHEIT, type EinheitStatus } from "@/lib/validation/immobilie";
import { zahlFehler } from "@/lib/validation/zahl";

// Fläche und Kaltmiete als Text, genau wie eingetippt ("58,5", "1.250"); eingelesen
// wird mit denselben Regeln wie auf dem Server (ZAHLENFELDER_EINHEIT).
export type EinheitFormWert = {
  name: string;
  flaecheQm: string;
  kaltmieteMonat: string;
  status: EinheitStatus;
};

const LEERE_EINHEIT: EinheitFormWert = {
  name: "",
  flaecheQm: "",
  kaltmieteMonat: "",
  status: "vermietet",
};

export function EinheitDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: EinheitFormWert;
  onSave: (wert: EinheitFormWert) => void;
}) {
  // Der Aufrufer gibt bei jedem Öffnen einen neuen `key` mit (siehe
  // wizard.tsx), damit hier bei jedem Öffnen frisch mit `initial`
  // gestartet wird, statt den Zustand per Effekt nachträglich zu setzen.
  const [wert, setWert] = useState<EinheitFormWert>(initial ?? LEERE_EINHEIT);
  const [fehler, setFehler] = useState<Partial<Record<"name" | "flaecheQm" | "kaltmieteMonat", string>>>({});

  function speichern() {
    const neueFehler: typeof fehler = {};
    if (!wert.name.trim()) neueFehler.name = "Bitte eine Bezeichnung für die Einheit angeben.";
    const flaecheFehler = zahlFehler(ZAHLENFELDER_EINHEIT.flaecheQm, wert.flaecheQm);
    if (flaecheFehler) neueFehler.flaecheQm = flaecheFehler;
    const mieteFehler = zahlFehler(ZAHLENFELDER_EINHEIT.kaltmieteMonat, wert.kaltmieteMonat);
    if (mieteFehler) neueFehler.kaltmieteMonat = mieteFehler;
    setFehler(neueFehler);
    if (Object.keys(neueFehler).length > 0) return;
    onSave({ ...wert, name: wert.name.trim(), flaecheQm: wert.flaecheQm.trim(), kaltmieteMonat: wert.kaltmieteMonat.trim() });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Einheit bearbeiten" : "Einheit hinzufügen"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="einheit-name">Bezeichnung</Label>
            <Input
              id="einheit-name"
              value={wert.name}
              onChange={(e) => setWert({ ...wert, name: e.target.value })}
              placeholder="z. B. 3. OG links"
              aria-invalid={fehler.name ? true : undefined}
              aria-describedby={fehler.name ? "einheit-name-fehler" : undefined}
            />
            {fehler.name && (
              <p id="einheit-name-fehler" className="text-xs text-error">
                {fehler.name}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="einheit-flaeche">Fläche</Label>
              <ZahlInput
                id="einheit-flaeche"
                einheit="m²"
                value={wert.flaecheQm}
                onChange={(flaecheQm) => setWert({ ...wert, flaecheQm })}
                fehler={fehler.flaecheQm}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="einheit-kaltmiete">Kaltmiete</Label>
              <ZahlInput
                id="einheit-kaltmiete"
                einheit="€"
                value={wert.kaltmieteMonat}
                onChange={(kaltmieteMonat) => setWert({ ...wert, kaltmieteMonat })}
                fehler={fehler.kaltmieteMonat}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="einheit-status">Status</Label>
            <Select
              value={wert.status}
              onValueChange={(value) => setWert({ ...wert, status: value as EinheitStatus })}
            >
              <SelectTrigger id="einheit-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vermietet">vermietet</SelectItem>
                <SelectItem value="selbstgenutzt">selbstgenutzt</SelectItem>
                <SelectItem value="leer">leer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={speichern}>
            Einheit speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
