import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/connect";
  const error_description = searchParams.get("error_description");

  // Handle Supabase error responses
  if (error_description) {
    console.error("Auth callback error from Supabase:", error_description);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error_description)}`
    );
  }

  const supabase = await createClient();

  // Handle PKCE flow (code exchange) - This is the default for Supabase
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successfully authenticated, redirect to the next page
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("Code exchange error:", error.message);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // Handle magic link token hash flow (legacy/email confirmation)
  if (token_hash && type) {
    // For magic links, use type "email" or "magiclink"
    const otpType = type === "magiclink" || type === "email" ? "email" : type;

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: otpType as "email" | "magiclink",
    });

    if (!error) {
      // Successfully authenticated, redirect to the next page
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("Token verification error:", error.message);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // No code or token_hash provided
  console.error("Auth callback called without code or token_hash");
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
