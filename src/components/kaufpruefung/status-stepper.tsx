"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LimitHinweis } from "@/components/tarif/limit-hinweis";
import { INTERESSENT_STATUS_LABEL, type InteressentStatus } from "@/lib/constants/interessent";
import { kannStatusSetzen } from "@/lib/interessent-regeln";
import { interessentStatusSetzen } from "@/app/(app)/kaufpruefung/actions";
import { cn } from "@/lib/utils";

const SCHRITTE: InteressentStatus[] = ["beobachtet", "besichtigt", "angebot_abgegeben", "gekauft"];

// Status-Pipeline als Stepper. Per Klick setzbar sind die offenen Schritte;
// "gekauft" erreicht man nur über "In Bestand übernehmen" (kommt als
// eigener Button). "abgelehnt" ist der Sonderfall daneben.
export function StatusStepper({
  interessentId,
  status,
  uebernehmenAktion,
  wiederaufnahmeGesperrt = null,
}: {
  interessentId: string;
  status: InteressentStatus;
  // Optional: öffnet den Übernahme-Dialog, wenn "gekauft" angeklickt wird.
  uebernehmenAktion?: (() => void) | null;
  // Meldung, wenn das Limit aktiver Interessenten erreicht ist: Dann lässt sich
  // ein abgelehnter Interessent nicht wieder aktiv setzen.
  wiederaufnahmeGesperrt?: string | null;
}) {
  const [fehler, setFehler] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const abgelehnt = status === "abgelehnt";
  const aktuellerIndex = SCHRITTE.indexOf(status);
  const reaktivierungGesperrt = abgelehnt && wiederaufnahmeGesperrt !== null;

  function setzen(neu: InteressentStatus) {
    setFehler(null);
    startTransition(async () => {
      const ergebnis = await interessentStatusSetzen(interessentId, neu);
      if (ergebnis.error) setFehler(ergebnis.error);
    });
  }

  return (
    <div>
      <ol className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Status">
        {SCHRITTE.map((schritt, index) => {
          const erreicht = !abgelehnt && index <= aktuellerIndex;
          const aktuell = schritt === status;
          const klickbar =
            schritt === "gekauft"
              ? Boolean(uebernehmenAktion) && !aktuell
              : kannStatusSetzen(status, schritt) && !reaktivierungGesperrt;
          const inhalt = (
            <>
              <span className="flex items-center gap-1.5">
                {erreicht && !aktuell && <Check className="size-3.5" />}
                {INTERESSENT_STATUS_LABEL[schritt]}
              </span>
            </>
          );
          const stil = cn(
            "block w-full border-t-[3px] pt-2 text-left text-sm font-semibold",
            erreicht ? "border-foreground" : "border-border",
            aktuell ? "text-foreground" : "text-neutral-600",
          );
          return (
            <li key={schritt}>
              {klickbar ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => (schritt === "gekauft" ? uebernehmenAktion?.() : setzen(schritt))}
                  aria-current={aktuell ? "step" : undefined}
                  className={cn(stil, "hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary")}
                >
                  {inhalt}
                </button>
              ) : (
                <div className={stil} aria-current={aktuell ? "step" : undefined}>
                  {inhalt}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {status !== "gekauft" && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {abgelehnt ? (
            <>
              <span className="text-sm text-neutral-700">Dieser Interessent ist abgelehnt.</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending || reaktivierungGesperrt}
                aria-describedby={reaktivierungGesperrt ? "wiederaufnahme-limit" : undefined}
                onClick={() => setzen("beobachtet")}
              >
                Wieder aufnehmen
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => setzen("abgelehnt")}>
              Als abgelehnt markieren
            </Button>
          )}
        </div>
      )}

      {reaktivierungGesperrt && (
        <div className="mt-3">
          <LimitHinweis id="wiederaufnahme-limit" text={wiederaufnahmeGesperrt} />
        </div>
      )}

      {fehler && (
        <div className="mt-3 flex items-start gap-2 border border-error-border bg-error-bg p-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" />
          <p className="text-[13px] text-error">{fehler}</p>
        </div>
      )}
    </div>
  );
}
