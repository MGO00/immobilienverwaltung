import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Wird aus einer Server Component aufgerufen, die keine Cookies
            // schreiben darf. Der Proxy (src/proxy.ts) frischt die Session bei
            // jedem Request ohnehin auf, daher ist das hier unkritisch.
          }
        },
      },
    },
  );
}
