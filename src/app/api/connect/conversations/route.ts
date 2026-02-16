import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

/**
 * GET /api/connect/conversations - Get all conversations for current user
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get all conversations where user is a participant
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(`
        id,
        user1_id,
        user2_id,
        created_at,
        updated_at
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      return NextResponse.json(
        { error: "Failed to fetch conversations" },
        { status: 500 }
      );
    }

    // Get blocked users to filter out
    const { data: blockedUsers } = await supabase
      .from("blocked_users")
      .select("blocked_id")
      .eq("blocker_id", user.id);

    const blockedIds = new Set(blockedUsers?.map(b => b.blocked_id) || []);

    // Get profiles and last message for each conversation
    const conversationsWithDetails = await Promise.all(
      (conversations || []).map(async (conv) => {
        const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;

        // Skip blocked users
        if (blockedIds.has(otherUserId)) {
          return null;
        }

        // Get other user's profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, display_name, boat_name, vessel_name, avatar_url")
          .eq("id", otherUserId)
          .single();

        // Get last message
        const { data: lastMessage } = await supabase
          .from("chat_messages")
          .select("id, content, sender_id, created_at, read_at")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Get unread count
        const { count: unreadCount } = await supabase
          .from("chat_messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", user.id)
          .is("read_at", null);

        return {
          id: conv.id,
          otherUser: profile,
          lastMessage,
          unreadCount: unreadCount || 0,
          updatedAt: conv.updated_at,
        };
      })
    );

    // Filter out null values (blocked users)
    const filteredConversations = conversationsWithDetails.filter(c => c !== null);

    return NextResponse.json({ conversations: filteredConversations });
  } catch (error) {
    console.error("Error in GET /api/connect/conversations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/connect/conversations - Create or get conversation with another user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (userId === user.id) {
      return NextResponse.json(
        { error: "Cannot start conversation with yourself" },
        { status: 400 }
      );
    }

    // Check if user is blocked
    const { data: blocked } = await supabase
      .from("blocked_users")
      .select("id")
      .or(`blocker_id.eq.${user.id},blocker_id.eq.${userId}`)
      .or(`blocked_id.eq.${user.id},blocked_id.eq.${userId}`)
      .limit(1)
      .single();

    if (blocked) {
      return NextResponse.json(
        { error: "Cannot message this user" },
        { status: 403 }
      );
    }

    // Check if other user has an active check-in
    const { data: otherCheckin } = await supabase
      .from("checkins")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .single();

    if (!otherCheckin) {
      return NextResponse.json(
        { error: "This user is not currently checked in" },
        { status: 400 }
      );
    }

    // Get or create conversation using the database function
    const { data: conversationId, error: funcError } = await supabase
      .rpc("get_or_create_conversation", {
        p_user1_id: user.id,
        p_user2_id: userId,
      });

    if (funcError) {
      console.error("Error creating conversation:", funcError);
      return NextResponse.json(
        { error: "Failed to create conversation" },
        { status: 500 }
      );
    }

    // Get the conversation with details
    const { data: conversation, error: fetchError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (fetchError) {
      console.error("Error fetching conversation:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch conversation" },
        { status: 500 }
      );
    }

    // Get other user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, display_name, boat_name, vessel_name, avatar_url")
      .eq("id", userId)
      .single();

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        otherUser: profile,
        unreadCount: 0,
        updatedAt: conversation.updated_at,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/connect/conversations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
