import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { sendMessageSchema } from "@/lib/validation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: otherUserId } = await params;

    // Check if user is blocked
    const blocked = await db.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: user.id, blockedId: otherUserId },
          { blockerId: otherUserId, blockedId: user.id },
        ],
      },
    });

    if (blocked) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get other user info
    const otherUser = await db.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        boatName: true,
      },
    });

    if (!otherUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get messages
    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: user.id },
        ],
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    // Mark unread messages as read
    await db.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      user: otherUser,
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        createdAt: m.createdAt,
        isMine: m.senderId === user.id,
        isRead: m.isRead,
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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: receiverId } = await params;

    // Check if user is blocked
    const blocked = await db.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: user.id, blockedId: receiverId },
          { blockerId: receiverId, blockedId: user.id },
        ],
      },
    });

    if (blocked) {
      return NextResponse.json(
        { error: "Cannot send message to this user" },
        { status: 403 }
      );
    }

    // Check if receiver exists
    const receiver = await db.user.findUnique({
      where: { id: receiverId },
    });

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

    const message = await db.message.create({
      data: {
        senderId: user.id,
        receiverId,
        content: parsed.data.content,
      },
    });

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
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
