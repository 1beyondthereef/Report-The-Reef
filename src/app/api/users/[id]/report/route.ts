import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const VALID_REASONS = ["harassment", "spam", "inappropriate", "safety", "other"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
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
    const reportedUser = await db.user.findUnique({
      where: { id: reportedId },
    });

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
    const existingReport = await db.report.findFirst({
      where: {
        reporterId: user.id,
        reportedId,
        status: "pending",
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this user" },
        { status: 400 }
      );
    }

    // Create report
    const report = await db.report.create({
      data: {
        reporterId: user.id,
        reportedId,
        reason,
        details: details || null,
      },
    });

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
