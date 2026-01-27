import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// GET current user profile
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        boatName: true,
        boatLength: true,
        homePort: true,
        bio: true,
        showOnMap: true,
        latitude: true,
        longitude: true,
        lastSeen: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: fullUser });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PATCH update current user profile
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, boatName, boatLength, homePort, bio, showOnMap } = body;

    // Validate fields
    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (boatName !== undefined && typeof boatName !== "string") {
      return NextResponse.json({ error: "Invalid boat name" }, { status: 400 });
    }
    if (boatLength !== undefined && typeof boatLength !== "number" && boatLength !== null) {
      return NextResponse.json({ error: "Invalid boat length" }, { status: 400 });
    }
    if (homePort !== undefined && typeof homePort !== "string") {
      return NextResponse.json({ error: "Invalid home port" }, { status: 400 });
    }
    if (bio !== undefined && typeof bio !== "string") {
      return NextResponse.json({ error: "Invalid bio" }, { status: 400 });
    }
    if (showOnMap !== undefined && typeof showOnMap !== "boolean") {
      return NextResponse.json({ error: "Invalid showOnMap" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name || null;
    if (boatName !== undefined) updateData.boatName = boatName || null;
    if (boatLength !== undefined) updateData.boatLength = boatLength;
    if (homePort !== undefined) updateData.homePort = homePort || null;
    if (bio !== undefined) updateData.bio = bio || null;
    if (showOnMap !== undefined) updateData.showOnMap = showOnMap;

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        boatName: true,
        boatLength: true,
        homePort: true,
        bio: true,
        showOnMap: true,
        latitude: true,
        longitude: true,
        lastSeen: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
