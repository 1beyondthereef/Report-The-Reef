import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendMessageSchema } from "@/lib/validation";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: otherUserId } = await params;

    // Check if user is blocked
    const { data: blocked } = await supabase
      .from("blocked_users")
      .select("id")
      .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${user.id})`)
      .limit(1);

    if (blocked && blocked.length > 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get other user info
    const { data: otherUser, error: userError } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, vessel_name")
      .eq("id", otherUserId)
      .single();

    if (userError || !otherUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .or(`and(from_user.eq.${user.id},to_user.eq.${otherUserId}),and(from_user.eq.${otherUserId},to_user.eq.${user.id})`)
      .order("created_at", { ascending: true })
      .limit(100);

    if (messagesError) {
      console.error("Get messages error:", messagesError);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    // Mark unread messages as read
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("from_user", otherUserId)
      .eq("to_user", user.id)
      .eq("is_read", false);

    return NextResponse.json({
      user: {
        id: otherUser.id,
        name: otherUser.display_name,
        avatarUrl: otherUser.avatar_url,
        boatName: otherUser.vessel_name,
      },
      messages: (messages || []).map((m) => ({
        id: m.id,
        content: m.content,
        createdAt: m.created_at,
        isMine: m.from_user === user.id,
        isRead: m.is_read,
      })),
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: receiverId } = await params;

    // Check if user is blocked
    const { data: blocked } = await supabase
      .from("blocked_users")
      .select("id")
      .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${receiverId}),and(blocker_id.eq.${receiverId},blocked_id.eq.${user.id})`)
      .limit(1);

    if (blocked && blocked.length > 0) {
      return NextResponse.json(
        { error: "Cannot send message to this user" },
        { status: 403 }
      );
    }

    // Check if receiver exists
    const { data: receiver } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", receiverId)
      .single();

    if (!receiver) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]?.message || "Invalid input";
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      );
    }

    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        from_user: user.id,
        to_user: receiverId,
        content: parsed.data.content,
      })
      .select()
      .single();

    if (error) {
      console.error("Send message error:", error);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.created_at,
        isMine: true,
        isRead: false,
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
