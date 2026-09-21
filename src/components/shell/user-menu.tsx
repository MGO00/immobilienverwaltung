"use client";

import { ChevronDown, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// PLATZHALTER für Meilenstein 1: Es gibt noch kein Login (kommt in
// Meilenstein 2), daher zeigt das Nutzermenü einen Beispielnutzer.
// Name, E-Mail und Initialen sind erfunden, keine echten Daten.
const PLACEHOLDER_USER = {
  name: "Max Mustermann",
  email: "max.mustermann@beispiel.de",
  initials: "MM",
};

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 border border-border px-2 py-1.5 text-[0.8125rem] hover:bg-[rgba(32,30,29,0.07)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="flex size-6.5 items-center justify-center bg-neutral-900 text-[0.6875rem] font-semibold text-neutral-100">
            {PLACEHOLDER_USER.initials}
          </span>
          <span className="hidden whitespace-nowrap md:inline">
            {PLACEHOLDER_USER.name}
          </span>
          <ChevronDown className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-50 rounded-none border border-border bg-background p-0 text-foreground shadow-lg ring-0"
      >
        <DropdownMenuLabel className="rounded-none px-3 py-2 text-[0.8125rem] font-normal">
          <span className="block font-semibold">{PLACEHOLDER_USER.name}</span>
          <span className="block text-neutral-600">{PLACEHOLDER_USER.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-0 my-0 bg-border" />
        <DropdownMenuItem className="rounded-none px-3 py-2 text-[0.8125rem] focus:bg-neutral-100 focus:text-foreground">
          Profil
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-none px-3 py-2 text-[0.8125rem] text-foreground focus:bg-neutral-100 focus:text-foreground">
          <LogOut className="size-4" />
          Abmelden
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
