import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BVI_CHECKIN_BOUNDS, BVI_ANCHORAGES, CHECKIN_CONFIG } from "@/lib/constants";

export const dynamic = 'force-dynamic';

// TODO: Re-enable BVI location restriction after testing phase - March 2026
// For now, location restriction is DISABLED to allow global testing
const LOCATION_RESTRICTION_ENABLED = false;

// Default location for users outside BVI (The Bight, Norman Island)
const DEFAULT_BVI_LOCATION = {
  lat: 18.3186,
  lng: -64.6189,
};

/**
 * Check if coordinates are within BVI waters
 * TODO: Re-enable BVI location restriction after testing phase - March 2026
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isWithinBVI(lat: number, lng: number): boolean {
  // Location restriction temporarily disabled for global testing
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
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get nearest anchorages to a GPS position
 * For users outside BVI, returns anchorages sorted by distance from default BVI location
 */
function getNearestAnchorages(lat: number, lng: number, count: number = 3) {
  // TODO: Re-enable BVI location restriction after testing phase - March 2026
  // If user is outside BVI and restriction is disabled, use default BVI location for suggestions
  let searchLat = lat;
  let searchLng = lng;

  if (!LOCATION_RESTRICTION_ENABLED) {
    const actuallyInBVI = (
      lat >= BVI_CHECKIN_BOUNDS.minLat &&
      lat <= BVI_CHECKIN_BOUNDS.maxLat &&
      lng >= BVI_CHECKIN_BOUNDS.minLng &&
      lng <= BVI_CHECKIN_BOUNDS.maxLng
    );

    if (!actuallyInBVI) {
      // User is outside BVI, show all anchorages sorted by default location
      searchLat = DEFAULT_BVI_LOCATION.lat;
      searchLng = DEFAULT_BVI_LOCATION.lng;
    }
  }

  return BVI_ANCHORAGES
    .map((anchorage) => ({
      ...anchorage,
      distance: calculateDistance(searchLat, searchLng, anchorage.lat, anchorage.lng),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count);
}

/**
 * GET /api/connect/checkins - Get all active check-ins (for map display)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const searchParams = request.nextUrl.searchParams;
    const getSuggestions = searchParams.get("suggestions") === "true";

    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");

    // If requesting anchorage suggestions
    if (getSuggestions && lat && lng) {
      // TODO: Re-enable BVI location restriction after testing phase - March 2026
      // Location check bypassed - allowing check-in from anywhere
      // if (LOCATION_RESTRICTION_ENABLED && !isWithinBVI(lat, lng)) {
      //   return NextResponse.json(
      //     { error: "Check-in is only available within BVI waters" },
      //     { status: 400 }
      //   );
      // }

      const suggestions = getNearestAnchorages(lat, lng, 5); // Return more suggestions for global users
      return NextResponse.json({ suggestions, locationRestrictionDisabled: !LOCATION_RESTRICTION_ENABLED });
    }

    // Expire old check-ins first
    try {
      await supabase.rpc("expire_old_checkins");
    } catch {
      // Function might not exist yet, that's ok
    }

    // Get all active check-ins with profile info
    // Only show check-ins where user is visible
    const { data: checkins, error } = await supabase
      .from("checkins")
      .select(`
        id,
        user_id,
        location_name,
        location_lat,
        location_lng,
        checked_in_at,
        expires_at,
        profiles!inner (
          id,
          display_name,
          boat_name,
          photo_url,
          is_visible
        )
      `)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .eq("profiles.is_visible", true);

    if (error) {
      console.error("Error fetching checkins:", error);
      return NextResponse.json(
        { error: "Failed to fetch check-ins" },
        { status: 500 }
      );
    }

    // Get current user's active check-in if authenticated
    let myCheckin = null;
    if (user) {
      const { data } = await supabase
        .from("checkins")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .single();

      myCheckin = data;
    }

    return NextResponse.json({
      checkins: checkins || [],
      myCheckin,
    });
  } catch (error) {
    console.error("Error in GET /api/connect/checkins:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/connect/checkins - Check in at an anchorage
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
    const { anchorageId, gpsLat, gpsLng } = body;

    // Validate GPS coordinates
    if (typeof gpsLat !== "number" || typeof gpsLng !== "number") {
      return NextResponse.json(
        { error: "GPS coordinates are required" },
        { status: 400 }
      );
    }

    // TODO: Re-enable BVI location restriction after testing phase - March 2026
    // Location check bypassed - allowing check-in from anywhere
    // For users outside BVI, we still record their actual GPS but allow the check-in
    const finalLat = gpsLat;
    const finalLng = gpsLng;

    // if (LOCATION_RESTRICTION_ENABLED && !isWithinBVI(finalLat, finalLng)) {
    //   return NextResponse.json(
    //     { error: "Check-in is only available within BVI waters" },
    //     { status: 400 }
    //   );
    // }

    // Validate anchorage
    const anchorage = BVI_ANCHORAGES.find((a) => a.id === anchorageId);
    if (!anchorage) {
      return NextResponse.json(
        { error: "Invalid anchorage selected" },
        { status: 400 }
      );
    }

    // Deactivate any existing check-ins for this user
    await supabase
      .from("checkins")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("is_active", true);

    // Calculate expiry time (8 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CHECKIN_CONFIG.EXPIRY_HOURS);

    // Create new check-in
    const { data: checkin, error } = await supabase
      .from("checkins")
      .insert({
        user_id: user.id,
        location_name: anchorage.name,
        location_lat: anchorage.lat,
        location_lng: anchorage.lng,
        actual_gps_lat: finalLat,
        actual_gps_lng: finalLng,
        expires_at: expiresAt.toISOString(),
        last_verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating checkin:", error);
      return NextResponse.json(
        { error: "Failed to check in" },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkin }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/connect/checkins:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/connect/checkins - Check out (deactivate current check-in)
 */
export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Deactivate all active check-ins for this user
    const { error } = await supabase
      .from("checkins")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (error) {
      console.error("Error checking out:", error);
      return NextResponse.json(
        { error: "Failed to check out" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/connect/checkins:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
