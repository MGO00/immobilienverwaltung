"use client";

import { ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { signOut } from "@/app/(app)/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SessionUser = {
  email: string;
  name: string;
};

function initialsFor(user: SessionUser): string {
  const source = user.name.trim() || user.email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function UserMenu({ user }: { user: SessionUser | null }) {
  const [pending, startTransition] = useTransition();

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 border border-border px-2 py-1.5 text-[0.8125rem] hover:bg-[rgba(32,30,29,0.07)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="flex size-6.5 items-center justify-center bg-neutral-900 text-[0.6875rem] font-semibold text-neutral-100">
            {initialsFor(user)}
          </span>
          <span className="hidden whitespace-nowrap md:inline">{user.name}</span>
          <ChevronDown className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-50 rounded-none border border-border bg-background p-0 text-foreground shadow-lg ring-0"
      >
        <DropdownMenuLabel className="rounded-none px-3 py-2 text-[0.8125rem] font-normal">
          <span className="block font-semibold">{user.name}</span>
          <span className="block text-neutral-600">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-0 my-0 bg-border" />
        <DropdownMenuItem
          className="rounded-none px-3 py-2 text-[0.8125rem] focus:bg-neutral-100 focus:text-foreground"
          asChild
        >
          <Link href="/einstellungen">Profil</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={pending}
          className="rounded-none px-3 py-2 text-[0.8125rem] text-foreground focus:bg-neutral-100 focus:text-foreground"
          onSelect={() => startTransition(() => signOut())}
        >
          <LogOut className="size-4" />
          Abmelden
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
