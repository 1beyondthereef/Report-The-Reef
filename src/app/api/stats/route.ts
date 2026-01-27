import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnchorages, getMoorings } from "@/lib/anchorages-data";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get counts from Supabase tables (with fallbacks)
    const [incidentsResult, usersResult] = await Promise.all([
      supabase.from("incidents").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ]);

    // Get static data counts
    const anchorages = getAnchorages();
    const moorings = getMoorings();

    return NextResponse.json({
      stats: {
        totalIncidents: incidentsResult.count || 0,
        resolvedIncidents: 0,
        totalAnchorages: anchorages.length,
        totalMoorings: moorings.length,
        totalUsers: usersResult.count || 0,
      },
      recentIncidents: [],
    });
  } catch (error) {
    console.error("Get stats error:", error);
    // Return default stats on error
    return NextResponse.json({
      stats: {
        totalIncidents: 0,
        resolvedIncidents: 0,
        totalAnchorages: 15,
        totalMoorings: 45,
        totalUsers: 0,
      },
      recentIncidents: [],
    });
  }
}
