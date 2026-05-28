import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for admin/server-side operations.
 *
 * Bypasses the Next.js 14 App Router fetch cache by setting
 * `cache: 'no-store'` on every internal fetch the Supabase client makes.
 * Without this override, the Supabase JS client's internal `fetch()` calls
 * are cached by Next.js's default fetch caching, which causes admin reads
 * to return stale snapshots that don't reflect recent inserts/updates.
 *
 * Use this for any admin/service-role read route. For write routes
 * (POST/PATCH/DELETE) the cache override is harmless but not required.
 *
 * Throws if the required env vars are missing so misconfiguration is loud.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      "[admin client] NEXT_PUBLIC_SUPABASE_URL is not set",
    );
  }
  if (!serviceKey) {
    throw new Error(
      "[admin client] SUPABASE_SERVICE_ROLE_KEY is not set",
    );
  }

  return createClient(url, serviceKey, {
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
