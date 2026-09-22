import type { SupabaseClient } from "@supabase/supabase-js";

// MVP: ein Nutzer gehört genau zu einem Konto (siehe CLAUDE.md,
// "mehrere Nutzer pro Konto" ist ausdrücklich nicht im Umfang). Später bei
// mehreren Mitgliedschaften müsste hier ausgewählt werden, welches Konto
// gemeint ist.
export async function getCurrentAccountId(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("account_member")
    .select("account_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  return data?.account_id ?? null;
}
