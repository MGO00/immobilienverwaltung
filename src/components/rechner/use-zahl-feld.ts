"use client";

import { useState } from "react";
import { pruefeZahl, type ZahlRegel } from "@/lib/validation/zahl";

// Zahlenfeld eines Rechners: prüft den Text mit denselben Regeln wie überall
// (pruefeZahl → parseDeZahl). Leer zählt als null (der Rechner nimmt dann 0),
// ungültig ist ungültig — der Rechner zeigt dann "—" statt still mit 0 zu rechnen.
// Die Meldung erscheint erst nach dem Verlassen des Feldes, damit nicht schon beim
// Tippen von "1," (auf dem Weg zu "1,5") eine Fehlermeldung aufblitzt.
export function useZahlFeld(start: string, regel: ZahlRegel) {
  const [text, setText] = useState(start);
  const [verlassen, setVerlassen] = useState(false);
  const pruefung = pruefeZahl(text, regel);

  return {
    wert: pruefung.ok ? pruefung.wert : null,
    ungueltig: !pruefung.ok,
    /** Feld neu vorbefüllen (z. B. beim Wechsel der Einheit), Meldung erst wieder nach Verlassen. */
    setze: (neu: string) => {
      setText(neu);
      setVerlassen(false);
    },
    /** Props für ZahlInput. */
    feld: {
      value: text,
      onChange: setText,
      onBlur: () => setVerlassen(true),
      fehler: verlassen && !pruefung.ok ? pruefung.meldung : null,
    },
  };
}
