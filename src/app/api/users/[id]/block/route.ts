import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// POST block a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: blockedId } = await params;

    // Can't block yourself
    if (blockedId === user.id) {
      return NextResponse.json(
        { error: "Cannot block yourself" },
        { status: 400 }
      );
    }

    // Check if user exists
    const blockedUser = await db.user.findUnique({
      where: { id: blockedId },
    });

    if (!blockedUser) {
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
      return NextResponse.json(
        { error: "User is already blocked" },
        { status: 400 }
      );
    }

    // Create block
    await db.blockedUser.create({
      data: {
        blockerId: user.id,
        blockedId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User blocked successfully",
    });
  } catch (error) {
    console.error("Block user error:", error);
    return NextResponse.json(
      { error: "Failed to block user" },
      { status: 500 }
    );
  }
}

// DELETE unblock a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: blockedId } = await params;

    // Delete block if it exists
    await db.blockedUser.deleteMany({
      where: {
        blockerId: user.id,
        blockedId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User unblocked successfully",
    });
  } catch (error) {
    console.error("Unblock user error:", error);
    return NextResponse.json(
      { error: "Failed to unblock user" },
      { status: 500 }
    );
  }
}
