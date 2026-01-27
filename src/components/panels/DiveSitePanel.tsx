"use client";

import { X, MapPin, Waves, Fish, Star, ExternalLink, Heart, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DiveSite } from "@/lib/constants/dive-sites";

interface DiveSitePanelProps {
  diveSite: DiveSite | null;
  onClose: () => void;
  className?: string;
}

const difficultyColors = {
  beginner: "bg-green-500",
  intermediate: "bg-yellow-500",
  advanced: "bg-red-500",
};

const difficultyLabels = {
  beginner: "Beginner Friendly",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function DiveSitePanel({ diveSite, onClose, className }: DiveSitePanelProps) {
  if (!diveSite) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-hidden rounded-t-3xl border-t bg-background shadow-2xl transition-transform duration-300 md:absolute md:inset-auto md:right-0 md:top-0 md:h-full md:max-h-none md:w-96 md:rounded-none md:rounded-l-xl md:border-l md:border-t-0",
        className
      )}
    >
      {/* Handle bar (mobile) */}
      <div className="flex justify-center py-2 md:hidden">
        <div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
      </div>

      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute right-2 top-2 z-10"
        aria-label="Close panel"
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Content */}
      <div className="h-full overflow-y-auto pb-20 md:pb-0 scrollbar-thin">
        {/* Header Image/Icon */}
        <div className="relative h-52 w-full overflow-hidden md:h-64 bg-gradient-to-br from-red-600 to-red-800">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="h-20 w-20 mb-3">
              <svg viewBox="0 0 32 40" className="w-full h-full">
                <rect x="2" y="0" width="3" height="40" fill="#fff" opacity="0.8"/>
                <rect x="5" y="2" width="24" height="18" fill="#fff"/>
                <polygon points="5,2 29,20 29,14 11,2" fill="#DC2626"/>
                <polygon points="5,8 23,20 29,20 5,2" fill="#DC2626"/>
              </svg>
            </div>
            <span className="text-sm font-medium opacity-90">Dive Site</span>
          </div>
          {diveSite.isArtReef && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-purple-600 hover:bg-purple-600 text-white border-0">
                <Star className="mr-1 h-3 w-3 fill-current" />
                BVI Art Reef
              </Badge>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-4 space-y-4">
          {/* Header */}
          <div>
            <h2 className="text-xl font-semibold">{diveSite.name}</h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{diveSite.location}</span>
            </div>
          </div>

          {/* BVI Art Reef Donation Banner */}
          {diveSite.isArtReef && diveSite.artReefInfo && (
            <div className="rounded-xl border-2 border-purple-500 bg-purple-50 dark:bg-purple-950/30 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400 fill-current" />
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                    {diveSite.artReefInfo.organization}
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    {diveSite.artReefInfo.donation}
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                  >
                    <Link href={diveSite.artReefInfo.donationUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Donate at 1beyondthereef.com
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">Depth Range</p>
              <p className="font-medium">{diveSite.depthRange.min} - {diveSite.depthRange.max} ft</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">Difficulty</p>
              <div className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", difficultyColors[diveSite.difficulty])} />
                <p className="font-medium capitalize">{difficultyLabels[diveSite.difficulty]}</p>
              </div>
            </div>
          </div>

          {/* History */}
          <div>
            <h3 className="mb-2 text-sm font-medium flex items-center gap-2">
              <Waves className="h-4 w-4 text-primary" />
              History & Background
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{diveSite.history}</p>
          </div>

          {/* Highlights */}
          {diveSite.highlights && diveSite.highlights.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                Highlights
              </h3>
              <div className="space-y-1.5">
                {diveSite.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <ChevronRight className="h-3 w-3 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Marine Life */}
          {diveSite.marineLife && diveSite.marineLife.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium flex items-center gap-2">
                <Fish className="h-4 w-4 text-primary" />
                Marine Life
              </h3>
              <div className="flex flex-wrap gap-2">
                {diveSite.marineLife.map((species, index) => (
                  <Badge key={index} variant="secondary">
                    {species}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Best For */}
          {diveSite.bestFor && diveSite.bestFor.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium">Best For</h3>
              <div className="flex flex-wrap gap-2">
                {diveSite.bestFor.map((activity, index) => (
                  <Badge key={index} variant="outline" className="border-primary/30 text-primary">
                    {activity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Coordinates */}
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>
              {diveSite.coordinates.lat.toFixed(5)}, {diveSite.coordinates.lng.toFixed(5)}
            </span>
          </div>

          {/* Dive Booking Prompt */}
          <div className="sticky bottom-0 pt-2 pb-4 bg-background">
            <p className="text-xs text-center text-muted-foreground mb-2">
              Contact a local dive operator to book this dive
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
