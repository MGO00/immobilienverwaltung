import type { ReactNode } from "react";

// Abschnitt der Startseite: Inhaltsbreite 1120 px, 1-px-Linie oben.
export function Abschnitt({ id, children, ohneLinie = false }: { id?: string; children: ReactNode; ohneLinie?: boolean }) {
  return (
    <section id={id} className={ohneLinie ? "" : "border-t border-border"}>
      <div className="mx-auto max-w-[1120px] px-4 py-11 md:px-6 md:py-16">{children}</div>
    </section>
  );
}

export function AbschnittKopf({ titel, text }: { titel: string; text: string }) {
  return (
    <div className="mb-6 max-w-[620px]">
      <h2 className="text-[21px] font-semibold">{titel}</h2>
      <p className="mt-1.5 text-sm text-neutral-700 text-pretty">{text}</p>
    </div>
  );
}
