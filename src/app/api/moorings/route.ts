import { NextRequest, NextResponse } from "next/server";
import { getMoorings } from "@/lib/anchorages-data";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const anchorageId = searchParams.get("anchorage") || undefined;
    const minLength = searchParams.get("minLength");
    const maxPrice = searchParams.get("maxPrice");

    const moorings = getMoorings({
      anchorageId,
      minLength: minLength ? parseFloat(minLength) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });

    return NextResponse.json({ moorings });
  } catch (error) {
    console.error("Get moorings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch moorings" },
      { status: 500 }
    );
  }
}
