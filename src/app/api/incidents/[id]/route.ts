import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/api-helpers";

export const dynamic = 'force-dynamic';

const PUBLIC_COLUMNS = "id, activity_type, description, status, latitude, longitude, observed_at, photo_urls, contact_name, contact_email, reporter_id, created_at, updated_at";
const ADMIN_COLUMNS = `${PUBLIC_COLUMNS}, internal_notes`;

/**
 * Update an incident (status, internal notes, etc.)
 * PATCH /api/incidents/[id] — admin only
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin(user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const allowedFields = ["status", "internal_notes"];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    if (updateData.status) {
      const validStatuses = ["pending", "in_progress", "reviewed", "resolved", "dismissed"];
      if (!validStatuses.includes(updateData.status as string)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }
    }

    const { data: incident, error } = await supabase
      .from("incidents")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update incident error:", error);
      return NextResponse.json(
        { error: `Failed to update incident: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ incident });
  } catch (error) {
    console.error("Error in PATCH /api/incidents/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Get a single incident.
 * Public callers get public-safe fields; admins also get internal_notes.
 * GET /api/incidents/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user } } = await supabase.auth.getUser();
    const columns = user && isAdmin(user.id) ? ADMIN_COLUMNS : PUBLIC_COLUMNS;

    const { data: incident, error } = await supabase
      .from("incidents")
      .select(columns)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Get incident error:", error);
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ incident });
  } catch (error) {
    console.error("Error in GET /api/incidents/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
