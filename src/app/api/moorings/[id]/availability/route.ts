import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const startDateStr = searchParams.get("start");
    const endDateStr = searchParams.get("end");

    // Default to next 90 days
    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    const endDate = endDateStr
      ? new Date(endDateStr)
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const mooring = await db.mooring.findUnique({
      where: { id },
      include: {
        anchorage: {
          select: {
            name: true,
            island: true,
          },
        },
        reservations: {
          where: {
            status: { in: ["pending", "confirmed"] },
            OR: [
              {
                startDate: { gte: startDate, lte: endDate },
              },
              {
                endDate: { gte: startDate, lte: endDate },
              },
              {
                AND: [
                  { startDate: { lte: startDate } },
                  { endDate: { gte: endDate } },
                ],
              },
            ],
          },
          select: {
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!mooring) {
      return NextResponse.json(
        { error: "Mooring not found" },
        { status: 404 }
      );
    }

    // Generate list of unavailable dates
    const unavailableDates: string[] = [];
    for (const reservation of mooring.reservations) {
      const current = new Date(reservation.startDate);
      const end = new Date(reservation.endDate);
      while (current <= end) {
        unavailableDates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
    }

    return NextResponse.json({
      mooring: {
        id: mooring.id,
        name: mooring.name,
        pricePerNight: mooring.pricePerNight,
        maxLength: mooring.maxLength,
        anchorage: mooring.anchorage,
      },
      unavailableDates,
    });
  } catch (error) {
    console.error("Get mooring availability error:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
