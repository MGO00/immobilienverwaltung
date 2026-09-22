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
import type { EinheitStatus } from "@/lib/validation/immobilie";

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
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="einheit-flaeche">Fläche</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  id="einheit-flaeche"
                  type="number"
                  min={0}
                  value={wert.flaecheQm}
                  onChange={(e) => setWert({ ...wert, flaecheQm: e.target.value })}
                />
                <span className="text-sm text-neutral-600">m²</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="einheit-kaltmiete">Kaltmiete</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  id="einheit-kaltmiete"
                  type="number"
                  min={0}
                  value={wert.kaltmieteMonat}
                  onChange={(e) => setWert({ ...wert, kaltmieteMonat: e.target.value })}
                />
                <span className="text-sm text-neutral-600">€</span>
              </div>
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
          <Button
            onClick={() => {
              if (!wert.name.trim()) return;
              onSave(wert);
              onOpenChange(false);
            }}
          >
            Einheit speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
