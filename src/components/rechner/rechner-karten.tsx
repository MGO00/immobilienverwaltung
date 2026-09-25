import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RECHNER_LISTE } from "@/lib/rechner/liste";

export function RechnerKarten({ immobilieId, interessentId }: { immobilieId?: string; interessentId?: string }) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Beim Interessenten nur Rechner, die ohne Mietvertrag Sinn ergeben (nicht: Mieterhöhung). */}
      {RECHNER_LISTE.filter((rechner) => !interessentId || rechner.mitInteressent).map((rechner) => {
        const href = immobilieId
          ? `/rechner/${rechner.slug}?immobilie=${immobilieId}`
          : interessentId
            ? `/rechner/${rechner.slug}?interessent=${interessentId}`
            : `/rechner/${rechner.slug}`;
        return (
          <div key={rechner.nr} className="border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-600">{rechner.nr}</span>
              <Badge variant="outline" className="text-neutral-600">
                Bereit
              </Badge>
            </div>
            <p className="mt-2 font-semibold">{rechner.titel}</p>
            <p className="mt-1 text-sm text-neutral-600">{rechner.karte}</p>
            <Button asChild variant="outline" className="mt-3">
              <Link href={href}>Rechner öffnen</Link>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
