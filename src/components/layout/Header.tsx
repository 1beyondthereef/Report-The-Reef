"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, AlertTriangle, Anchor, Ship, Users, Menu, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";
import { usePWAStandalone } from "@/hooks/usePWAStandalone";
import { WhaleIcon } from "@/components/icons/WhaleIcon";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/report", label: "Report", icon: AlertTriangle },
  { href: "/wildlife", label: "Wildlife", icon: WhaleIcon },
  { href: "/anchorages", label: "Explore", icon: Anchor },
  { href: "/moorings", label: "Reserve", icon: Ship },
  { href: "/social", label: "Connect", icon: Users },
];

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const isStandalone = usePWAStandalone();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
        // PWA standalone mode - add safe area padding for notch
        isStandalone && "pt-safe-area-inset-top"
      )}
    >
      <div
        className={cn(
          "container flex items-center justify-between",
          // Mobile: compact header
          "h-14 px-3",
          // Tablet: medium size
          "sm:h-16 sm:px-4",
          // Desktop: full size header
          "md:h-20 md:px-6",
          "lg:h-44 lg:px-8",
          // PWA standalone: even more compact on mobile
          isStandalone && "h-12 sm:h-14 md:h-16 lg:h-36"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <Image
            src="/logo-main.png"
            alt="Report The Reef"
            width={450}
            height={180}
            className={cn(
              "w-auto object-contain transition-opacity duration-300 group-hover:opacity-90 mix-blend-screen",
              // Mobile: small logo
              "h-10",
              // Tablet: medium logo
              "sm:h-12",
              // Desktop: larger logo
              "md:h-16",
              "lg:h-36",
              // PWA standalone: smaller logos
              isStandalone && "h-8 sm:h-10 md:h-12 lg:h-28"
            )}
            priority
          />
        </Link>

        {/* Desktop Navigation - hidden on mobile/tablet, shown on lg+ */}
        <nav className="hidden lg:flex lg:items-center lg:space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center space-x-2 rounded-full font-medium transition-all duration-300",
                  // Responsive padding and text size
                  "px-3 py-2 text-sm",
                  "xl:px-5 xl:py-2.5 xl:text-base",
                  // PWA standalone: more compact nav
                  isStandalone && "px-2 py-1.5 text-xs xl:px-3 xl:py-2 xl:text-sm",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4",
                  "xl:h-5 xl:w-5",
                  isStandalone && "h-3.5 w-3.5 xl:h-4 xl:w-4"
                )} />
                <span>{item.label}</span>
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute inset-0 rounded-full bg-primary/10 -z-10" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className={cn(
          "flex items-center",
          "space-x-2",
          "sm:space-x-3"
        )}>
          {/* Auth */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "relative rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all duration-300",
                    "h-8 w-8",
                    "sm:h-9 sm:w-9",
                    "md:h-10 md:w-10",
                    isStandalone && "h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                  )}
                >
                  <Avatar className={cn(
                    "h-8 w-8",
                    "sm:h-9 sm:w-9",
                    "md:h-10 md:w-10",
                    isStandalone && "h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                  )}>
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs sm:text-sm">
                      {user?.name ? getInitials(user.name) : user?.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-2xl p-2 shadow-soft-lg border-border/50" align="end" forceMount>
                <DropdownMenuLabel className="font-normal px-3 py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || "Boater"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2 cursor-pointer">
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  className="rounded-xl px-3 py-2 cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              size="sm"
              className={cn(
                "rounded-full font-medium",
                "h-8 px-3 text-xs",
                "sm:h-9 sm:px-4 sm:text-sm",
                "md:h-10 md:px-6",
                isStandalone && "h-7 px-2.5 text-xs sm:h-8 sm:px-3"
              )}
            >
              <Link href="/login">Sign In</Link>
            </Button>
          )}

          {/* Mobile/Tablet menu - show on screens smaller than lg */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full",
                  "h-8 w-8",
                  "sm:h-9 sm:w-9",
                  "md:h-10 md:w-10",
                  isStandalone && "h-7 w-7 sm:h-8 sm:w-8"
                )}
              >
                <Menu className={cn(
                  "h-4 w-4",
                  "sm:h-5 sm:w-5",
                  isStandalone && "h-3.5 w-3.5 sm:h-4 sm:w-4"
                )} />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-soft-lg border-border/50 lg:hidden">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <DropdownMenuItem key={item.href} asChild className={cn(
                    "rounded-xl px-3 py-2 cursor-pointer",
                    isActive && "bg-primary/10 text-primary"
                  )}>
                    <Link href={item.href}>
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
