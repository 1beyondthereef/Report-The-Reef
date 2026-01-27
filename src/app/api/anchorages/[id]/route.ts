import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const anchorage = await db.anchorage.findUnique({
      where: { id },
      include: {
        moorings: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            pricePerNight: true,
            maxLength: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!anchorage) {
      return NextResponse.json(
        { error: "Anchorage not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ anchorage });
  } catch (error) {
    console.error("Get anchorage error:", error);
    return NextResponse.json(
      { error: "Failed to fetch anchorage" },
      { status: 500 }
    );
  }
}
