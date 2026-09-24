import { LinkAktion } from "@/components/start/link-aktion";
import { newsletterAbmelden } from "../actions";

export default async function NewsletterAbmeldenPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto max-w-[520px] px-6 py-12">
      <h1 className="text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">Von der E-Mail-Liste abmelden</h1>
      <div className="mt-4">
        <p className="mb-4 text-sm text-neutral-800">
          Mit einem Klick entfernst du deine Adresse von der Liste. Danach bekommst du keine E-Mails mehr von uns.
        </p>
        {token ? (
          <LinkAktion
            aktion={newsletterAbmelden}
            token={token}
            knopf="Abmelden"
            erfolgTitel="Du bist abgemeldet"
            erfolgText="Deine Adresse steht nicht mehr auf der Liste."
          />
        ) : (
          <p className="text-[13px] text-error">Dieser Link ist ungültig.</p>
        )}
      </div>
    </div>
  );
}
