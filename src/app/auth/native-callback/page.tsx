"use client";

import { useEffect, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";

type Status = "linking" | "fallback" | "error";

function NativeCallbackContent() {
  const [status, setStatus] = useState<Status>("linking");
  const [deepLinkUrl, setDeepLinkUrl] = useState("");

  useEffect(() => {
    const search = window.location.search;
    const hash = window.location.hash;

    if (search.length <= 1 && hash.length <= 1) {
      setStatus("error");
      return;
    }

    const url = `reportthereef://auth/native-callback${search}${hash}`;
    setDeepLinkUrl(url);
    window.location.href = url;

    const timer = setTimeout(() => setStatus("fallback"), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (status === "linking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1628]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-400" />
          <p className="mt-4 text-white">Returning to app...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1628] p-4">
        <div className="max-w-sm rounded-xl bg-slate-800 p-6 text-center shadow-lg">
          <h2 className="mb-2 text-xl font-semibold text-white">
            Sign-in Failed
          </h2>
          <p className="mb-6 text-slate-300">
            No authorization data received. Please try again.
          </p>
          <a
            href="/login"
            className="inline-block rounded-lg bg-cyan-500 px-6 py-3 font-medium text-white hover:bg-cyan-600"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a1628] p-4">
      <div className="max-w-sm rounded-xl bg-slate-800 p-6 text-center shadow-lg">
        <h2 className="mb-2 text-xl font-semibold text-white">
          Sign-in Complete
        </h2>
        <p className="mb-6 text-slate-300">
          If the app didn&apos;t open automatically, tap below to return.
        </p>
        <a
          href={deepLinkUrl}
          className="inline-block rounded-lg bg-cyan-500 px-6 py-3 font-medium text-white hover:bg-cyan-600"
        >
          Open Report The Reef
        </a>
        <div className="mt-4">
          <a
            href="/login"
            className="text-sm text-slate-400 underline hover:text-slate-300"
          >
            Or sign in again
          </a>
        </div>
      </div>
    </div>
  );
}

export default function NativeCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a1628]">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      }
    >
      <NativeCallbackContent />
    </Suspense>
  );
}
