"use client";

import { useSyncExternalStore } from "react";
import { lokalesIsoDatum } from "@/lib/datum";

const keineAenderung = () => () => {};

/**
 * Das heutige Datum im Browser (lokal, als ISO-Text). Auf dem Server und beim ersten
 * Rendern null: So rendern Server und Browser gleich (kein Hydration-Unterschied), und
 * das Datum stammt aus der Zeitzone des Nutzers, nicht aus der des Servers.
 */
export function useHeute(): string | null {
  return useSyncExternalStore(keineAenderung, () => lokalesIsoDatum(), () => null);
}
