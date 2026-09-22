"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AuthError } from "@/components/auth/auth-error";
import { Button } from "@/components/ui/button";
import { resendConfirmationEmail, type ResendState } from "./actions";

const initialState: ResendState = {};

export function ResendForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(resendConfirmationEmail, initialState);

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-2">
      <form action={formAction} className="flex flex-col gap-2">
        <input type="hidden" name="email" value={email} />
        {state.error ? <AuthError message={state.error} /> : null}
        <Button type="submit" variant="outline" disabled={pending} className="w-full">
          {pending ? "Wird gesendet…" : "E-Mail erneut senden"}
        </Button>
      </form>
      {state.sent ? <p className="text-[13px] text-foreground">Neue E-Mail ist unterwegs.</p> : null}
      <Link
        href="/anmelden"
        className="self-start text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Andere Adresse verwenden
      </Link>
    </div>
  );
}
