import { NextRequest, NextResponse } from "next/server";
import { getAnchorageById } from "@/lib/anchorages-data";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const anchorage = getAnchorageById(id);

    if (!anchorage) {
      return NextResponse.json(
        { error: "Anchorage not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ anchorage });
  } catch (error) {
    console.error("Get anchorage error:", error);
    return NextResponse.json(
      { error: "Failed to fetch anchorage" },
      { status: 500 }
    );
  }
}
