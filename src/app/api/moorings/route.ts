import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const anchorageId = searchParams.get("anchorage");
    const minLength = searchParams.get("minLength");
    const maxPrice = searchParams.get("maxPrice");

    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (anchorageId) {
      where.anchorageId = anchorageId;
    }

    if (minLength) {
      where.maxLength = { gte: parseFloat(minLength) };
    }

    if (maxPrice) {
      where.pricePerNight = { lte: parseFloat(maxPrice) };
    }

    const moorings = await db.mooring.findMany({
      where,
      include: {
        anchorage: {
          select: {
            id: true,
            name: true,
            island: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      orderBy: [{ anchorage: { name: "asc" } }, { name: "asc" }],
    });

    return NextResponse.json({ moorings });
  } catch (error) {
    console.error("Get moorings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch moorings" },
      { status: 500 }
    );
  }
}
