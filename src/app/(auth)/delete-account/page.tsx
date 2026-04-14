"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, AlertCircle, Trash2, Mail, LogIn } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

export default function DeleteAccountPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (confirmation !== "DELETE") return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });

      if (!response.ok) {
        const data = await response.json();
        const detail = data.failedStep ? ` (step: ${data.failedStep})` : "";
        throw new Error((data.error || "Deletion failed") + detail);
      }

      await supabase.auth.signOut();
      router.push("/login?deleted=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsDeleting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Delete Your Account</CardTitle>
            <CardDescription>
              Report The Reef
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAuthenticated ? (
              <div className="space-y-6">
                <div className="space-y-3 text-sm">
                  <p className="font-medium text-foreground">
                    This action is permanent and cannot be undone. The following will be deleted:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      Account and login credentials
                    </li>
                    <li className="flex items-start gap-2">
                      <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      Profile information (name, photo, bio)
                    </li>
                    <li className="flex items-start gap-2">
                      <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      All your messages
                    </li>
                    <li className="flex items-start gap-2">
                      <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      Check-in history
                    </li>
                    <li className="flex items-start gap-2">
                      <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      Push notification subscriptions
                    </li>
                  </ul>

                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                    <p className="text-foreground font-medium mb-1">Kept for conservation</p>
                    <p className="text-muted-foreground text-xs">
                      Your incident reports and wildlife sightings will be kept to support marine
                      conservation, but your name and contact information will be permanently removed.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="confirm" className="text-sm font-medium text-foreground">
                    Type <span className="font-bold">DELETE</span> to confirm
                  </label>
                  <Input
                    id="confirm"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    placeholder="DELETE"
                    disabled={isDeleting}
                    autoComplete="off"
                  />
                </div>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDelete}
                  disabled={confirmation !== "DELETE" || isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting account...
                    </>
                  ) : (
                    "Permanently Delete My Account"
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/profile")}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Sign in to delete your account, or contact us for manual deletion.
                </p>

                <Button asChild className="w-full">
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                </Button>

                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Or request manual deletion:
                  </p>
                  <a
                    href="mailto:volunteer@1beyondthereef.com?subject=Account%20Deletion%20Request"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    volunteer@1beyondthereef.com
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
