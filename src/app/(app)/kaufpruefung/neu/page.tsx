import { InteressentFormular } from "@/components/kaufpruefung/interessent-formular";
import { interessentAnlegen } from "../actions";

export default function InteressentNeuPage() {
  return (
    <div className="px-6 py-8">
      <InteressentFormular
        initial={null}
        titel="Interessent hinzufügen"
        speichernLabel="Speichern"
        abbrechenHref="/kaufpruefung"
        onSpeichern={interessentAnlegen}
      />
    </div>
  );
}
