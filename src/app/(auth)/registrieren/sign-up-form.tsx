"use client";

import { useActionState } from "react";
import { AuthError } from "@/components/auth/auth-error";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp, type SignUpState } from "./actions";

const initialState: SignUpState = {};

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <AuthError message={state.error} /> : null}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" type="text" autoComplete="name" required />
      </div>
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
      <PasswordField name="password" autoComplete="new-password" hint="Mindestens 8 Zeichen." />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Wird angelegt…" : "Konto erstellen"}
      </Button>
      <p className="text-pretty text-xs text-neutral-700">
        Mit dem Anlegen des Kontos stimmst du den{" "}
        <a href="#agb" className="text-primary hover:underline">
          AGB
        </a>{" "}
        zu. Wie wir mit deinen Daten umgehen, steht in der{" "}
        <a href="#datenschutz" className="text-primary hover:underline">
          Datenschutzerklärung
        </a>
        .
      </p>
    </form>
  );
}
