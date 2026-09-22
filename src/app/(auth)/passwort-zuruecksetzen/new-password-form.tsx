"use client";

import { useActionState } from "react";
import { AuthError } from "@/components/auth/auth-error";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { setNewPassword, type NewPasswordState } from "./actions";

const initialState: NewPasswordState = {};

export function NewPasswordForm() {
  const [state, formAction, pending] = useActionState(setNewPassword, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <h2 className="text-[25px] leading-[1.12] font-semibold">Neues Passwort festlegen</h2>
        <p className="mt-2 text-sm text-neutral-700">
          Leg ein neues Passwort für dein Konto fest.
        </p>
      </div>
      {state.error ? <AuthError message={state.error} /> : null}
      <PasswordField
        name="password"
        label="Neues Passwort"
        autoComplete="new-password"
        hint="Mindestens 8 Zeichen."
      />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Wird gespeichert…" : "Passwort speichern"}
      </Button>
    </form>
  );
}
