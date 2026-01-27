import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

// Users are considered "online" if they've been seen in the last 5 minutes
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const onlineThreshold = new Date(Date.now() - ONLINE_THRESHOLD_MS).toISOString();

    // Get list of blocked users (both directions)
    const { data: blocked } = await supabase
      .from("blocked_users")
      .select("blocker_id, blocked_id")
      .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);

    const blockedIds = (blocked || []).flatMap((b) => [b.blocker_id, b.blocked_id]);
    const uniqueBlockedIds = Array.from(new Set(blockedIds)).filter(
      (id) => id !== user.id
    );

    // Get users who:
    // 1. Have opted in to show on map
    // 2. Have a location set
    // 3. Are not blocked
    let query = supabase
      .from("profiles")
      .select("id, display_name, avatar_url, vessel_name, home_port, latitude, longitude, last_seen")
      .eq("show_on_map", true)
      .not("latitude", "is", null)
      .not("longitude", "is", null);

    // Exclude blocked users if any
    if (uniqueBlockedIds.length > 0) {
      query = query.not("id", "in", `(${uniqueBlockedIds.join(",")})`);
    }

    const { data: onlineUsers, error } = await query;

    if (error) {
      console.error("Get online users error:", error);
      return NextResponse.json(
        { error: "Failed to fetch online users" },
        { status: 500 }
      );
    }

    // Add online status based on lastSeen and map to expected format
    const usersWithStatus = (onlineUsers || []).map((u) => ({
      id: u.id,
      name: u.display_name,
      avatarUrl: u.avatar_url,
      boatName: u.vessel_name,
      homePort: u.home_port,
      latitude: u.latitude,
      longitude: u.longitude,
      lastSeen: u.last_seen,
      isOnline: u.last_seen ? new Date(u.last_seen) >= new Date(onlineThreshold) : false,
      isCurrentUser: u.id === user.id,
    }));

    return NextResponse.json({ users: usersWithStatus });
  } catch (error) {
    console.error("Get online users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch online users" },
      { status: 500 }
    );
  }
}
