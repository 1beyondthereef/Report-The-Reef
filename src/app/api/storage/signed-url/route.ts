import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { STORAGE_BUCKETS } from "@/lib/supabase/storage";

export const dynamic = 'force-dynamic';

const ALLOWED_BUCKETS = new Set<string>(Object.values(STORAGE_BUCKETS));
const MAX_PATHS_PER_REQUEST = 20;

/**
 * Generate signed URLs for private bucket files.
 * Uses service-role client to bypass storage RLS (allows admins to view
 * files uploaded by any user). Access is currently protected by the
 * client-side admin password gate in src/app/admin/layout.tsx — no
 * server-side auth check (consistent with other /api/admin/* routes).
 * See "Admin API hardening" follow-up in project-handoff-prompt.md.
 * POST /api/storage/signed-url
 * Body: { paths: string[], bucket: string }
 */
export async function POST(request: NextRequest) {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      console.error("[signed-url] SUPABASE_SERVICE_ROLE_KEY not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { paths, bucket } = await request.json();

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json(
        { error: "paths array is required" },
        { status: 400 }
      );
    }

    if (paths.length > MAX_PATHS_PER_REQUEST) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PATHS_PER_REQUEST} paths per request` },
        { status: 400 }
      );
    }

    const validPaths = paths.filter(
      (p): p is string => typeof p === "string" && p.trim().length > 0
    );

    if (validPaths.length === 0) {
      return NextResponse.json(
        { error: "No valid paths provided" },
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

    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey
    );

    const signedUrls: Record<string, string> = {};

    for (const path of validPaths) {
      const { data, error } = await serviceClient.storage
        .from(bucket)
        .createSignedUrl(path, 3600);

      if (error) {
        console.error(`[signed-url] Failed for ${path}:`, error);
        continue;
      }

      if (data?.signedUrl) {
        signedUrls[path] = data.signedUrl;
      }
    }

    return NextResponse.json({ signedUrls });
  } catch (error) {
    console.error("[signed-url] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate signed URLs" },
      { status: 500 }
    );
  }
}
