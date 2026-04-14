"use client";

import { useState, useEffect } from "react";

export function usePWAStandalone() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (PWA installed)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        // iOS Safari standalone detection
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
        // Android TWA
        document.referrer.includes("android-app://");

      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Listen for changes in display mode
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isStandalone;
}
