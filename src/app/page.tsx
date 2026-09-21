import { redirect } from "next/navigation";

export default function RootPage() {
  // Solange es kein Login gibt (kommt in Meilenstein 2), führt die
  // Startseite direkt zur Übersicht.
  redirect("/uebersicht");
}
