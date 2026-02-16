import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BVI_CHECKIN_BOUNDS } from "@/lib/constants";

export const dynamic = "force-dynamic";

// TODO: Re-enable BVI location restriction after testing phase - March 2026
const LOCATION_RESTRICTION_ENABLED = false;

/**
 * Check if coordinates are within BVI waters
 */
function isWithinBVI(lat: number, lng: number): boolean {
  if (!LOCATION_RESTRICTION_ENABLED) {
    return true;
  }

  return (
    lat >= BVI_CHECKIN_BOUNDS.minLat &&
    lat <= BVI_CHECKIN_BOUNDS.maxLat &&
    lng >= BVI_CHECKIN_BOUNDS.minLng &&
    lng <= BVI_CHECKIN_BOUNDS.maxLng
  );
}

/**
 * POST /api/connect/checkins/verify - Verify user's location for active check-in
 * Updates last_verified_at timestamp. If user has left BVI waters, deactivates check-in.
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
    const { data: activeCheckin, error: fetchError } = await supabase
      .from("checkins")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .order("checked_in_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !activeCheckin) {
      return NextResponse.json({ checkedOut: true });
    }

    // Check if user is still within BVI waters
    if (!isWithinBVI(gpsLat, gpsLng)) {
      // User has left BVI, deactivate check-in
      await supabase
        .from("checkins")
        .update({ is_active: false })
        .eq("id", activeCheckin.id);

      return NextResponse.json({ checkedOut: true });
    }

    // Update last_verified_at timestamp
    const { data: updatedCheckin, error: updateError } = await supabase
      .from("checkins")
      .update({
        last_verified_at: new Date().toISOString(),
        actual_gps_lat: gpsLat,
        actual_gps_lng: gpsLng,
      })
      .eq("id", activeCheckin.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating check-in verification:", updateError);
      return NextResponse.json(
        { error: "Failed to verify location" },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkin: updatedCheckin });
  } catch (error) {
    console.error("Error in POST /api/connect/checkins/verify:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
