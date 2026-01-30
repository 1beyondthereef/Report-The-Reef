import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

/**
 * GET /api/connect/unread - Get total unread message count
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
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (!conversations || conversations.length === 0) {
      return NextResponse.json({ unreadCount: 0 });
    }

    const conversationIds = conversations.map(c => c.id);

    // Count unread messages across all conversations
    const { count, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", conversationIds)
      .neq("sender_id", user.id)
      .is("read_at", null);

    if (error) {
      console.error("Error counting unread messages:", error);
      return NextResponse.json(
        { error: "Failed to count unread messages" },
        { status: 500 }
      );
    }

    return NextResponse.json({ unreadCount: count || 0 });
  } catch (error) {
    console.error("Error in GET /api/connect/unread:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
