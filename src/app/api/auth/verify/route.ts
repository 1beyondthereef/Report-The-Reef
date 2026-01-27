import { NextRequest, NextResponse } from "next/server";
import { authenticateWithMagicLink } from "@/lib/auth";
import { verifySchema } from "@/lib/validation";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    const parsed = verifySchema.safeParse({ token });
    if (!parsed.success) {
      return NextResponse.redirect(
        new URL("/login?error=invalid_token", request.url)
      );
    }

    const result = await authenticateWithMagicLink(parsed.data.token);

    if (!result.success) {
      const errorMessage = encodeURIComponent(result.error || "Verification failed");
      return NextResponse.redirect(
        new URL(`/login?error=${errorMessage}`, request.url)
      );
    }

    // Redirect to home page on success
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.redirect(
      new URL("/login?error=verification_failed", request.url)
    );
  }
}
