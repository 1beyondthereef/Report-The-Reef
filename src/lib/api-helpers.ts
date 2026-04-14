import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

interface AuthResult {
  supabase: SupabaseClient;
  user: User;
}

/**
 * Authenticate the current request. Returns the Supabase client and user,
 * or a 401 NextResponse if unauthenticated.
 */
export async function withAuth(): Promise<AuthResult | NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return { supabase, user };
}

/**
 * Check if a user ID is in the ADMIN_USER_IDS allowlist.
 * Set ADMIN_USER_IDS as a comma-separated list of Supabase user UUIDs.
 */
export function isAdmin(userId: string): boolean {
  const adminIds = process.env.ADMIN_USER_IDS?.split(",").map((id) => id.trim()).filter(Boolean) ?? [];
  return adminIds.includes(userId);
}

/**
 * Returns the set of user IDs that should be excluded from results
 * (users the current user has blocked or been blocked by).
 */
export async function getBlockedUserIds(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data: blocked } = await supabase
    .from("blocked_users")
    .select("blocker_id, blocked_id")
    .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

  const blockedIds = (blocked || []).flatMap((b) => [b.blocker_id, b.blocked_id]);
  return Array.from(new Set(blockedIds)).filter((id) => id !== userId);
}
