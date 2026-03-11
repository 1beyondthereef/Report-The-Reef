import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_ORIGINS = [
  "https://reportthereef.com",
  "https://www.reportthereef.com",
  "https://report-the-reef.vercel.app",
  "http://localhost:3000",
];

function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) return true;

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      return ALLOWED_ORIGINS.includes(refOrigin);
    } catch {}
  }

  return false;
}

export async function POST(request: NextRequest) {
  if (!isValidOrigin(request)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  let body: { confirmation?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (body.confirmation !== "DELETE") {
    return NextResponse.json(
      { error: "Confirmation required. Send { confirmation: \"DELETE\" }." },
      { status: 400 }
    );
  }

  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error("[AccountDelete] Service role key not configured");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  );

  const userId = user.id;

  try {
    // 1. Anonymize incidents (keep records for conservation)
    const { error: e1 } = await adminClient
      .from("incidents")
      .update({
        reporter_id: null,
        contact_name: null,
        contact_email: null,
      })
      .eq("reporter_id", userId);
    if (e1) throw { step: "anonymize_incidents", detail: e1.message };

    // 2. Anonymize wildlife sightings (keep records for conservation)
    const { error: e2 } = await adminClient
      .from("wildlife_sightings")
      .update({
        reporter_id: null,
        reporter_name: null,
        reporter_email: null,
      })
      .eq("reporter_id", userId);
    if (e2) throw { step: "anonymize_wildlife", detail: e2.message };

    // 3. Delete push subscriptions
    const { error: e3 } = await adminClient
      .from("push_subscriptions")
      .delete()
      .eq("user_id", userId);
    if (e3) throw { step: "delete_push_subscriptions", detail: e3.message };

    // 4. Delete user's own messages (other participant's messages stay)
    const { error: e4 } = await adminClient
      .from("chat_messages")
      .delete()
      .eq("sender_id", userId);
    if (e4) throw { step: "delete_chat_messages", detail: e4.message };

    // 5. Delete blocked-user relationships
    const { error: e5a } = await adminClient
      .from("blocked_users")
      .delete()
      .eq("blocker_id", userId);
    if (e5a) throw { step: "delete_blocked_blocker", detail: e5a.message };

    const { error: e5b } = await adminClient
      .from("blocked_users")
      .delete()
      .eq("blocked_id", userId);
    if (e5b) throw { step: "delete_blocked_blocked", detail: e5b.message };

    // 6. Delete check-ins
    const { error: e6 } = await adminClient
      .from("checkins")
      .delete()
      .eq("user_id", userId);
    if (e6) throw { step: "delete_checkins", detail: e6.message };

    // 7. Delete reservations
    const { error: e7 } = await adminClient
      .from("reservations")
      .delete()
      .eq("user_id", userId);
    if (e7) throw { step: "delete_reservations", detail: e7.message };

    // 8. Delete user-filed reports only (not reports filed about them by others)
    const { error: e8 } = await adminClient
      .from("reports")
      .delete()
      .eq("reporter_id", userId);
    if (e8) throw { step: "delete_reports", detail: e8.message };

    // 9. Delete avatar from storage (defensive — don't block on failure)
    try {
      const { data: profile } = await adminClient
        .from("profiles")
        .select("avatar_url")
        .eq("id", userId)
        .maybeSingle();

      if (profile?.avatar_url) {
        const url = profile.avatar_url;
        const marker = "/storage/v1/object/public/avatars/";
        const idx = url.indexOf(marker);
        if (idx !== -1) {
          const storagePath = url.substring(idx + marker.length);
          await adminClient.storage.from("avatars").remove([storagePath]);
        }
      }
    } catch (storageErr) {
      console.warn("[AccountDelete] Avatar cleanup failed (non-blocking):", storageErr);
    }

    // 10. Delete profile
    const { error: e10 } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", userId);
    if (e10) throw { step: "delete_profile", detail: e10.message };

    // 11. Delete auth user
    const { error: e11 } = await adminClient.auth.admin.deleteUser(userId);
    if (e11) throw { step: "delete_auth_user", detail: e11.message };

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const stepErr = err as { step?: string; detail?: string };
    console.error("[AccountDelete] Failed at step:", stepErr.step, stepErr.detail);
    return NextResponse.json(
      {
        error: "Account deletion failed. Please try again.",
        failedStep: stepErr.step,
      },
      { status: 500 }
    );
  }
}
