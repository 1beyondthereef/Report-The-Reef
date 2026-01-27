"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Completing sign in...");

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();

      // Check if there's a hash fragment with tokens (client-side only)
      if (typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Session error:", error);
            setStatus("error");
            setMessage("Failed to complete sign in. Please try again.");
            return;
          }

          setStatus("success");
          setMessage("Sign in successful! Redirecting...");

          // Get redirect destination
          const next = searchParams.get("next") || "/social";

          // Small delay to show success message
          setTimeout(() => {
            router.push(next);
          }, 1000);
          return;
        }
      }

      // Check for error in URL params
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error) {
        setStatus("error");
        setMessage(errorDescription || "Authentication failed. Please try again.");
        return;
      }

      // If we get here without tokens or error, check current session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setStatus("success");
        setMessage("Already signed in! Redirecting...");
        const next = searchParams.get("next") || "/social";
        setTimeout(() => {
          router.push(next);
        }, 1000);
      } else {
        // No session and no tokens - this page was accessed directly
        // The route.ts handler should have processed the code/token_hash
        // If we're here, something went wrong
        setStatus("error");
        setMessage("Authentication failed. Please try signing in again.");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            {status === "loading" && (
              <div className="bg-primary/10 rounded-full p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {status === "success" && (
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            )}
            {status === "error" && (
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            )}
          </div>
          <CardTitle>
            {status === "loading" && "Signing In..."}
            {status === "success" && "Welcome!"}
            {status === "error" && "Sign In Failed"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        {status === "error" && (
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/login">Try Again</Link>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
