"use client";

import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { OceanBackground } from "@/components/ui/OceanBackground";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <OceanBackground />
      <Header />
      <main id="main-content" className="flex-1 pt-14 sm:pt-16 md:pt-20 lg:pt-44 pb-20 md:pb-0">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
