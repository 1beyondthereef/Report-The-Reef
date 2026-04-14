import { redirect } from "next/navigation";

/**
 * Legacy /social route — redirects to /connect.
 * Safe to delete after March 13, 2026 if no traffic hits this page.
 */
export default function SocialPage() {
  redirect("/connect");
}
