import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Report The Reef — BVI Marine Conservation",
    template: "%s — Report The Reef",
  },
  description:
    "Protect British Virgin Islands waters through community-driven conservation. Explore pristine anchorages, reserve moorings, and connect with fellow sailors.",
  keywords: [
    "BVI",
    "British Virgin Islands",
    "marine conservation",
    "reef protection",
    "luxury sailing",
    "anchorage",
    "mooring",
    "Caribbean yacht",
  ],
  authors: [{ name: "Report The Reef" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Report The Reef",
    title: "Report The Reef — BVI Marine Conservation",
    description:
      "Protect British Virgin Islands waters through community-driven conservation.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Report The Reef",
    description: "BVI Marine Conservation & Sailing Community",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111716" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
