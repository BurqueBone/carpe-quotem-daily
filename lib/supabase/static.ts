import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client for build-time data fetching (generateStaticParams, sitemap, etc.)
// Does NOT use cookies — safe to call outside request scope.
export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
