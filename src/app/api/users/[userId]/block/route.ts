import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: blockedId } = await params;

    if (user.id === blockedId) {
      return NextResponse.json(
        { error: "Cannot block yourself" },
        { status: 400 }
      );
    }

    // Check if user exists
    const targetUser = await db.user.findUnique({
      where: { id: blockedId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already blocked
    const existingBlock = await db.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: user.id,
          blockedId,
        },
      },
    });

    if (existingBlock) {
      return NextResponse.json({ message: "User already blocked" });
    }

    const body = await request.json().catch(() => ({}));

    await db.blockedUser.create({
      data: {
        blockerId: user.id,
        blockedId,
        reason: body.reason || null,
      },
    });

    return NextResponse.json({ message: "User blocked successfully" });
  } catch (error) {
    console.error("Block user error:", error);
    return NextResponse.json(
      { error: "Failed to block user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: blockedId } = await params;

    await db.blockedUser.deleteMany({
      where: {
        blockerId: user.id,
        blockedId,
      },
    });

    return NextResponse.json({ message: "User unblocked successfully" });
  } catch (error) {
    console.error("Unblock user error:", error);
    return NextResponse.json(
      { error: "Failed to unblock user" },
      { status: 500 }
    );
  }
}
