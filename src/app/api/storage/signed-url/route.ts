import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS } from "@/lib/supabase/storage";

export const dynamic = 'force-dynamic';

const ALLOWED_BUCKETS = new Set<string>(Object.values(STORAGE_BUCKETS));

/**
 * Generate signed URLs for private bucket files.
 * Requires authentication. Only allows known buckets.
 * POST /api/storage/signed-url
 * Body: { paths: string[], bucket: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    if (!ALLOWED_BUCKETS.has(bucket)) {
      return NextResponse.json(
        { error: "Invalid bucket" },
        { status: 403 }
      );
    }

    const signedUrls: Record<string, string> = {};

    for (const path of paths) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600);

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
