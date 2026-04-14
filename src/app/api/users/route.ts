import { NextRequest, NextResponse } from "next/server";
import { withAuth, getBlockedUserIds } from "@/lib/api-helpers";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await withAuth();
    if (auth instanceof NextResponse) return auth;
    const { supabase, user } = auth;

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const uniqueBlockedIds = await getBlockedUserIds(supabase, user.id);

    let query = supabase
      .from("profiles")
      .select("id, display_name, avatar_url, vessel_name, home_port, bio", { count: "exact" })
      .neq("id", user.id);

    // Exclude blocked users if any
    if (uniqueBlockedIds.length > 0) {
      query = query.not("id", "in", `(${uniqueBlockedIds.join(",")})`);
    }

    if (search) {
      const sanitized = search
        .replace(/[%_,()\\]/g, "")
        .trim()
        .slice(0, 100);
      if (sanitized) {
        const pattern = `%${sanitized}%`;
        query = query.or(
          `display_name.ilike.${pattern},vessel_name.ilike.${pattern},home_port.ilike.${pattern}`
        );
      }
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
