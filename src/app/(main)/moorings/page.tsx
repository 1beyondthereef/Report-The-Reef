"use client";

import { Anchor } from "lucide-react";

export default function MooringsPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Anchor className="h-10 w-10 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Coming Soon</h1>
          <h2 className="text-xl font-medium text-muted-foreground">
            Mooring Reservations
          </h2>
        </div>

        <p className="text-muted-foreground">
          We&apos;re partnering with local providers to bring you easy mooring
          reservations directly through Report The Reef. Stay tuned!
        </p>

        <div className="pt-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            In Development
          </div>
        </div>
      </div>
    </div>
  );
}
