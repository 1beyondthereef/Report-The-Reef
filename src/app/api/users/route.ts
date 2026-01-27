import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Get list of blocked users (both directions)
    const { data: blocked } = await supabase
      .from("blocked_users")
      .select("blocker_id, blocked_id")
      .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);

    const blockedIds = (blocked || []).flatMap((b) => [b.blocker_id, b.blocked_id]);
    const uniqueBlockedIds = Array.from(new Set(blockedIds)).filter((id) => id !== user.id);

    // Build query
    let query = supabase
      .from("profiles")
      .select("id, display_name, avatar_url, vessel_name, home_port, bio", { count: "exact" })
      .neq("id", user.id);

    // Exclude blocked users if any
    if (uniqueBlockedIds.length > 0) {
      query = query.not("id", "in", `(${uniqueBlockedIds.join(",")})`);
    }

    // Apply search filter
    if (search) {
      query = query.or(`display_name.ilike.%${search}%,vessel_name.ilike.%${search}%,home_port.ilike.%${search}%`);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.order("display_name", { ascending: true }).range(offset, offset + limit - 1);

    const { data: profiles, error, count } = await query;

    if (error) {
      console.error("Get users error:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    // Map to expected format
    const users = (profiles || []).map((p) => ({
      id: p.id,
      name: p.display_name,
      avatarUrl: p.avatar_url,
      boatName: p.vessel_name,
      homePort: p.home_port,
      bio: p.bio,
    }));

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
