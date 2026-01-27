"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, X, Anchor, Loader2, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnchorageMap } from "@/components/maps/AnchorageMap";
import { AnchoragePanel } from "@/components/panels/AnchoragePanel";
import { DiveSitePanel } from "@/components/panels/DiveSitePanel";
import { BVI_ISLANDS } from "@/lib/constants";
import { BVI_DIVE_SITES, type DiveSite } from "@/lib/constants/dive-sites";
import { cn } from "@/lib/utils";

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

type MarkerFilter = "all" | "anchorages" | "dive-sites";

export default function AnchoragesPage() {
  const [anchorages, setAnchorages] = useState<Anchorage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnchorage, setSelectedAnchorage] = useState<Anchorage | null>(null);
  const [selectedDiveSite, setSelectedDiveSite] = useState<DiveSite | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIsland, setSelectedIsland] = useState<string>("");
  const [markerFilter, setMarkerFilter] = useState<MarkerFilter>("all");
  const [view, setView] = useState<"map" | "list">("map");

  // Filter dive sites based on search
  const filteredDiveSites = BVI_DIVE_SITES.filter((site) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      site.name.toLowerCase().includes(query) ||
      site.location.toLowerCase().includes(query) ||
      site.history.toLowerCase().includes(query)
    );
  });

  const showAnchorages = markerFilter === "all" || markerFilter === "anchorages";
  const showDiveSites = markerFilter === "all" || markerFilter === "dive-sites";

  const handleSelectAnchorage = (anchorage: Anchorage) => {
    setSelectedDiveSite(null);
    setSelectedAnchorage(anchorage);
  };

  const handleSelectDiveSite = (diveSite: DiveSite) => {
    setSelectedAnchorage(null);
    setSelectedDiveSite(diveSite);
  };

  const fetchAnchorages = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedIsland && selectedIsland !== "all") params.append("island", selectedIsland);

      const response = await fetch(`/api/anchorages?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAnchorages(data.anchorages);
      }
    } catch (error) {
      console.error("Failed to fetch anchorages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedIsland]);

  useEffect(() => {
    fetchAnchorages();
  }, [fetchAnchorages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnchorages();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedIsland("");
    setMarkerFilter("all");
  };

  const hasActiveFilters = searchQuery || selectedIsland || markerFilter !== "all";

  return (
    <div className="relative h-[calc(100vh-4rem-4rem)] md:h-[calc(100vh-4rem)]">
      {/* Search and Filters */}
      <div className="absolute left-0 right-0 top-0 z-10 bg-background/95 p-4 backdrop-blur">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search anchorages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "bg-primary text-primary-foreground")}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <div className="hidden sm:flex sm:gap-2">
            <Button
              type="button"
              variant={view === "map" ? "default" : "outline"}
              onClick={() => setView("map")}
            >
              Map
            </Button>
            <Button
              type="button"
              variant={view === "list" ? "default" : "outline"}
              onClick={() => setView("list")}
            >
              List
            </Button>
          </div>
        </form>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Select value={markerFilter} onValueChange={(v) => setMarkerFilter(v as MarkerFilter)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Show All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="flex items-center gap-2">
                    <Anchor className="h-4 w-4" />
                    <Waves className="h-4 w-4" />
                    Show All
                  </span>
                </SelectItem>
                <SelectItem value="anchorages">
                  <span className="flex items-center gap-2">
                    <Anchor className="h-4 w-4" />
                    Anchorages Only
                  </span>
                </SelectItem>
                <SelectItem value="dive-sites">
                  <span className="flex items-center gap-2">
                    <Waves className="h-4 w-4" />
                    Dive Sites Only
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedIsland} onValueChange={setSelectedIsland}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Islands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Islands</SelectItem>
                {BVI_ISLANDS.map((island) => (
                  <SelectItem key={island} value={island}>
                    {island}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Map View */}
      {view === "map" && (
        <AnchorageMap
          anchorages={anchorages}
          diveSites={filteredDiveSites}
          selectedId={selectedAnchorage?.id}
          selectedDiveSiteId={selectedDiveSite?.id}
          onSelect={handleSelectAnchorage}
          onSelectDiveSite={handleSelectDiveSite}
          showAnchorages={showAnchorages}
          showDiveSites={showDiveSites}
          className={cn(
            "h-full pt-16",
            showFilters && "pt-28",
            (selectedAnchorage || selectedDiveSite) && "md:pr-96"
          )}
        />
      )}

      {/* List View */}
      {view === "list" && (
        <div className={cn("h-full overflow-auto pt-16", showFilters && "pt-28")}>
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : anchorages.length === 0 && filteredDiveSites.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <Anchor className="h-16 w-16 text-muted-foreground/30" />
              <h3 className="mt-4 text-lg font-medium">No results found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="container grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Dive Sites */}
              {showDiveSites && filteredDiveSites.map((diveSite) => (
                <button
                  key={diveSite.id}
                  onClick={() => handleSelectDiveSite(diveSite)}
                  className="flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-shadow hover:shadow-lg"
                >
                  <div className="flex h-32 items-center justify-center bg-gradient-to-br from-red-600 to-red-800 relative">
                    <svg viewBox="0 0 32 40" className="h-16 w-12">
                      <rect x="2" y="0" width="3" height="40" fill="#fff" opacity="0.8"/>
                      <rect x="5" y="2" width="24" height="18" fill="#fff"/>
                      <polygon points="5,2 29,20 29,14 11,2" fill="#DC2626"/>
                      <polygon points="5,8 23,20 29,20 5,2" fill="#DC2626"/>
                    </svg>
                    {diveSite.isArtReef && (
                      <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                        Art Reef
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{diveSite.name}</h3>
                    <p className="text-sm text-muted-foreground">{diveSite.location}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        <span className={cn(
                          "h-2 w-2 rounded-full",
                          diveSite.difficulty === "beginner" && "bg-green-500",
                          diveSite.difficulty === "intermediate" && "bg-yellow-500",
                          diveSite.difficulty === "advanced" && "bg-red-500"
                        )} />
                        <span className="capitalize">{diveSite.difficulty}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {diveSite.depthRange.min}-{diveSite.depthRange.max} ft
                      </span>
                    </div>
                  </div>
                </button>
              ))}

              {/* Anchorages */}
              {showAnchorages && anchorages.map((anchorage) => {
                const averageRating = anchorage.reviews?.length
                  ? anchorage.reviews.reduce((sum, r) => sum + r.rating, 0) / anchorage.reviews.length
                  : null;

                return (
                  <button
                    key={anchorage.id}
                    onClick={() => handleSelectAnchorage(anchorage)}
                    className="flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-shadow hover:shadow-lg"
                  >
                    <div className="flex h-32 items-center justify-center bg-muted">
                      <Anchor className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">{anchorage.name}</h3>
                      <p className="text-sm text-muted-foreground">{anchorage.island}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm">
                          {averageRating && (
                            <>
                              <span className="text-yellow-500">★</span>
                              <span>{averageRating.toFixed(1)}</span>
                            </>
                          )}
                        </div>
                        {anchorage.moorings && anchorage.moorings.length > 0 && (
                          <span className="text-xs text-green-600">
                            {anchorage.moorings.length} mooring{anchorage.moorings.length !== 1 && "s"}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Anchorage Panel */}
      <AnchoragePanel
        anchorage={selectedAnchorage}
        onClose={() => setSelectedAnchorage(null)}
      />

      {/* Dive Site Panel */}
      <DiveSitePanel
        diveSite={selectedDiveSite}
        onClose={() => setSelectedDiveSite(null)}
      />
    </div>
  );
}
