"use client";

// Note: useState removed - will be needed again when we add proper photos back
import { X, Anchor, Star, MapPin, Compass, Ship, Check, AlertTriangle, Leaf } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, parseJsonArray } from "@/lib/utils";
import { ANCHORAGE_AMENITIES } from "@/lib/constants";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface Anchorage {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  island: string;
  depth: string | null;
  holding: string | null;
  protection: string | null;
  capacity: number | null;
  amenities: string | null;
  images: string | null;
  hasReef?: boolean;
  hasSeagrass?: boolean;
  habitatWarning?: string | null;
  moorings?: { id: string; name: string; pricePerNight: number; maxLength: number }[];
  reviews?: { rating: number }[];
  _count?: { reviews: number; moorings: number };
}

interface AnchoragePanelProps {
  anchorage: Anchorage | null;
  isLoading?: boolean;
  onClose: () => void;
  className?: string;
}

export function AnchoragePanel({ anchorage, isLoading, onClose, className }: AnchoragePanelProps) {
  const amenities = anchorage ? parseJsonArray(anchorage.amenities) : [];
  // Note: images data kept in interface but not rendered until we have proper photos
  // const images = anchorage ? parseJsonArray(anchorage.images) : [];

  // Lock body scroll when panel is open (mobile)
  useBodyScrollLock(!!anchorage || !!isLoading);

  const averageRating = anchorage?.reviews?.length
    ? anchorage.reviews.reduce((sum, r) => sum + r.rating, 0) / anchorage.reviews.length
    : null;

  const hasSensitiveHabitat = anchorage?.hasReef || anchorage?.hasSeagrass;
  const mooringCount = anchorage?._count?.moorings || anchorage?.moorings?.length || 0;
  const lowestPrice = anchorage?.moorings?.length
    ? Math.min(...anchorage.moorings.map((m) => m.pricePerNight))
    : null;

  if (!anchorage && !isLoading) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col overflow-hidden rounded-t-3xl border-t bg-background shadow-2xl transition-transform duration-300 md:absolute md:inset-auto md:right-0 md:top-0 md:h-full md:max-h-none md:w-96 md:rounded-none md:rounded-l-xl md:border-l md:border-t-0",
        className
      )}
    >
      {/* Fixed header with handle bar and close button */}
      <div className="relative z-20 flex-shrink-0 bg-background">
        {/* Handle bar (mobile) */}
        <div className="flex justify-center py-2 md:hidden">
          <div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
          aria-label="Close panel"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div
        className="min-h-0 flex-1 overflow-y-auto pb-24 md:pb-4 scrollbar-thin overscroll-contain"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
        }}
      >
        {isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : anchorage ? (
          <>
            {/* Header Image - temporarily hidden until we have proper photos */}
            <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-ocean-100 to-ocean-200 dark:from-ocean-900 dark:to-ocean-800 md:h-48">
              <Anchor className="h-16 w-16 text-ocean-400/50" />
            </div>

            {/* Details */}
            <div className="p-4 space-y-4">
              {/* Header */}
              <div>
                <h2 className="text-xl font-semibold">{anchorage.name}</h2>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{anchorage.island}</span>
                  {averageRating && (
                    <>
                      <span>•</span>
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{averageRating.toFixed(1)}</span>
                        <span className="ml-1 text-xs">
                          ({anchorage._count?.reviews || anchorage.reviews?.length || 0})
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">{anchorage.description}</p>

              {/* Sensitive Habitat Warning */}
              {hasSensitiveHabitat && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Sensitive Marine Habitat
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {anchorage.hasReef && (
                          <Badge variant="outline" className="border-amber-300 bg-amber-100/50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                            <Leaf className="mr-1 h-3 w-3" />
                            Coral Reef
                          </Badge>
                        )}
                        {anchorage.hasSeagrass && (
                          <Badge variant="outline" className="border-amber-300 bg-amber-100/50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                            <Leaf className="mr-1 h-3 w-3" />
                            Seagrass
                          </Badge>
                        )}
                      </div>
                      {anchorage.habitatWarning && (
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          {anchorage.habitatWarning}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-3">
                {anchorage.depth && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Depth</p>
                    <p className="font-medium">{anchorage.depth}</p>
                  </div>
                )}
                {anchorage.holding && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Holding</p>
                    <p className="font-medium capitalize">{anchorage.holding}</p>
                  </div>
                )}
                {anchorage.protection && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Protection</p>
                    <p className="font-medium capitalize">{anchorage.protection.replace(/_/g, " ")}</p>
                  </div>
                )}
                {anchorage.capacity && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Capacity</p>
                    <p className="font-medium">{anchorage.capacity} boats</p>
                  </div>
                )}
              </div>

              {/* Coordinates */}
              <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
                <Compass className="h-4 w-4 text-muted-foreground" />
                <span>
                  {anchorage.latitude.toFixed(5)}, {anchorage.longitude.toFixed(5)}
                </span>
              </div>

              {/* Amenities */}
              {amenities.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((amenity) => {
                      const amenityInfo = ANCHORAGE_AMENITIES.find((a) => a.value === amenity);
                      return (
                        <Badge key={amenity} variant="secondary">
                          <Check className="mr-1 h-3 w-3" />
                          {amenityInfo?.label || amenity}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Moorings Summary */}
              {mooringCount > 0 && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Ship className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Moorings Available</h3>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {mooringCount} {mooringCount === 1 ? "mooring" : "moorings"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-center p-2 rounded-lg bg-background">
                      <p className="text-xs text-muted-foreground">Starting from</p>
                      <p className="text-lg font-semibold text-primary">
                        ${lowestPrice}/night
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-background">
                      <p className="text-xs text-muted-foreground">Max boat length</p>
                      <p className="text-lg font-semibold">
                        {anchorage.moorings?.length
                          ? Math.max(...anchorage.moorings.map((m) => m.maxLength))
                          : "—"} ft
                      </p>
                    </div>
                  </div>

                  {/* Show first few moorings */}
                  {anchorage.moorings && anchorage.moorings.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {anchorage.moorings.slice(0, 3).map((mooring) => (
                        <div
                          key={mooring.id}
                          className="flex items-center justify-between rounded-lg bg-background p-2.5 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="font-medium">{mooring.name}</span>
                            <span className="text-xs text-muted-foreground">
                              up to {mooring.maxLength}ft
                            </span>
                          </div>
                          <span className="font-medium text-primary">
                            ${mooring.pricePerNight}
                          </span>
                        </div>
                      ))}
                      {anchorage.moorings.length > 3 && (
                        <p className="text-xs text-center text-muted-foreground">
                          +{anchorage.moorings.length - 3} more moorings available
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Reserve Mooring Button */}
              <div className="sticky bottom-0 pt-2 pb-4 bg-background">
                <Button asChild size="lg" className="w-full rounded-full h-12 text-base shadow-lg">
                  <Link href={`/moorings?anchorage=${anchorage.id}`}>
                    <Ship className="mr-2 h-5 w-5" />
                    Reserve a Mooring
                  </Link>
                </Button>
                {!mooringCount && (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    No moorings available - anchoring only
                  </p>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
