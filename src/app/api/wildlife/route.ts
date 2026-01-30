import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createWildlifeSightingSchema } from "@/lib/validation";

export const dynamic = 'force-dynamic';

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Parse pagination parameters
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    const limit = Math.min(
      Math.max(1, parseInt(limitParam || String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE),
      MAX_PAGE_SIZE
    );
    const offset = Math.max(0, parseInt(offsetParam || "0", 10) || 0);

    // Get total count for pagination info
    const { count: totalCount, error: countError } = await supabase
      .from("wildlife_sightings")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error counting wildlife sightings:", countError);
    }

    // Fetch paginated sightings
    const { data: sightings, error } = await supabase
      .from("wildlife_sightings")
      .select("*")
      .order("sighted_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching wildlife sightings:", error);
      return NextResponse.json(
        { error: "Failed to fetch sightings" },
        { status: 500 }
      );
    }

    const total = totalCount ?? 0;
    const hasMore = offset + (sightings?.length || 0) < total;

    return NextResponse.json({
      sightings: sightings || [],
      pagination: {
        total,
        limit,
        offset,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/wildlife:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate input
    const result = createWildlifeSightingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    // Create the sighting
    const { data: sighting, error } = await supabase
      .from("wildlife_sightings")
      .insert({
        species: data.species,
        latitude: data.latitude,
        longitude: data.longitude,
        location_name: data.locationName,
        sighted_at: data.sightedAt,
        count: data.count,
        comments: data.comments,
        photo_url: body.photoUrl,
        reporter_id: user?.id,
        reporter_name: user?.user_metadata?.display_name || data.reporterName,
        reporter_email: user?.email || data.reporterEmail,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating wildlife sighting:", error);
      return NextResponse.json(
        { error: "Failed to create sighting" },
        { status: 500 }
      );
    }

    return NextResponse.json({ sighting }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/wildlife:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
