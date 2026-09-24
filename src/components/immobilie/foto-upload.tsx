"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verkleinereBildFallsNoetig } from "@/lib/bild-verkleinern";
import { validiereFoto, validiereFotoUpload } from "@/lib/supabase/foto";
import { fotoEntfernen, fotoHochladen } from "@/app/(app)/immobilien/[id]/bearbeiten/foto-actions";

type FotoUploadProps = { hoehe: number; breite: number } & (
  | { modus: "sofort"; propertyId: string; fotoUrl: string | null }
  | { modus: "aufgeschoben"; onAuswahl: (file: File | null) => void }
);

function FotoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-neutral-400">
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M21 16l-5-5-4 4-3-3-6 6" />
    </svg>
  );
}

export function FotoUpload(props: FotoUploadProps) {
  const { hoehe, breite } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [vorschauUrl, setVorschauUrl] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const bestehendeUrl = props.modus === "sofort" ? props.fotoUrl : null;
  const angezeigteUrl = vorschauUrl ?? bestehendeUrl;

  async function handleDateiAuswahl(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFehler(null);
    const validierungsFehler = validiereFoto(file);
    if (validierungsFehler) {
      setFehler(validierungsFehler);
      return;
    }

    let verkleinert: File;
    try {
      verkleinert = await verkleinereBildFallsNoetig(file);
    } catch {
      setFehler("Das Foto konnte nicht gelesen werden. Bitte versuch es mit einer anderen Datei.");
      return;
    }
    const uploadFehler = validiereFotoUpload(verkleinert);
    if (uploadFehler) {
      setFehler(uploadFehler);
      return;
    }
    setVorschauUrl(URL.createObjectURL(verkleinert));

    if (props.modus === "aufgeschoben") {
      props.onAuswahl(verkleinert);
      return;
    }

    const formData = new FormData();
    formData.append("foto", verkleinert);
    startTransition(async () => {
      const ergebnis = await fotoHochladen(props.propertyId, formData);
      if (ergebnis.error) {
        setFehler(ergebnis.error);
        setVorschauUrl(null);
      }
    });
  }

  function entfernen() {
    setFehler(null);
    setVorschauUrl(null);
    if (inputRef.current) inputRef.current.value = "";

    if (props.modus === "aufgeschoben") {
      props.onAuswahl(null);
      return;
    }

    startTransition(async () => {
      const ergebnis = await fotoEntfernen(props.propertyId);
      if (ergebnis.error) setFehler(ergebnis.error);
    });
  }

  return (
    <div>
      <div
        className="flex items-center justify-center overflow-hidden bg-neutral-100"
        style={{ height: hoehe, width: breite, borderRadius: 10 }}
      >
        {angezeigteUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={angezeigteUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <FotoIcon />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleDateiAuswahl}
      />

      <div className="mt-2 flex items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={pending}>
          {angezeigteUrl ? "Foto ändern" : "Foto hochladen"}
        </Button>
        {angezeigteUrl && (
          <button
            type="button"
            onClick={entfernen}
            disabled={pending}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Foto entfernen
          </button>
        )}
      </div>

      {fehler && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-error">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <span>{fehler}</span>
        </div>
      )}
    </div>
  );
}
