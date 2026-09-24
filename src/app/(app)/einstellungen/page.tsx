import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { AbmeldenButton } from "@/components/einstellungen/abmelden-button";
import { PasswortFormular } from "@/components/einstellungen/passwort-formular";
import { ProfilFormular } from "@/components/einstellungen/profil-formular";
import { TARIFE } from "@/lib/constants/tarife";
import { getTarifStatus } from "@/lib/data/tarif";
import { createClient } from "@/lib/supabase/server";

// Platzhalter bis zu den Rechtstexten (Meilenstein 5), gleicher Wortlaut wie auf
// der Startseite. Vor dem Livegang echt lösen (siehe CLAUDE.md, "Vor der Veröffentlichung").
const KONTOLOESCHUNG_HINWEIS = "[Platzhalter] Der genaue Ablauf zur Kontolöschung folgt mit den Rechtstexten.";

function Abschnitt({ titel, children }: { titel: string; children: ReactNode }) {
  const id = `abschnitt-${titel.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="border-t border-border pt-6">
      <h2 id={id} className="mb-4 text-[17px] font-semibold">
        {titel}
      </h2>
      {children}
    </section>
  );
}

export default async function EinstellungenPage() {
  const supabase = await createClient();
  const [{ data: userData }, tarifStatus] = await Promise.all([supabase.auth.getUser(), getTarifStatus(supabase)]);
  const user = userData.user;
  const { data: profil } = user
    ? await supabase.from("profile").select("display_name").eq("user_id", user.id).maybeSingle()
    : { data: null };

  const { tarif, immobilien, aktiveInteressenten } = tarifStatus;
  const nutzung = (anzahl: number, grenze: number | null, was: string) =>
    grenze === null ? `${anzahl} ${was}` : `${anzahl} von ${grenze} ${was}`;

  return (
    <div className="px-6 py-8">
      <div className="max-w-[620px]">
        <h1 className="text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">Einstellungen</h1>

        <div className="mt-8 flex flex-col gap-8">
          <Abschnitt titel="Profil">
            <ProfilFormular name={profil?.display_name ?? ""} email={user?.email ?? ""} />
          </Abschnitt>

          <Abschnitt titel="Passwort ändern">
            <PasswortFormular />
          </Abschnitt>

          <Abschnitt titel="Tarif">
            <div className="flex items-center gap-2">
              <span className="font-semibold capitalize">{TARIFE[tarif].label}</span>
              <Badge variant="outline" className="rounded-full border-transparent bg-accent-100 text-accent-800">
                Aktiv
              </Badge>
            </div>
            <ul className="mt-3 flex flex-col gap-1 text-sm text-neutral-700 tabular-nums">
              <li>{nutzung(immobilien.anzahl, immobilien.grenze, "Objekten genutzt")}</li>
              <li>{nutzung(aktiveInteressenten.anzahl, aktiveInteressenten.grenze, "aktiven Interessenten")}</li>
            </ul>
            <p className="mt-3 text-sm text-neutral-600">Größere Tarife sind in Vorbereitung.</p>
          </Abschnitt>

          <Abschnitt titel="Konto">
            <p className="text-sm text-neutral-700">{KONTOLOESCHUNG_HINWEIS}</p>
            <div className="mt-4">
              <AbmeldenButton />
            </div>
          </Abschnitt>
        </div>
      </div>
    </div>
  );
}
