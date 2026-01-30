import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Use implicit flow for magic links to avoid PKCE code verifier issues
        // when the link opens in a different browser/app (common on mobile)
        flowType: "implicit",
        // Detect session from URL hash (for implicit flow)
        detectSessionInUrl: true,
        // Persist session in cookies
        persistSession: true,
        // Auto refresh token before expiry
        autoRefreshToken: true,
      },
      cookieOptions: {
        // Ensure cookies work across the site
        path: "/",
        // Use secure cookies in production
        secure: process.env.NODE_ENV === "production",
        // Allow cookies to be sent with same-site requests
        sameSite: "lax",
        // Cookie lifetime (1 year)
        maxAge: 60 * 60 * 24 * 365,
      },
    }
  );
}
