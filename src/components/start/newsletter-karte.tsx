"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { newsletterAnmelden, type NewsletterState } from "@/app/newsletter/actions";

const START: NewsletterState = { status: "leer" };

// E-Mail-Liste (Double-Opt-in): bewusst getrennt von der Registrierung. Nach dem
// Absenden kommt eine Bestätigungsmail; erst der Klick darin trägt die Adresse ein.
export function NewsletterKarte() {
  const [state, formAction, pending] = useActionState(newsletterAnmelden, START);
  const [fehlerAus, setFehlerAus] = useState(false);
  // Kontrolliertes Feld: React würde ein Formular nach der Server Action sonst
  // leeren, und bei einem Tippfehler müsste man die Adresse neu eingeben.
  const [mail, setMail] = useState("");
  const zeigeFehler = state.status === "fehler" && !fehlerAus;

  return (
    <div className="grid items-end gap-8 rounded-[10px] border border-border p-6 md:grid-cols-2">
      <div>
        <p className="mb-2 text-[11px] tracking-[0.1em] text-neutral-700 uppercase">E-Mail-Liste</p>
        <h2 className="text-[21px] font-semibold">Neuigkeiten per E-Mail</h2>
        <p className="mt-1.5 max-w-[440px] text-sm leading-[1.55] text-neutral-800 text-pretty">
          Einmal im Monat: Neuigkeiten zu den Rechnern und neuen Funktionen. Das ist kein Konto — dafür gibt es die Registrierung.
        </p>
      </div>

      <div>
        {state.status === "ok" ? (
          <div className="flex items-start gap-3 border-t border-border pt-4" role="status">
            <Check className="mt-0.5 size-[18px] shrink-0" />
            <div>
              <p className="text-[15px] font-semibold">Fast geschafft</p>
              <p className="mt-1 text-[13px] leading-[1.55] text-neutral-800 text-pretty">
                Bitte bestätige deine Adresse über den Link, den wir an {state.email} geschickt haben.
              </p>
            </div>
          </div>
        ) : (
          <form action={formAction} noValidate>
            <Label htmlFor="newsletter-email">E-Mail-Adresse</Label>
            <div className="mt-1.5 flex flex-col gap-2 md:flex-row md:items-stretch">
              <Input
                id="newsletter-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="name@beispiel.de"
                value={mail}
                onChange={(e) => {
                  setMail(e.target.value);
                  setFehlerAus(true);
                }}
                aria-invalid={zeigeFehler}
                aria-describedby={zeigeFehler ? "newsletter-fehler" : undefined}
                className={`min-w-0 flex-1 ${zeigeFehler ? "border-error" : ""}`}
              />
              {/* Honigtopf gegen Bots: für Menschen unsichtbar und nicht erreichbar. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />
              <Button
                type="submit"
                variant="outline"
                disabled={pending}
                onClick={() => setFehlerAus(false)}
                className="h-auto min-h-8 whitespace-nowrap"
              >
                {pending ? "Einen Moment …" : "Auf dem Laufenden bleiben"}
              </Button>
            </div>
            {zeigeFehler && (
              <p id="newsletter-fehler" role="alert" className="mt-1.5 text-xs text-error">
                {state.fehler}
              </p>
            )}
            <p className="mt-1.5 text-xs text-neutral-700">
              Abmelden jederzeit über den Link in jeder E-Mail. Details in der{" "}
              <Link href="#datenschutz" className="text-primary hover:underline">
                Datenschutzerklärung
              </Link>
              .
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
