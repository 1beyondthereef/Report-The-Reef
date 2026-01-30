import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

/**
 * Generate signed URLs for private bucket files
 * POST /api/storage/signed-url
 * Body: { paths: string[], bucket: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { paths, bucket } = await request.json();

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json(
        { error: "paths array is required" },
        { status: 400 }
      );
    }

    if (!bucket) {
      return NextResponse.json(
        { error: "bucket name is required" },
        { status: 400 }
      );
    }

    // Generate signed URLs for each path (valid for 1 hour)
    const signedUrls: Record<string, string> = {};

    for (const path of paths) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600); // 1 hour expiry

      if (error) {
        console.error(`Failed to create signed URL for ${path}:`, error);
        continue;
      }

      if (data?.signedUrl) {
        signedUrls[path] = data.signedUrl;
      }
    }

    return NextResponse.json({ signedUrls });
  } catch (error) {
    console.error("Error generating signed URLs:", error);
    return NextResponse.json(
      { error: "Failed to generate signed URLs" },
      { status: 500 }
    );
  }
}
