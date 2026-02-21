import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Register for push notifications
 * Call this after user signs in
 */
export async function registerPushNotifications(
  userId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  // Check browser support
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.log("[Push] Push notifications not supported in this browser");
    return false;
  }

  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("[Push] Notification permission denied");
      return false;
    }

    console.log("[Push] Notification permission granted");

    // Wait for service worker to be ready
    const registration = await navigator.serviceWorker.ready;
    console.log("[Push] Service worker ready");

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Create new subscription
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.error("[Push] VAPID public key not configured");
        return false;
      }

      console.log("[Push] Creating new push subscription...");
      console.log("[Push] VAPID key value:", process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.substring(0, 20) + "...");
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });
      console.log("[Push] Push subscription created");
    } else {
      console.log("[Push] Using existing push subscription");
    }

    // Save subscription to Supabase
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: userId,
        subscription: subscription.toJSON(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) {
      console.error("[Push] Error saving push subscription:", error);
      return false;
    }

    console.log("[Push] Push subscription saved successfully");
    return true;
  } catch (error) {
    console.error("[Push] Error registering push notifications:", error);
    return false;
  }
}

/**
 * Unregister push notifications
 * Call this when user signs out or disables notifications
 */
export async function unregisterPushNotifications(
  userId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log("[Push] Unsubscribed from push notifications");
    }

    // Remove subscription from database
    await supabase.from("push_subscriptions").delete().eq("user_id", userId);

    console.log("[Push] Push subscription removed from database");
    return true;
  } catch (error) {
    console.error("[Push] Error unregistering push notifications:", error);
    return false;
  }
}

/**
 * Check if push notifications are supported and enabled
 */
export function isPushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window;
}

/**
 * Check current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
