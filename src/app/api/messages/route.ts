import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all conversations (grouped by the other user)
    const messages = await db.message.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            boatName: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            boatName: true,
          },
        },
      },
    });

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
          createdAt: Date;
          isRead: boolean;
          senderId: string;
        };
        unreadCount: number;
      }
    >();

    for (const message of messages) {
      const otherUser =
        message.senderId === user.id ? message.receiver : message.sender;

      if (!conversationsMap.has(otherUser.id)) {
        const unreadCount = messages.filter(
          (m) =>
            m.senderId === otherUser.id && m.receiverId === user.id && !m.isRead
        ).length;

        conversationsMap.set(otherUser.id, {
          user: otherUser,
          lastMessage: {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            isRead: message.isRead,
            senderId: message.senderId,
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
