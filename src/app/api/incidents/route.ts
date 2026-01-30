import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createIncidentSchema } from "@/lib/validation";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    let query = supabase
      .from("incidents")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (category) query = query.eq("category", category);
    if (severity) query = query.eq("severity", severity);
    if (status) query = query.eq("status", status);

    const { data: incidents, count, error } = await query;

    if (error) {
      console.error("Get incidents error:", error);
      return NextResponse.json({ incidents: [], pagination: { page, limit, total: 0, totalPages: 0 } });
    }

    return NextResponse.json({
      incidents: incidents || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Get incidents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch incidents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();

    const parsed = createIncidentSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]?.message || "Invalid input";
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Extract photo URLs from the request body (array of storage paths)
    const photoUrls: string[] = body.photoUrls || [];

    // Build the insert object
    const insertData = {
      user_id: user?.id || null,
      reporter_email: data.reporterEmail || null,
      reporter_name: data.reporterName || null,
      title: data.title,
      description: data.description,
      category: data.category,
      severity: data.severity,
      latitude: data.latitude,
      longitude: data.longitude,
      location_name: data.locationName,
      occurred_at: data.occurredAt,
      status: "pending",
      photo_urls: photoUrls.length > 0 ? photoUrls : null,
    };

    console.log("Attempting to insert incident with data:", JSON.stringify(insertData, null, 2));

    const { data: incident, error } = await supabase
      .from("incidents")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("=== SUPABASE INSERT ERROR ===");
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: `Failed to create incident: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ incident }, { status: 201 });
  } catch (error) {
    console.error("Create incident error:", error);
    return NextResponse.json(
      { error: "Failed to create incident" },
      { status: 500 }
    );
  }
}
