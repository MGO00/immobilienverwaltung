import type { SessionUser } from "@/components/shell/user-menu";
import { createClient } from "@/lib/supabase/server";

// Liest den angemeldeten Nutzer samt Anzeigenamen. Gibt null zurück, wenn
// niemand angemeldet ist. Gemeinsam genutzt vom (app)- und vom (rechner)-Layout.
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profile")
    .select("display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  return { email: user.email ?? "", name: profile?.display_name ?? user.email ?? "" };
}
