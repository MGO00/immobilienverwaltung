"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { AuthError } from "@/components/auth/auth-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset, type ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  if (state.sent) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 border-t border-border pt-4">
          <Mail className="mt-0.5 size-[18px] shrink-0 text-neutral-700" />
          <p className="text-pretty text-[13px] text-neutral-800">
            <strong className="font-semibold">Prüf dein Postfach.</strong> Falls ein Konto mit
            dieser Adresse existiert, ist der Link zum Zurücksetzen unterwegs. Er gilt 60 Minuten.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/anmelden">Zurück zum Anmelden</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <h2 className="text-[25px] leading-[1.12] font-semibold">Passwort zurücksetzen</h2>
        <p className="mt-2 text-sm text-neutral-700">
          Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link zum Zurücksetzen.
        </p>
      </div>
      {state.error ? <AuthError message={state.error} /> : null}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="du@beispiel.de"
          required
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Wird gesendet…" : "Link senden"}
      </Button>
      <Link
        href="/anmelden"
        className="self-start text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Zurück zum Anmelden
      </Link>
    </form>
  );
}
