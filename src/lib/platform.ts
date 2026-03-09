import { Capacitor } from "@capacitor/core";

export function isNativePlatform(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function getPlatform(): "ios" | "android" | "web" {
  try {
    const platform = Capacitor.getPlatform();
    if (platform === "ios") return "ios";
    if (platform === "android") return "android";
  } catch {}
  return "web";
}

/** Returns 'apns' for iOS native, 'web' for everything else (including Android TWA). */
export function getPushChannel(): "web" | "apns" {
  return getPlatform() === "ios" ? "apns" : "web";
}
