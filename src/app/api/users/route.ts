import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

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
    const uniqueBlockedIds = Array.from(new Set(blockedIds)).filter((id) => id !== user.id);

    const where: Record<string, unknown> = {
      id: { notIn: [user.id, ...uniqueBlockedIds] },
      isVerified: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { boatName: { contains: search } },
        { homePort: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          boatName: true,
          homePort: true,
          bio: true,
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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
