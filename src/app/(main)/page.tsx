"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Anchor,
  Ship,
  Users,
  ArrowRight,
  Waves,
  MapPin,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Stats {
  totalIncidents: number;
  totalAnchorages: number;
  totalMoorings: number;
  totalUsers: number;
}

const features = [
  {
    icon: AlertTriangle,
    title: "Report",
    subtitle: "Protect Our Waters",
    description: "Document environmental concerns and help preserve the pristine BVI marine ecosystem.",
    href: "/report",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: Anchor,
    title: "Explore",
    subtitle: "Discover Anchorages",
    description: "Navigate to the most beautiful and protected spots across the British Virgin Islands.",
    href: "/anchorages",
    gradient: "from-ocean-500/10 to-cyan-500/10",
    iconColor: "text-ocean-600 dark:text-ocean-400",
  },
  {
    icon: Ship,
    title: "Reserve",
    subtitle: "Secure Your Mooring",
    description: "Book premium mooring balls in advance and enjoy peace of mind on your voyage.",
    href: "/moorings",
    gradient: "from-blue-500/10 to-indigo-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Users,
    title: "Connect",
    subtitle: "Join the Community",
    description: "Meet fellow sailors, share experiences, and build lasting connections on the water.",
    href: "/social",
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
];

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({ totalIncidents: 0, totalAnchorages: 0, totalMoorings: 0, totalUsers: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data.stats || data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-ocean-50/50 via-background to-background dark:from-ocean-950/30" />

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-ocean-200/20 dark:bg-ocean-800/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-ocean-300/10 dark:bg-ocean-700/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1.5s" }} />

        <div className="container relative z-10 px-6 md:px-8 text-center">
          <div className={cn(
            "transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ocean-100/50 dark:bg-ocean-900/30 border border-ocean-200/50 dark:border-ocean-800/50 mb-8">
              <Waves className="w-4 h-4 text-ocean-600 dark:text-ocean-400" />
              <span className="text-sm font-medium text-ocean-700 dark:text-ocean-300">British Virgin Islands</span>
            </div>

            {/* Main heading */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-foreground mb-6">
              <span className="text-gradient">Report The Reef</span>
            </h1>

            {/* Subheading */}
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-light leading-relaxed mb-10">
              Join a community of sailors dedicated to preserving the pristine waters
              and vibrant reefs of the British Virgin Islands.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="h-14 px-8 text-base rounded-full bg-primary hover:bg-primary/90 shadow-soft-lg hover:shadow-glow transition-all duration-400"
              >
                <Link href="/report">
                  Report an Incident
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-8 text-base rounded-full border-2 hover:bg-accent/50 transition-all duration-400"
              >
                <Link href="/anchorages">
                  Explore Anchorages
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 border-y border-border/50 bg-muted/30">
        <div className="container px-6 md:px-8">
          <div className={cn(
            "grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12",
            "transition-all duration-700 delay-300",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            {[
              { value: stats.totalIncidents, label: "Incidents Reported", icon: Shield },
              { value: stats.totalAnchorages, label: "Anchorages", icon: MapPin },
              { value: stats.totalMoorings, label: "Moorings Available", icon: Anchor },
              { value: stats.totalUsers, label: "Community Members", icon: Users },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="text-center group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <stat.icon className="w-5 h-5 mx-auto mb-3 text-primary/60 group-hover:text-primary transition-colors duration-300" />
                <div className="font-serif text-3xl md:text-4xl font-light text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground tracking-wide uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container px-6 md:px-8">
          {/* Section header */}
          <div className={cn(
            "text-center mb-16 md:mb-20",
            "transition-all duration-700 delay-500",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete platform for responsible boating in the British Virgin Islands
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Link
                key={feature.title}
                href={feature.href}
                className={cn(
                  "group relative p-8 md:p-10 rounded-3xl",
                  "bg-card border border-border/50",
                  "shadow-soft hover:shadow-soft-lg",
                  "transition-all duration-500 ease-out",
                  "hover:-translate-y-1",
                  isVisible ? "animate-fade-in-up" : "opacity-0"
                )}
                style={{ animationDelay: `${600 + index * 100}ms`, animationFillMode: "both" }}
              >
                {/* Gradient overlay on hover */}
                <div className={cn(
                  "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100",
                  "bg-gradient-to-br transition-opacity duration-500",
                  feature.gradient
                )} />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={cn(
                    "inline-flex items-center justify-center w-14 h-14 rounded-2xl",
                    "bg-muted/50 group-hover:bg-background/80",
                    "transition-all duration-400 mb-6"
                  )}>
                    <feature.icon className={cn("w-7 h-7 transition-colors duration-400", feature.iconColor)} />
                  </div>

                  {/* Content */}
                  <div className="space-y-2 mb-6">
                    <p className="text-sm font-medium text-primary tracking-wide uppercase font-sans">
                      {feature.title}
                    </p>
                    <h3 className="font-serif text-2xl md:text-3xl font-light text-foreground">
                      {feature.subtitle}
                    </h3>
                  </div>

                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className="flex items-center text-primary font-medium font-sans">
                    <span className="text-sm">Learn more</span>
                    <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding bg-gradient-to-b from-muted/30 to-background">
        <div className="container px-6 md:px-8">
          <div className={cn(
            "max-w-3xl mx-auto text-center",
            "transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Your reports help protect the marine environment for generations of sailors to come.
            </p>
            <Button
              asChild
              size="lg"
              className="h-14 px-10 text-base rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-soft-lg transition-all duration-400"
            >
              <Link href="/report">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
