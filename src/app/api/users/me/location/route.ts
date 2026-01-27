import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST update user location (heartbeat)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { latitude, longitude } = body;

    // Validate coordinates
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: "Coordinates out of range" },
        { status: 400 }
      );
    }

    // Update location and lastSeen timestamp
    const { error } = await supabase
      .from("profiles")
      .update({
        latitude,
        longitude,
        last_seen: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Update location error:", error);
      return NextResponse.json(
        { error: "Failed to update location" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update location error:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}

// DELETE clear user location (go offline)
export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        latitude: null,
        longitude: null,
        last_seen: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Clear location error:", error);
      return NextResponse.json(
        { error: "Failed to clear location" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clear location error:", error);
    return NextResponse.json(
      { error: "Failed to clear location" },
      { status: 500 }
    );
  }
}
