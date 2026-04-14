import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("[Admin Auth] ADMIN_PASSWORD env var not configured");
      return NextResponse.json({ error: "Admin auth not configured" }, { status: 500 });
    }

    if (password === adminPassword) {
      return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
