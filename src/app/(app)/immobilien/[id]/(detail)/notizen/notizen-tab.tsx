"use client";

import { useActionState, useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { NotizZeile } from "@/lib/data/immobilie-detail";
import { notizHinzufuegen, type NotizState } from "./actions";

const initialState: NotizState = {};

export function NotizenTab({ propertyId, notizen }: { propertyId: string; notizen: NotizZeile[] }) {
  const action = notizHinzufuegen.bind(null, propertyId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state.error]);

  return (
    <div className="flex flex-col gap-6">
      <form ref={formRef} action={formAction} className="flex flex-col gap-2">
        <label htmlFor="notiz-text" className="text-sm font-medium">
          Neue Notiz
        </label>
        <textarea
          id="notiz-text"
          name="text"
          rows={3}
          placeholder="Termine, Absprachen mit Mietern, offene Reparaturen …"
          className="w-full border border-input bg-transparent p-2.5 text-sm outline-none focus-visible:border-ring"
        />
        {state.error && (
          <div className="flex items-start gap-2 border border-error-border bg-error-bg p-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" />
            <p className="text-[13px] text-error">{state.error}</p>
          </div>
        )}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Wird gespeichert…" : "Notiz speichern"}
        </Button>
      </form>

      <div className="flex flex-col gap-3">
        {notizen.length === 0 ? (
          <p className="text-sm text-neutral-600">Noch keine Notizen zu dieser Immobilie.</p>
        ) : (
          notizen.map((notiz) => (
            <div key={notiz.id} className="border-b border-border pb-3">
              <p className="text-sm whitespace-pre-wrap">{notiz.text}</p>
              <p className="mt-1 text-xs text-neutral-600">{formatDate(new Date(notiz.createdAt))}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
