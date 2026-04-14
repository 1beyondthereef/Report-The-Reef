"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // Hide footer on full-screen map pages
  if (pathname === "/anchorages") {
    return null;
  }

  return (
    <footer className="border-t bg-muted/50 hidden md:block">
      <div className="container px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-2">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="block">
              <Image
                src="/logo-main.png"
                alt="Report The Reef"
                width={180}
                height={150}
                className="h-32 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              See it. Report it. Restore it. Protecting BVI waters through community reporting and collaboration.
            </p>
          </div>

          {/* Links */}
          <div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/report" className="text-muted-foreground hover:text-foreground">
                  Report an Incident
                </Link>
              </li>
              <li>
                <Link href="/wildlife" className="text-muted-foreground hover:text-foreground">
                  Report Wildlife
                </Link>
              </li>
              <li>
                <Link href="/anchorages" className="text-muted-foreground hover:text-foreground">
                  Explore Anchorages
                </Link>
              </li>
              <li>
                <Link href="/connect" className="text-muted-foreground hover:text-foreground">
                  Connect with Boaters
                </Link>
              </li>
              <li>
                <Link href="/info" className="text-muted-foreground hover:text-foreground">
                  Info
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Report The Reef. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
