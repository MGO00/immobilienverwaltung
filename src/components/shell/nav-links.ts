import type { LucideIcon } from "lucide-react";
import { Building, Calculator, SlidersHorizontal } from "lucide-react";

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navLinks: NavLink[] = [
  { href: "/uebersicht", label: "Übersicht", icon: Building },
  { href: "/rechner", label: "Rechner", icon: Calculator },
  { href: "/einstellungen", label: "Einstellungen", icon: SlidersHorizontal },
];
