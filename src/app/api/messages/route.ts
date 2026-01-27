import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all messages involving this user
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get conversations error:", error);
      return NextResponse.json(
        { error: "Failed to fetch conversations" },
        { status: 500 }
      );
    }

    // Get unique user IDs from messages
    const userIds = new Set<string>();
    (messages || []).forEach((m) => {
      if (m.from_user !== user.id) userIds.add(m.from_user);
      if (m.to_user !== user.id) userIds.add(m.to_user);
    });

    // Fetch profiles for these users
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, vessel_name")
      .in("id", Array.from(userIds));

    const profilesMap = new Map((profiles || []).map((p) => [p.id, p]));

    // Group messages by conversation partner
    const conversationsMap = new Map<
      string,
      {
        user: {
          id: string;
          name: string | null;
          avatarUrl: string | null;
          boatName: string | null;
        };
        lastMessage: {
          id: string;
          content: string;
          createdAt: string;
          isRead: boolean;
          senderId: string;
        };
        unreadCount: number;
      }
    >();

    for (const message of messages || []) {
      const otherUserId = message.from_user === user.id ? message.to_user : message.from_user;
      const otherProfile = profilesMap.get(otherUserId);

      if (!conversationsMap.has(otherUserId)) {
        const unreadCount = (messages || []).filter(
          (m) =>
            m.from_user === otherUserId && m.to_user === user.id && !m.is_read
        ).length;

        conversationsMap.set(otherUserId, {
          user: {
            id: otherUserId,
            name: otherProfile?.display_name || null,
            avatarUrl: otherProfile?.avatar_url || null,
            boatName: otherProfile?.vessel_name || null,
          },
          lastMessage: {
            id: message.id,
            content: message.content,
            createdAt: message.created_at,
            isRead: message.is_read,
            senderId: message.from_user,
          },
          unreadCount,
        });
      }
    }

    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime()
    );

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
