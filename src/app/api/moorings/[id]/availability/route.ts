import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMoorings } from "@/lib/anchorages-data";

export const dynamic = 'force-dynamic';

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

    // Get mooring from static data
    const moorings = getMoorings();
    const mooring = moorings.find(m => m.id === id);

    if (!mooring) {
      return NextResponse.json(
        { error: "Mooring not found" },
        { status: 404 }
      );
    }

    // Get reservations from Supabase
    const supabase = await createClient();
    const { data: reservations } = await supabase
      .from("reservations")
      .select("start_date, end_date")
      .eq("mooring_id", id)
      .in("status", ["pending", "confirmed"])
      .or(`start_date.gte.${startDate.toISOString()},end_date.lte.${endDate.toISOString()}`);

    // Generate list of unavailable dates
    const unavailableDates: string[] = [];
    if (reservations) {
      for (const reservation of reservations) {
        const current = new Date(reservation.start_date);
        const end = new Date(reservation.end_date);
        while (current <= end) {
          unavailableDates.push(current.toISOString().split("T")[0]);
          current.setDate(current.getDate() + 1);
        }
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
