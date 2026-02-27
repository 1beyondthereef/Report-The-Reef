import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateDistance, AUTO_CHECKOUT_DISTANCE_KM } from "@/lib/geo-utils";

export const dynamic = "force-dynamic";

/**
 * POST /api/connect/checkins/verify - Verify user's location for active check-in
 * Updates last_verified_at timestamp. Shows warning if user moved far from anchorage.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { gpsLat, gpsLng } = body;

    // Validate GPS coordinates
    if (typeof gpsLat !== "number" || typeof gpsLng !== "number") {
      return NextResponse.json(
        { error: "GPS coordinates are required" },
        { status: 400 }
      );
    }

    // Get user's active check-in
    const { data: checkin, error: fetchError } = await supabase
      .from("checkins")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .order("checked_in_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !checkin) {
      return NextResponse.json({ checkedOut: true });
    }

    // Calculate distance from check-in location
    const distance = calculateDistance(
      checkin.location_lat,
      checkin.location_lng,
      gpsLat,
      gpsLng
    );

    // If user has moved more than 5 nautical miles from their anchorage, flag it
    // but DON'T auto-checkout - instead return a warning so the frontend can ask
    if (distance > AUTO_CHECKOUT_DISTANCE_KM) {
      // Update GPS but flag that they may have moved
      await supabase
        .from("checkins")
        .update({
          last_verified_at: new Date().toISOString(),
          actual_gps_lat: gpsLat,
          actual_gps_lng: gpsLng,
        })
        .eq("id", checkin.id);

      return NextResponse.json({
        checkin,
        movedAway: true,
        distanceKm: Math.round(distance * 10) / 10,
      });
    }

    // User is still near their anchorage - just update verification timestamp
    const { data: updatedCheckin } = await supabase
      .from("checkins")
      .update({
        last_verified_at: new Date().toISOString(),
        actual_gps_lat: gpsLat,
        actual_gps_lng: gpsLng,
      })
      .eq("id", checkin.id)
      .select()
      .single();

    return NextResponse.json({ checkin: updatedCheckin || checkin });
  } catch (error) {
    console.error("Error in POST /api/connect/checkins/verify:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
