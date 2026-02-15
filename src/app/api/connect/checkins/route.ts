import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BVI_CHECKIN_BOUNDS, BVI_ANCHORAGES, CHECKIN_CONFIG, AUTO_CHECKIN_RADIUS_KM } from "@/lib/constants";

export const dynamic = 'force-dynamic';

// TODO: Re-enable BVI location restriction after testing phase - March 2026
// For now, location restriction is DISABLED to allow global testing
const LOCATION_RESTRICTION_ENABLED = false;

// Default location for users outside BVI (The Bight, Norman Island)
const DEFAULT_BVI_LOCATION = {
  lat: 18.3200,
  lng: -64.6200,
};

/**
 * Check if coordinates are within BVI waters
 * TODO: Re-enable BVI location restriction after testing phase - March 2026
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
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
 * Find the nearest anchorage within auto-detect radius
 * Returns null if no anchorage is within range
 */
function findNearestAnchorageWithinRadius(lat: number, lng: number) {
  let nearest = null;
  let nearestDistance = Infinity;

  for (const anchorage of BVI_ANCHORAGES) {
    const distance = calculateDistance(lat, lng, anchorage.lat, anchorage.lng);
    if (distance <= AUTO_CHECKIN_RADIUS_KM && distance < nearestDistance) {
      nearest = { ...anchorage, distance };
      nearestDistance = distance;
    }
  }

  return nearest;
}

/**
 * Get all anchorages sorted by distance from a GPS position
 */
function getAllAnchoragesSorted(lat: number, lng: number) {
  // If user is outside BVI and restriction is disabled, use default BVI location
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
      searchLat = DEFAULT_BVI_LOCATION.lat;
      searchLng = DEFAULT_BVI_LOCATION.lng;
    }
  }

  return BVI_ANCHORAGES
    .map((anchorage) => ({
      ...anchorage,
      distance: calculateDistance(searchLat, searchLng, anchorage.lat, anchorage.lng),
    }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * GET /api/connect/checkins - Get check-ins, suggestions, or anchorage data
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const searchParams = request.nextUrl.searchParams;
    const getSuggestions = searchParams.get("suggestions") === "true";
    const getAllAnchorages = searchParams.get("anchorages") === "true";
    const autoDetect = searchParams.get("autoDetect") === "true";

    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");

    // Auto-detect nearest anchorage within radius
    if (autoDetect && lat && lng) {
      const nearestAnchorage = findNearestAnchorageWithinRadius(lat, lng);
      return NextResponse.json({
        nearestAnchorage,
        withinRadius: nearestAnchorage !== null,
        radiusKm: AUTO_CHECKIN_RADIUS_KM,
      });
    }

    // Get all anchorages for map display
    if (getAllAnchorages) {
      const anchorages = lat && lng
        ? getAllAnchoragesSorted(lat, lng)
        : BVI_ANCHORAGES.map(a => ({ ...a, distance: 0 }));

      // Get check-in counts per anchorage
      const { data: checkinCounts } = await supabase
        .from("checkins")
        .select("anchorage_id, location_name, location_lat, location_lng")
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString());

      // Count checkins per anchorage
      const countMap = new Map<string, number>();
      (checkinCounts || []).forEach((c: { anchorage_id: string | null }) => {
        if (c.anchorage_id) {
          countMap.set(c.anchorage_id, (countMap.get(c.anchorage_id) || 0) + 1);
        }
      });

      const anchoragesWithCounts = anchorages.map(a => ({
        ...a,
        checkinCount: countMap.get(a.id) || 0,
      }));

      return NextResponse.json({ anchorages: anchoragesWithCounts });
    }

    // Get anchorage suggestions (sorted by distance)
    if (getSuggestions && lat && lng) {
      const suggestions = getAllAnchoragesSorted(lat, lng).slice(0, 10);
      const nearestWithinRadius = findNearestAnchorageWithinRadius(lat, lng);

      return NextResponse.json({
        suggestions,
        nearestWithinRadius,
        locationRestrictionDisabled: !LOCATION_RESTRICTION_ENABLED,
      });
    }

    // Expire old check-ins first
    try {
      await supabase.rpc("expire_old_checkins");
    } catch {
      // Function might not exist yet, that's ok
    }

    // Get all active check-ins with profile info
    const { data: checkins, error } = await supabase
      .from("checkins")
      .select(`
        id,
        user_id,
        location_name,
        location_lat,
        location_lng,
        anchorage_id,
        note,
        visibility,
        is_custom_location,
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

    // Group checkins by anchorage for counts
    const anchorageCheckins = new Map<string, typeof checkins>();
    (checkins || []).forEach((c) => {
      const key = c.anchorage_id || `${c.location_lat},${c.location_lng}`;
      if (!anchorageCheckins.has(key)) {
        anchorageCheckins.set(key, []);
      }
      anchorageCheckins.get(key)!.push(c);
    });

    return NextResponse.json({
      checkins: checkins || [],
      myCheckin,
      anchorageCheckins: Object.fromEntries(anchorageCheckins),
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
 * POST /api/connect/checkins - Check in at an anchorage or custom location
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
    const {
      anchorageId,
      gpsLat,
      gpsLng,
      note,
      visibility = "public",
      customLocation,
    } = body;

    // Validate GPS coordinates
    if (typeof gpsLat !== "number" || typeof gpsLng !== "number") {
      return NextResponse.json(
        { error: "GPS coordinates are required" },
        { status: 400 }
      );
    }

    // Validate visibility
    if (visibility !== "public" && visibility !== "friends") {
      return NextResponse.json(
        { error: "Invalid visibility setting" },
        { status: 400 }
      );
    }

    let locationData: {
      name: string;
      lat: number;
      lng: number;
      anchorageId: string | null;
      isCustom: boolean;
    };

    // Handle custom location
    if (customLocation) {
      if (!customLocation.name || typeof customLocation.lat !== "number" || typeof customLocation.lng !== "number") {
        return NextResponse.json(
          { error: "Custom location requires name, lat, and lng" },
          { status: 400 }
        );
      }
      locationData = {
        name: customLocation.name,
        lat: customLocation.lat,
        lng: customLocation.lng,
        anchorageId: null,
        isCustom: true,
      };
    } else {
      // Validate anchorage
      const anchorage = BVI_ANCHORAGES.find((a) => a.id === anchorageId);
      if (!anchorage) {
        return NextResponse.json(
          { error: "Invalid anchorage selected" },
          { status: 400 }
        );
      }
      locationData = {
        name: `${anchorage.name}, ${anchorage.island}`,
        lat: anchorage.lat,
        lng: anchorage.lng,
        anchorageId: anchorage.id,
        isCustom: false,
      };
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
        location_name: locationData.name,
        location_lat: locationData.lat,
        location_lng: locationData.lng,
        anchorage_id: locationData.anchorageId,
        is_custom_location: locationData.isCustom,
        actual_gps_lat: gpsLat,
        actual_gps_lng: gpsLng,
        note: note || null,
        visibility,
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
