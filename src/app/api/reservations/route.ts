import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { createReservationSchema } from "@/lib/validation";
import { calculateNights } from "@/lib/utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reservations = await db.reservation.findMany({
      where: { userId: user.id },
      include: {
        mooring: {
          include: {
            anchorage: {
              select: {
                name: true,
                island: true,
              },
            },
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error("Get reservations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const parsed = createReservationSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]?.message || "Invalid input";
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      );
    }

    const { mooringId, startDate, endDate, notes } = parsed.data;

    // Get mooring details
    const mooring = await db.mooring.findUnique({
      where: { id: mooringId },
      include: {
        anchorage: {
          select: { name: true },
        },
      },
    });

    if (!mooring) {
      return NextResponse.json(
        { error: "Mooring not found" },
        { status: 404 }
      );
    }

    if (!mooring.isActive) {
      return NextResponse.json(
        { error: "This mooring is not available for booking" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check for overlapping reservations
    const existingReservation = await db.reservation.findFirst({
      where: {
        mooringId,
        status: { in: ["pending", "confirmed"] },
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start },
          },
        ],
      },
    });

    if (existingReservation) {
      return NextResponse.json(
        { error: "This mooring is not available for the selected dates" },
        { status: 400 }
      );
    }

    // Calculate pricing
    const nights = calculateNights(start, end);
    const totalPrice = nights * mooring.pricePerNight;

    // Create reservation
    const reservation = await db.reservation.create({
      data: {
        userId: user.id,
        mooringId,
        startDate: start,
        endDate: end,
        nights,
        pricePerNight: mooring.pricePerNight,
        totalPrice,
        status: "pending",
        paymentStatus: "pending",
        notes,
      },
      include: {
        mooring: {
          include: {
            anchorage: {
              select: {
                name: true,
                island: true,
              },
            },
          },
        },
      },
    });

    // In a real app, we would initiate payment here
    // For MVP, we'll simulate instant payment success
    await db.reservation.update({
      where: { id: reservation.id },
      data: {
        status: "confirmed",
        paymentStatus: "paid",
      },
    });

    return NextResponse.json({
      reservation: {
        ...reservation,
        status: "confirmed",
        paymentStatus: "paid",
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Create reservation error:", error);
    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}
