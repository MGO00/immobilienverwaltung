import Link from "next/link";
import { LinkAktion } from "@/components/start/link-aktion";
import { pruefeBestaetigungsToken } from "@/lib/newsletter/token-status";
import { newsletterBestaetigen } from "../actions";

export default async function NewsletterBestaetigenPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const status = await pruefeBestaetigungsToken(token ?? "");

  return (
    <div className="mx-auto max-w-[520px] px-6 py-12">
      <h1 className="text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">E-Mail-Adresse bestätigen</h1>
      {status === "gueltig" && token ? (
        <div className="mt-4">
          <p className="mb-4 text-sm text-neutral-800">
            Ein Klick noch, dann bekommst du einmal im Monat Neuigkeiten zu neuen Rechnern, Ressourcen und Tipps.
          </p>
          <LinkAktion
            aktion={newsletterBestaetigen}
            token={token}
            knopf="Adresse bestätigen"
            erfolgTitel="Geschafft"
            erfolgText="Deine Adresse ist bestätigt. Du kannst dich jederzeit über den Link in jeder E-Mail wieder abmelden."
          />
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-neutral-800">
            {status === "abgelaufen"
              ? "Dieser Link ist abgelaufen. Trag deine Adresse auf der Startseite bitte noch einmal ein."
              : status === "nicht_verfuegbar"
                ? "Das ist gerade nicht möglich. Bitte versuch es später erneut."
                : "Dieser Link ist ungültig oder wurde schon verwendet."}
          </p>
          <Link href="/" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
            Zur Startseite
          </Link>
        </div>
      )}
    </div>
  );
}
