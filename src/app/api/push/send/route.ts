import { NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/push";
import { withAuth, isAdmin } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

/**
 * POST /api/push/send - Send push notification to a user (admin only).
 * Primary push delivery goes through the shared sendPushNotification()
 * function called directly from server routes. This endpoint exists
 * for admin/testing use only.
 */
export async function POST(request: Request) {
  try {
    const auth = await withAuth();
    if (auth instanceof NextResponse) return auth;
    const { user } = auth;

    if (!isAdmin(user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { recipientUserId, title, body: messageBody, url, tag } = body;

    if (!recipientUserId) {
      return NextResponse.json(
        { error: "Missing recipientUserId" },
        { status: 400 }
      );
    }

    const result = await sendPushNotification({
      recipientUserId,
      title,
      body: messageBody,
      url,
      tag,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ sent: result.sent, failed: result.failed });
  } catch (error) {
    console.error("[Push API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
