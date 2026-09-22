"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AuthError } from "@/components/auth/auth-error";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, type SignInState } from "./actions";

const initialState: SignInState = {};

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
      <PasswordField name="password" autoComplete="current-password" />
      <Link
        href="/passwort-vergessen"
        className="self-start text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Passwort vergessen?
      </Link>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Wird geprüft…" : "Anmelden"}
      </Button>
    </form>
  );
}
