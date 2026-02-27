import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

interface SendPushOptions {
  recipientUserId: string;
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
}

interface SendPushResult {
  sent: number;
  failed: number;
  error?: string;
}

/**
 * Send a push notification directly (server-side only).
 * Call this from any API route — no HTTP fetch needed.
 */
export async function sendPushNotification(options: SendPushOptions): Promise<SendPushResult> {
  const { recipientUserId, title, body: messageBody, url, tag } = options;

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY?.trim();

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.error("[Push] VAPID keys not configured");
    return { sent: 0, failed: 0, error: "Push notifications not configured" };
  }

  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseServiceKey) {
    console.error("[Push] Service role key not configured");
    return { sent: 0, failed: 0, error: "Server configuration error" };
  }

  webpush.setVapidDetails(
    "mailto:admin@reportthereef.com",
    vapidPublicKey,
    vapidPrivateKey
  );

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseServiceKey
  );

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("subscription")
    .eq("user_id", recipientUserId);

  if (error) {
    console.error("[Push] Error fetching subscriptions:", error);
    return { sent: 0, failed: 0, error: "Failed to fetch subscriptions" };
  }

  if (!subscriptions?.length) {
    return { sent: 0, failed: 0 };
  }

  const payload = JSON.stringify({
    title: title || "New Message",
    body: messageBody || "You have a new message on Report The Reef",
    url: url || "/connect",
    tag: tag || `message-${Date.now()}`,
  });

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub.subscription, payload);
      sent++;
    } catch (err: unknown) {
      const pushError = err as { statusCode?: number };
      console.error("[Push] Error sending notification:", err);

      if (pushError.statusCode === 410) {
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

  return { sent, failed };
}
