import { NextRequest, NextResponse } from "next/server";
import { searchAnchorages } from "@/lib/anchorages-data";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const island = searchParams.get("island") || undefined;
    const search = searchParams.get("search") || undefined;

    const anchorages = searchAnchorages({ island, search });

    return NextResponse.json({ anchorages });
  } catch (error) {
    console.error("Get anchorages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch anchorages" },
      { status: 500 }
    );
  }
}
