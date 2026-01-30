import { createBrowserClient } from "@supabase/ssr";

// Custom storage that uses cookies for PKCE code verifier
// This helps with magic link authentication on mobile where
// the link might open in a different browser/app
const cookieStorage = {
  getItem: (key: string): string | null => {
    if (typeof document === "undefined") return null;
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === key) {
        return decodeURIComponent(value);
      }
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof document === "undefined") return;
    // Set cookie with 1 hour expiry for PKCE verifier
    const maxAge = key.includes("code_verifier") ? 3600 : 31536000; // 1 hour for verifier, 1 year for others
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`;
  },
  removeItem: (key: string): void => {
    if (typeof document === "undefined") return;
    document.cookie = `${key}=; path=/; max-age=0`;
  },
};

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: cookieStorage,
        storageKey: "sb-auth",
        flowType: "pkce",
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  );
}
