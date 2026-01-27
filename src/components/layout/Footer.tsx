import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50 hidden md:block">
      <div className="container px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
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

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/report" className="text-muted-foreground hover:text-foreground">
                  Report an Incident
                </Link>
              </li>
              <li>
                <Link href="/anchorages" className="text-muted-foreground hover:text-foreground">
                  Explore Anchorages
                </Link>
              </li>
              <li>
                <Link href="/moorings" className="text-muted-foreground hover:text-foreground">
                  Reserve a Mooring
                </Link>
              </li>
              <li>
                <Link href="/social" className="text-muted-foreground hover:text-foreground">
                  Connect with Boaters
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  BVI Marine Guide
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  Weather Updates
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  Safety Guidelines
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  Cookie Policy
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
