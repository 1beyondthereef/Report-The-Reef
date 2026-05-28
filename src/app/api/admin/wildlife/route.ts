import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: sightings, error } = await supabase
      .from("wildlife_sightings")
      .select("*")
      .order("sighted_at", { ascending: false });

    if (error) {
      console.error("Admin: Error fetching wildlife sightings:", error);
      return NextResponse.json(
        { error: "Failed to fetch sightings" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { sightings: sightings || [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error in GET /api/admin/wildlife:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
