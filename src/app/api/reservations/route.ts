import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createReservationSchema } from "@/lib/validation";
import { calculateNights } from "@/lib/utils";
import { getMoorings } from "@/lib/anchorages-data";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: reservations, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Get reservations error:", error);
      return NextResponse.json({ reservations: [] });
    }

    return NextResponse.json({ reservations: reservations || [] });
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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

    // Get mooring details from static data
    const moorings = getMoorings();
    const mooring = moorings.find(m => m.id === mooringId);

    if (!mooring) {
      return NextResponse.json(
        { error: "Mooring not found" },
        { status: 404 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check for overlapping reservations in Supabase
    const { data: existingReservations } = await supabase
      .from("reservations")
      .select("id")
      .eq("mooring_id", mooringId)
      .in("status", ["pending", "confirmed"])
      .lte("start_date", end.toISOString())
      .gte("end_date", start.toISOString());

    if (existingReservations && existingReservations.length > 0) {
      return NextResponse.json(
        { error: "This mooring is not available for the selected dates" },
        { status: 400 }
      );
    }

    // Calculate pricing
    const nights = calculateNights(start, end);
    const totalPrice = nights * mooring.pricePerNight;

    // Create reservation
    const { data: reservation, error } = await supabase
      .from("reservations")
      .insert({
        user_id: user.id,
        mooring_id: mooringId,
        mooring_name: mooring.name,
        anchorage_name: mooring.anchorage.name,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        nights,
        price_per_night: mooring.pricePerNight,
        total_price: totalPrice,
        status: "confirmed",
        payment_status: "paid",
        notes,
      })
      .select()
      .single();

    if (error) {
      console.error("Create reservation error:", error);
      return NextResponse.json(
        { error: "Failed to create reservation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    console.error("Create reservation error:", error);
    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}
