import { Badge } from "@/components/ui/badge";
import { INTERESSENT_STATUS_LABEL, type InteressentStatus } from "@/lib/constants/interessent";
import { cn } from "@/lib/utils";

// Nur vorhandene Farb-Tokens: offene Status neutral bzw. petrolfarben getönt
// (Fortschritt), "gekauft" in Tinte gefüllt, "abgelehnt" neutral und zurückhaltend.
const STIL: Record<InteressentStatus, string> = {
  beobachtet: "border-border bg-transparent text-foreground",
  besichtigt: "border-transparent bg-accent-100 text-accent-800",
  angebot_abgegeben: "border-transparent bg-accent-100 text-accent-800",
  gekauft: "border-transparent bg-foreground text-background",
  abgelehnt: "border-border bg-transparent text-neutral-600",
};

export function InteressentStatusPille({ status, gross = false }: { status: InteressentStatus; gross?: boolean }) {
  return (
    <Badge variant="outline" className={cn("rounded-full", STIL[status], gross && "h-7 px-3 text-sm font-semibold")}>
      {INTERESSENT_STATUS_LABEL[status]}
    </Badge>
  );
}
