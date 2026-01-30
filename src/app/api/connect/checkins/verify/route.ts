import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BVI_CHECKIN_BOUNDS } from "@/lib/constants";

export const dynamic = 'force-dynamic';

/**
 * Check if coordinates are within BVI waters
 */
function isWithinBVI(lat: number, lng: number): boolean {
  return (
    lat >= BVI_CHECKIN_BOUNDS.minLat &&
    lat <= BVI_CHECKIN_BOUNDS.maxLat &&
    lng >= BVI_CHECKIN_BOUNDS.minLng &&
    lng <= BVI_CHECKIN_BOUNDS.maxLng
  );
}

/**
 * POST /api/connect/checkins/verify - Verify GPS location to maintain check-in
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
      .single();

    if (fetchError || !checkin) {
      return NextResponse.json(
        { error: "No active check-in found" },
        { status: 404 }
      );
    }

    // Verify still within BVI waters
    if (!isWithinBVI(gpsLat, gpsLng)) {
      // Auto-checkout if user left BVI
      await supabase
        .from("checkins")
        .update({ is_active: false })
        .eq("id", checkin.id);

      return NextResponse.json(
        {
          error: "You have left BVI waters. Check-in has been deactivated.",
          checkedOut: true
        },
        { status: 400 }
      );
    }

    // Update verification timestamp and GPS
    const { data: updatedCheckin, error: updateError } = await supabase
      .from("checkins")
      .update({
        actual_gps_lat: gpsLat,
        actual_gps_lng: gpsLng,
        last_verified_at: new Date().toISOString(),
      })
      .eq("id", checkin.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error verifying checkin:", updateError);
      return NextResponse.json(
        { error: "Failed to verify location" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkin: updatedCheckin,
      verified: true
    });
  } catch (error) {
    console.error("Error in POST /api/connect/checkins/verify:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
