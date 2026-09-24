"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/(app)/actions";

export function AbmeldenButton() {
  const [pending, startTransition] = useTransition();
  return (
    <Button type="button" variant="outline" disabled={pending} onClick={() => startTransition(() => signOut())}>
      <LogOut className="size-4" />
      {pending ? "Wird abgemeldet …" : "Abmelden"}
    </Button>
  );
}
