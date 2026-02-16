import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/connect";
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  // Handle error from Supabase OAuth
  if (error) {
    console.error("Auth error:", error, error_description);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error_description || error)}`
    );
  }

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              console.error("Cookie set error:", error);
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch (error) {
              console.error("Cookie remove error:", error);
            }
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Code exchange error:", exchangeError.message);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }

    // Check if user has a complete profile
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Try to auto-set display_name from Google OAuth data if not already set
        const googleName = user.user_metadata?.full_name || user.user_metadata?.name;
        if (googleName) {
          await supabase
            .from("profiles")
            .update({ display_name: googleName })
            .eq("id", user.id)
            .is("display_name", null);
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("display_name, username")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile check error:", profileError);
        }

        // If no profile or missing required fields, redirect to profile setup
        if (!profile || !profile.display_name || !profile.username) {
          return NextResponse.redirect(`${origin}/profile/setup`);
        }
      }
    } catch (profileCheckError) {
      console.error("Error checking profile:", profileCheckError);
      // Continue to default redirect even if profile check fails
    }

    // Successfully authenticated with complete profile
    return NextResponse.redirect(`${origin}${next}`);
  }

  // No code provided
  return NextResponse.redirect(`${origin}/login?error=No%20authorization%20code%20provided`);
}
