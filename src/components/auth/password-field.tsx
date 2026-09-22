"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PasswordFieldProps = {
  name: string;
  label?: string;
  autoComplete?: "current-password" | "new-password";
  hint?: string;
};

export function PasswordField({
  name,
  label = "Passwort",
  autoComplete = "current-password",
  hint,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-stretch">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          className="border-r-0"
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="shrink-0 whitespace-nowrap border border-input bg-neutral-200 px-2.5 text-xs font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {visible ? "Verbergen" : "Anzeigen"}
        </button>
      </div>
      {hint ? <p className="text-xs text-neutral-700">{hint}</p> : null}
    </div>
  );
}
