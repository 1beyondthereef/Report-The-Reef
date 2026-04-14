import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateProfileSchema } from "@/lib/validation";

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]?.message || "Invalid input";
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      );
    }

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update({
        display_name: parsed.data.name,
        vessel_name: parsed.data.boatName,
        vessel_length: parsed.data.boatLength,
        home_port: parsed.data.homePort,
        bio: parsed.data.bio,
        updated_at: new Date().toISOString(),
      })
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

    return NextResponse.json({
      user: {
        id: updatedProfile.id,
        email: user.email,
        name: updatedProfile.display_name,
        avatarUrl: updatedProfile.avatar_url,
        boatName: updatedProfile.vessel_name,
        homePort: updatedProfile.home_port,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
