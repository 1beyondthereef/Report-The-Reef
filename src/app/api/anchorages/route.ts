import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const island = searchParams.get("island");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (island) {
      where.island = island;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { island: { contains: search } },
      ];
    }

    const anchorages = await db.anchorage.findMany({
      where,
      include: {
        moorings: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            pricePerNight: true,
            maxLength: true,
          },
          orderBy: { pricePerNight: "asc" },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            moorings: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ anchorages });
  } catch (error) {
    console.error("Get anchorages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch anchorages" },
      { status: 500 }
    );
  }
}
