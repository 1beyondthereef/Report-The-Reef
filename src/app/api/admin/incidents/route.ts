import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    let query = supabase
      .from("incidents")
      .select("id, activity_type, description, status, latitude, longitude, observed_at, photo_urls, contact_name, contact_email, reporter_id, internal_notes, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data: incidents, error } = await query;

    if (error) {
      console.error("Admin: Error fetching incidents:", error);
      return NextResponse.json(
        { error: "Failed to fetch incidents" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { incidents: incidents || [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error in GET /api/admin/incidents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
