import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface PushRequest {
  recipientUserId: string;
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
}

/**
 * POST /api/push/send - Send push notification to a user
 * This endpoint is called when a new message is sent
 */
export async function POST(request: Request) {
  try {
    // Check VAPID configuration at runtime (not build time)
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error("[Push API] VAPID keys not configured");
      return NextResponse.json(
        { error: "Push notifications not configured" },
        { status: 500 }
      );
    }

    // Configure web-push with VAPID details (must be inside handler, not at module level)
    webpush.setVapidDetails(
      "mailto:admin@reportthereef.com",
      vapidPublicKey,
      vapidPrivateKey
    );

    const body: PushRequest = await request.json();
    const { recipientUserId, title, body: messageBody, url, tag } = body;

    if (!recipientUserId) {
      return NextResponse.json(
        { error: "Missing recipientUserId" },
        { status: 400 }
      );
    }

    // Use service role key to read all subscriptions
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseServiceKey) {
      console.error("[Push API] Service role key not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseServiceKey
    );

    // Get user's push subscriptions
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", recipientUserId);

    if (error) {
      console.error("[Push API] Error fetching subscriptions:", error);
      return NextResponse.json(
        { error: "Failed to fetch subscriptions" },
        { status: 500 }
      );
    }

    if (!subscriptions?.length) {
      console.log("[Push API] No subscriptions found for user:", recipientUserId);
      return NextResponse.json({ sent: 0, message: "No subscriptions found" });
    }

    console.log(`[Push API] Sending to ${subscriptions.length} subscription(s)`);

    // Prepare notification payload
    const payload = JSON.stringify({
      title: title || "New Message",
      body: messageBody || "You have a new message on Report The Reef",
      url: url || "/connect",
      tag: tag || `message-${Date.now()}`,
    });

    // Send to all subscriptions
    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(sub.subscription, payload);
        sent++;
        console.log("[Push API] Notification sent successfully");
      } catch (err: unknown) {
        const error = err as { statusCode?: number };
        console.error("[Push API] Error sending notification:", err);

        // If subscription is expired (410 Gone), remove it
        if (error.statusCode === 410) {
          console.log("[Push API] Removing expired subscription");
          await supabase
            .from("push_subscriptions")
            .delete()
            .match({
              user_id: recipientUserId,
              subscription: sub.subscription,
            });
        }
        failed++;
      }
    }

    console.log(`[Push API] Sent: ${sent}, Failed: ${failed}`);
    return NextResponse.json({ sent, failed });
  } catch (error) {
    console.error("[Push API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
