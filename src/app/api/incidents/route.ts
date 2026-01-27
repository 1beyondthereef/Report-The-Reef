import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { createIncidentSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (severity) where.severity = severity;
    if (status) where.status = status;

    const [incidents, total] = await Promise.all([
      db.incident.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          attachments: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.incident.count({ where }),
    ]);

    return NextResponse.json({
      incidents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get incidents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch incidents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // User is optional - allow anonymous reports
    const user = await getCurrentUser();

    const body = await request.json();

    const parsed = createIncidentSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]?.message || "Invalid input";
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const incident = await db.incident.create({
      data: {
        userId: user?.id || null,
        reporterEmail: data.reporterEmail || null,
        reporterName: data.reporterName || null,
        title: data.title,
        description: data.description,
        category: data.category,
        severity: data.severity,
        latitude: data.latitude,
        longitude: data.longitude,
        locationName: data.locationName,
        occurredAt: new Date(data.occurredAt),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Handle attachments if provided
    if (body.attachments && Array.isArray(body.attachments)) {
      await db.attachment.createMany({
        data: body.attachments.map((attachment: { filename: string; url: string; mimeType: string; size: number }) => ({
          incidentId: incident.id,
          filename: attachment.filename,
          url: attachment.url,
          mimeType: attachment.mimeType,
          size: attachment.size,
        })),
      });
    }

    return NextResponse.json({ incident }, { status: 201 });
  } catch (error) {
    console.error("Create incident error:", error);
    return NextResponse.json(
      { error: "Failed to create incident" },
      { status: 500 }
    );
  }
}
