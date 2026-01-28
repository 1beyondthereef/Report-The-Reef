"use client";

import { useState, useEffect } from "react";
import { X, Download, Share, Plus, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if previously dismissed
    const dismissedTime = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissedTime) {
      const dismissedDate = new Date(parseInt(dismissedTime));
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setDismissed(true);
        return;
      }
    }

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches;

    if (isIOS && !isInStandaloneMode) {
      // Delay showing iOS prompt
      const timer = setTimeout(() => setShowIOSPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Listen for Android install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowAndroidPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowAndroidPrompt(false);
      setShowIOSPrompt(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowAndroidPrompt(false);
  };

  const handleDismiss = () => {
    setShowIOSPrompt(false);
    setShowAndroidPrompt(false);
    setDismissed(true);
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  if (isInstalled || dismissed || (!showIOSPrompt && !showAndroidPrompt)) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:w-96",
      "animate-in slide-in-from-bottom-4 duration-300"
    )}>
      <div className="rounded-2xl border bg-background/95 backdrop-blur-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Install Report The Reef</h3>
                <p className="text-sm text-white/80">Add to your home screen</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {showAndroidPrompt && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Install our app for quick access to explore anchorages, report reef damage, and connect with the BVI sailing community.
              </p>
              <Button
                onClick={handleInstallClick}
                className="w-full bg-teal-500 hover:bg-teal-600"
              >
                <Download className="mr-2 h-4 w-4" />
                Install App
              </Button>
            </>
          )}

          {showIOSPrompt && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Install our app for the best experience on your iPhone or iPad.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <div className="h-8 w-8 rounded-full bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-teal-500 font-semibold">1</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>Tap the</span>
                    <Share className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Share</span>
                    <span>button</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <div className="h-8 w-8 rounded-full bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-teal-500 font-semibold">2</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>Scroll and tap</span>
                    <Plus className="h-4 w-4" />
                    <span className="font-medium">Add to Home Screen</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="w-full mt-4"
              >
                Got it
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
