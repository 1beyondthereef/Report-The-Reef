import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// Users are considered "online" if they've been seen in the last 5 minutes
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const onlineThreshold = new Date(Date.now() - ONLINE_THRESHOLD_MS);

    // Get list of blocked users (both directions)
    const blocked = await db.blockedUser.findMany({
      where: {
        OR: [{ blockerId: user.id }, { blockedId: user.id }],
      },
      select: {
        blockerId: true,
        blockedId: true,
      },
    });

    const blockedIds = blocked.flatMap((b) => [b.blockerId, b.blockedId]);
    const uniqueBlockedIds = Array.from(new Set(blockedIds)).filter(
      (id) => id !== user.id
    );

    // Get users who:
    // 1. Have opted in to show on map
    // 2. Have a location set
    // 3. Are not blocked
    // 4. Are verified
    const onlineUsers = await db.user.findMany({
      where: {
        showOnMap: true,
        latitude: { not: null },
        longitude: { not: null },
        id: { notIn: uniqueBlockedIds },
        isVerified: true,
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        boatName: true,
        homePort: true,
        latitude: true,
        longitude: true,
        lastSeen: true,
      },
    });

    // Add online status based on lastSeen
    const usersWithStatus = onlineUsers.map((u) => ({
      ...u,
      isOnline: u.lastSeen ? new Date(u.lastSeen) >= onlineThreshold : false,
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
