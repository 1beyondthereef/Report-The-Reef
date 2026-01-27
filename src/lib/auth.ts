import { v4 as uuidv4 } from "uuid";
import { db } from "./db";
import { MAGIC_LINK_DURATION_MS } from "./constants";
import { createSession } from "./session";

export async function createMagicLink(email: string): Promise<string> {
  // Invalidate any existing magic links for this email
  await db.magicLink.updateMany({
    where: { email, used: false },
    data: { used: true },
  });

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + MAGIC_LINK_DURATION_MS);

  await db.magicLink.create({
    data: {
      email,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function verifyMagicLink(token: string): Promise<{ success: boolean; email?: string; error?: string }> {
  const magicLink = await db.magicLink.findUnique({
    where: { token },
  });

  if (!magicLink) {
    return { success: false, error: "Invalid or expired link" };
  }

  if (magicLink.used) {
    return { success: false, error: "This link has already been used" };
  }

  if (magicLink.expiresAt < new Date()) {
    return { success: false, error: "This link has expired" };
  }

  // Mark as used
  await db.magicLink.update({
    where: { id: magicLink.id },
    data: { used: true },
  });

  return { success: true, email: magicLink.email };
}

export async function authenticateWithMagicLink(token: string): Promise<{
  success: boolean;
  sessionToken?: string;
  user?: { id: string; email: string; name: string | null };
  error?: string;
}> {
  const verification = await verifyMagicLink(token);

  if (!verification.success || !verification.email) {
    return { success: false, error: verification.error };
  }

  // Find or create user
  let user = await db.user.findUnique({
    where: { email: verification.email },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        email: verification.email,
        isVerified: true,
      },
    });
  } else if (!user.isVerified) {
    user = await db.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });
  }

  // Create session
  const sessionToken = await createSession(user.id);

  return {
    success: true,
    sessionToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}

export async function sendMagicLinkEmail(email: string, token: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify?token=${token}`;

  // In development, just log the link
  if (process.env.NODE_ENV === "development") {
    console.log("\n========================================");
    console.log("MAGIC LINK FOR:", email);
    console.log("VERIFY URL:", verifyUrl);
    console.log("========================================\n");
    return true;
  }

  // In production, use Resend or another email service
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured");
    // Fall back to logging
    console.log("\n========================================");
    console.log("MAGIC LINK FOR:", email);
    console.log("VERIFY URL:", verifyUrl);
    console.log("========================================\n");
    return true;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Report The Reef <noreply@reportthereef.com>",
        to: email,
        subject: "Sign in to Report The Reef",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #14b8a6;">Report The Reef</h1>
            <p>Click the button below to sign in to your account:</p>
            <a href="${verifyUrl}"
               style="display: inline-block; background-color: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
              Sign In
            </a>
            <p style="color: #666; font-size: 14px;">
              This link will expire in 15 minutes. If you didn't request this email, you can safely ignore it.
            </p>
            <p style="color: #666; font-size: 12px;">
              Or copy and paste this URL into your browser:<br>
              ${verifyUrl}
            </p>
          </div>
        `,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to send magic link email:", error);
    return false;
  }
}

export async function cleanExpiredMagicLinks() {
  await db.magicLink.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { used: true, createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      ],
    },
  });
}
