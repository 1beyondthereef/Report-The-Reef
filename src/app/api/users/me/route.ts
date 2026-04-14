import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

// GET current user profile
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Get profile error:", error);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    // Map to expected format
    const userResponse = {
      id: profile.id,
      email: profile.email,
      name: profile.display_name,
      avatarUrl: profile.avatar_url,
      boatName: profile.vessel_name,
      boatLength: profile.vessel_length,
      homePort: profile.home_port,
      bio: profile.bio,
      showOnMap: profile.show_on_map,
      latitude: profile.latitude,
      longitude: profile.longitude,
      lastSeen: profile.last_seen,
      createdAt: profile.created_at,
    };

    return NextResponse.json({ user: userResponse });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PATCH update current user profile
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, boatName, boatLength, homePort, bio, showOnMap } = body;

    // Validate fields
    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (boatName !== undefined && typeof boatName !== "string") {
      return NextResponse.json({ error: "Invalid boat name" }, { status: 400 });
    }
    if (boatLength !== undefined && typeof boatLength !== "number" && boatLength !== null) {
      return NextResponse.json({ error: "Invalid boat length" }, { status: 400 });
    }
    if (homePort !== undefined && typeof homePort !== "string") {
      return NextResponse.json({ error: "Invalid home port" }, { status: 400 });
    }
    if (bio !== undefined && typeof bio !== "string") {
      return NextResponse.json({ error: "Invalid bio" }, { status: 400 });
    }
    if (showOnMap !== undefined && typeof showOnMap !== "boolean") {
      return NextResponse.json({ error: "Invalid showOnMap" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (name !== undefined) updateData.display_name = name || null;
    if (boatName !== undefined) updateData.vessel_name = boatName || null;
    if (boatLength !== undefined) updateData.vessel_length = boatLength;
    if (homePort !== undefined) updateData.home_port = homePort || null;
    if (bio !== undefined) updateData.bio = bio || null;
    if (showOnMap !== undefined) updateData.show_on_map = showOnMap;

    const { data: profile, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Update profile error:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Map to expected format
    const userResponse = {
      id: profile.id,
      email: profile.email,
      name: profile.display_name,
      avatarUrl: profile.avatar_url,
      boatName: profile.vessel_name,
      boatLength: profile.vessel_length,
      homePort: profile.home_port,
      bio: profile.bio,
      showOnMap: profile.show_on_map,
      latitude: profile.latitude,
      longitude: profile.longitude,
      lastSeen: profile.last_seen,
    };

    return NextResponse.json({ user: userResponse });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
