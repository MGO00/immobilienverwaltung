import { ResendForm } from "./resend-form";

export default async function EmailBestaetigenPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[25px] leading-[1.12] font-semibold">E-Mail bestätigen</h2>
        <p className="mt-2 text-pretty text-sm text-neutral-700">
          Wir haben eine Nachricht an{" "}
          <strong className="font-semibold">{email ?? "deine E-Mail-Adresse"}</strong> geschickt.
          Klick auf den Link darin, dann kann es losgehen.
        </p>
      </div>
      <ResendForm email={email ?? ""} />
    </div>
  );
}
