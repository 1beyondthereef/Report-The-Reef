/**
 * Multi-signal native platform detection that works reliably when
 * Capacitor loads a remote URL via server.url (bridge may not be
 * injected before first JS execution).
 */
export function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as Window & {
    Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string };
    webkit?: { messageHandlers?: Record<string, unknown> };
  };
  if (w.Capacitor?.isNativePlatform?.()) return true;
  if (w.Capacitor?.getPlatform?.() === "ios" || w.Capacitor?.getPlatform?.() === "android") return true;
  if (Boolean(w.webkit?.messageHandlers?.bridge)) return true;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if ((navigator as Navigator & { standalone?: boolean }).standalone === true) return true;
  return false;
}

export function getPlatform(): "ios" | "android" | "web" {
  if (typeof window === "undefined") return "web";
  const w = window as Window & {
    Capacitor?: { getPlatform?: () => string };
    webkit?: { messageHandlers?: Record<string, unknown> };
  };
  try {
    const platform = w.Capacitor?.getPlatform?.();
    if (platform === "ios") return "ios";
    if (platform === "android") return "android";
  } catch {}
  if (Boolean(w.webkit?.messageHandlers?.bridge)) return "ios";
  return "web";
}

/** Returns 'apns' for iOS native, 'web' for everything else (including Android TWA). */
export function getPushChannel(): "web" | "apns" {
  return getPlatform() === "ios" ? "apns" : "web";
}
