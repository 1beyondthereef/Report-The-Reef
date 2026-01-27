"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, AlertTriangle, Anchor, Ship, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/report", label: "Report", icon: AlertTriangle },
  { href: "/anchorages", label: "Explore", icon: Anchor },
  { href: "/moorings", label: "Reserve", icon: Ship },
  { href: "/social", label: "Connect", icon: Users },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Glassmorphism container */}
      <div className="mx-4 mb-4 rounded-2xl bg-background/80 backdrop-blur-xl border border-border/50 shadow-soft-lg">
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center space-y-1 rounded-xl px-4 py-2 touch-target",
                  "transition-all duration-300 ease-out",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:scale-95"
                )}
              >
                {/* Active background indicator */}
                {isActive && (
                  <span className="absolute inset-0 rounded-xl bg-primary/10 animate-scale-in" />
                )}
                <Icon className={cn(
                  "relative z-10 h-5 w-5 transition-transform duration-300",
                  isActive && "scale-110"
                )} />
                <span className={cn(
                  "relative z-10 text-[10px] font-medium tracking-wide uppercase transition-all duration-300",
                  isActive ? "opacity-100" : "opacity-70"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}
