"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();

      // Get the 'next' parameter for redirect after auth
      const next = searchParams.get("next") || "/connect";

      // Check for error in query params
      const errorDescription = searchParams.get("error_description");
      if (errorDescription) {
        setError(decodeURIComponent(errorDescription));
        return;
      }

      // For implicit flow, tokens are in the URL hash
      // Supabase client automatically detects and processes them
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError.message);
        setError(sessionError.message);
        return;
      }

      if (session) {
        // Successfully authenticated, redirect
        router.replace(next);
        return;
      }

      // If no session yet, try to exchange code (PKCE fallback)
      const code = searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("Code exchange error:", exchangeError.message);
          setError(exchangeError.message);
          return;
        }
        router.replace(next);
        return;
      }

      // Handle token_hash flow (email confirmation)
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      if (tokenHash && type) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "email" | "magiclink",
        });
        if (verifyError) {
          console.error("Token verification error:", verifyError.message);
          setError(verifyError.message);
          return;
        }
        router.replace(next);
        return;
      }

      // No valid auth parameters found, but session might still be set from hash
      // Wait a moment and check again
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: { session: retrySession } } = await supabase.auth.getSession();
      if (retrySession) {
        router.replace(next);
        return;
      }

      // Still no session
      setError("Authentication failed. Please try signing in again.");
    };

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Authentication Failed</CardTitle>
            <CardDescription>{error}</CardDescription>
            <a
              href="/login"
              className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Try Again
            </a>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <CardTitle>Signing you in...</CardTitle>
          <CardDescription>Please wait while we verify your credentials.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
