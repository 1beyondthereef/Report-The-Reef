import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/connect";
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  // Handle error from Supabase
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
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              console.error("Cookie set error:", error);
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

    // Successfully authenticated
    return NextResponse.redirect(`${origin}${next}`);
  }

  // No code provided
  return NextResponse.redirect(`${origin}/login?error=No%20authorization%20code%20provided`);
}
