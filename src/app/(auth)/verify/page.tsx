"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    error ? "error" : "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    error ? decodeURIComponent(error) : null
  );

  useEffect(() => {
    if (error || !token) {
      setStatus("error");
      if (!token) {
        setErrorMessage("Invalid verification link");
      }
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);

        if (!response.ok && !response.redirected) {
          setStatus("error");
          setErrorMessage("Verification failed. Please try signing in again.");
        } else if (response.redirected) {
          window.location.href = response.url;
        } else {
          setStatus("success");
          setTimeout(() => {
            router.push("/");
          }, 2000);
        }
      } catch {
        setStatus("error");
        setErrorMessage("Network error. Please try again.");
      }
    };

    verifyToken();
  }, [token, error, router]);

  if (status === "loading") {
    return (
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <CardTitle>Verifying...</CardTitle>
          <CardDescription>
            Please wait while we verify your magic link.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>Success!</CardTitle>
          <CardDescription>
            You&apos;re signed in. Redirecting you now...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <CardTitle>Verification Failed</CardTitle>
        <CardDescription>
          {errorMessage || "This link is invalid or has expired."}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button asChild className="w-full">
          <Link href="/login">Try Again</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function VerifyFallback() {
  return (
    <Card className="shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <CardTitle>Loading...</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyFallback />}>
      <VerifyContent />
    </Suspense>
  );
}
