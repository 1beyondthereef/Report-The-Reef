import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createWildlifeSightingSchema } from "@/lib/validation";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: sightings, error } = await supabase
      .from("wildlife_sightings")
      .select("*")
      .order("sighted_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching wildlife sightings:", error);
      return NextResponse.json(
        { error: "Failed to fetch sightings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ sightings: sightings || [] });
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
