import { NextRequest, NextResponse } from "next/server";
import { createMagicLink, sendMagicLinkEmail } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]?.message || "Invalid input";
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Create magic link
    const token = await createMagicLink(normalizedEmail);

    // Send email
    const sent = await sendMagicLinkEmail(normalizedEmail, token);

    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send magic link. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Check your email for a magic link to sign in.",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
