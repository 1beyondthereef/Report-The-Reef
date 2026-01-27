import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [
      totalIncidents,
      resolvedIncidents,
      totalAnchorages,
      totalMoorings,
      totalUsers,
      recentIncidents,
    ] = await Promise.all([
      db.incident.count(),
      db.incident.count({ where: { status: "resolved" } }),
      db.anchorage.count(),
      db.mooring.count({ where: { isActive: true } }),
      db.user.count({ where: { isVerified: true } }),
      db.incident.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          category: true,
          severity: true,
          locationName: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalIncidents,
        resolvedIncidents,
        totalAnchorages,
        totalMoorings,
        totalUsers,
      },
      recentIncidents,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
