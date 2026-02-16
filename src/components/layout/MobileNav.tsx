"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, AlertTriangle, Anchor, Ship, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePWAStandalone } from "@/hooks/usePWAStandalone";
import { WhaleIcon } from "@/components/icons/WhaleIcon";
import { ConnectNavBadge } from "@/components/ConnectNavBadge";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/report", label: "Report", icon: AlertTriangle },
  { href: "/wildlife", label: "Wildlife", icon: WhaleIcon },
  { href: "/anchorages", label: "Explore", icon: Anchor },
  { href: "/moorings", label: "Reserve", icon: Ship },
  { href: "/connect", label: "Connect", icon: Users },
];

export function MobileNav() {
  const pathname = usePathname();
  const isStandalone = usePWAStandalone();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Glassmorphism container */}
      <div
        className={cn(
          "rounded-2xl bg-background/80 backdrop-blur-xl border border-border/50 shadow-soft-lg",
          // Normal browser: more margin
          "mx-4 mb-4",
          // PWA standalone: edge-to-edge, less margin
          isStandalone && "mx-2 mb-2 rounded-xl"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-around",
            // Normal height
            "h-16 px-1",
            // PWA standalone: more compact
            isStandalone && "h-14 px-0.5"
          )}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-xl touch-target",
                  "transition-all duration-300 ease-out",
                  // Normal spacing
                  "space-y-1 px-3 py-2",
                  // PWA standalone: tighter spacing
                  isStandalone && "space-y-0.5 px-2 py-1.5",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:scale-95"
                )}
              >
                {/* Active background indicator */}
                {isActive && (
                  <span className="absolute inset-0 rounded-xl bg-primary/10 animate-scale-in" />
                )}
                {/* Wrap Connect icon in relative container for badge */}
                {item.href === "/connect" ? (
                  <div className="relative">
                    <Icon className={cn(
                      "relative z-10 transition-transform duration-300",
                      "h-5 w-5",
                      isStandalone && "h-4 w-4",
                      isActive && "scale-110"
                    )} />
                    <ConnectNavBadge />
                  </div>
                ) : (
                  <Icon className={cn(
                    "relative z-10 transition-transform duration-300",
                    "h-5 w-5",
                    isStandalone && "h-4 w-4",
                    isActive && "scale-110"
                  )} />
                )}
                <span className={cn(
                  "relative z-10 font-medium tracking-wide uppercase transition-all duration-300",
                  // Normal text size
                  "text-[10px]",
                  // PWA standalone: smaller text
                  isStandalone && "text-[8px]",
                  isActive ? "opacity-100" : "opacity-70"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      {/* Safe area padding for iOS - important for PWA */}
      <div className={cn(
        "bg-background/80 backdrop-blur-xl",
        isStandalone ? "pb-safe-area-inset-bottom" : "h-0"
      )} />
    </nav>
  );
}
