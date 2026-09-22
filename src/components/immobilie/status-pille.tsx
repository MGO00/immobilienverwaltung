import { Badge } from "@/components/ui/badge";
import type { EinheitStatus } from "@/lib/validation/immobilie";

const STATUS_LABEL: Record<EinheitStatus, string> = {
  vermietet: "vermietet",
  selbstgenutzt: "selbstgenutzt",
  leer: "leer",
};

// "leer" wird petrolfarben hervorgehoben, damit Leerstand sofort auffällt;
// die anderen beiden Zustände bleiben neutral in Tinte (Petrol bleibt sonst
// Primäraktionen, Links und der einen Hauptzahl je Rechner vorbehalten).
export function StatusPille({ status }: { status: EinheitStatus }) {
  return (
    <Badge
      variant={status === "leer" ? "default" : "outline"}
      className={
        status === "leer"
          ? "rounded-full bg-accent-100 text-accent-800"
          : "rounded-full border-border bg-transparent text-foreground"
      }
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
}
