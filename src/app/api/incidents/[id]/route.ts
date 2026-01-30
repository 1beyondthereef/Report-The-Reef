import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

/**
 * Update an incident (status, internal notes, etc.)
 * PATCH /api/incidents/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;
    const body = await request.json();

    // Only allow updating specific fields
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

    // Validate status if provided
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
 * Get a single incident
 * GET /api/incidents/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    const { data: incident, error } = await supabase
      .from("incidents")
      .select("*")
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
