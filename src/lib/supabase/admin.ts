import "server-only";
import { createClient } from "@supabase/supabase-js";

// Supabase-Client MIT dem Secret-Key, der die Zugriffsregeln (RLS) umgeht.
//
// AUSSCHLIESSLICH für die E-Mail-Liste (Newsletter) bestimmt: Die Tabelle
// newsletter_subscriber ist für alle normalen Rollen gesperrt. Jede andere
// Funktion, die erweiterten Zugriff jenseits der normalen Zugriffsregeln
// bräuchte, ist eine eigene, bewusste Entscheidung — dieser Client wird dafür
// nicht ohne Rücksprache wiederverwendet (siehe CLAUDE.md, Sicherheit).
//
// "server-only" bricht den Build ab, falls diese Datei versehentlich in
// Browser-Code eingebunden wird. Der Schlüssel steht nur in .env.local bzw. in
// den Vercel-Umgebungsvariablen, nie im Code oder in Git.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    throw new Error("SUPABASE_SECRET_KEY oder NEXT_PUBLIC_SUPABASE_URL fehlt.");
  }
  return createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
