import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_REASONS = ["harassment", "spam", "inappropriate", "safety", "other"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: reportedId } = await params;

    // Can't report yourself
    if (reportedId === user.id) {
      return NextResponse.json(
        { error: "Cannot report yourself" },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: reportedUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", reportedId)
      .single();

    if (!reportedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { reason, details } = body;

    // Validate reason
    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { error: "Invalid reason. Must be one of: " + VALID_REASONS.join(", ") },
        { status: 400 }
      );
    }

    // Check for existing pending report
    const { data: existingReport } = await supabase
      .from("reports")
      .select("id")
      .eq("reporter_id", user.id)
      .eq("reported_id", reportedId)
      .eq("status", "pending")
      .single();

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this user" },
        { status: 400 }
      );
    }

    // Create report
    const { data: report, error } = await supabase
      .from("reports")
      .insert({
        reporter_id: user.id,
        reported_id: reportedId,
        reason,
        details: details || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Report user error:", error);
      return NextResponse.json(
        { error: "Failed to submit report" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Report submitted. Our team will review it.",
      reportId: report.id,
    });
  } catch (error) {
    console.error("Report user error:", error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}
