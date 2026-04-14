"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Search, Loader2, Fish, MapPin, Anchor, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnchorageMap } from "@/components/maps/AnchorageMap";
import { MapSidebar, type LayerVisibility } from "@/components/maps/MapSidebar";
import { AnchoragePanel } from "@/components/panels/AnchoragePanel";
import { DiveSitePanel } from "@/components/panels/DiveSitePanel";
import { RestrictedAreaPanel } from "@/components/panels/RestrictedAreaPanel";
import { ProtectedAreaPanel } from "@/components/panels/ProtectedAreaPanel";
import { RegulationsPanel } from "@/components/panels/RegulationsPanel";
import { BVI_DIVE_SITES, type DiveSite } from "@/lib/constants/dive-sites";
import type { RestrictedArea } from "@/lib/constants/restricted-areas";
import { ALL_PROTECTED_AREAS, type ProtectedArea } from "@/lib/constants/protected-areas";
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

// BVI Islands with coordinates for map navigation
const BVI_ISLANDS = [
  { id: 'tortola', name: 'Tortola', lat: 18.4275, lng: -64.6200, zoom: 12 },
  { id: 'virgin-gorda', name: 'Virgin Gorda', lat: 18.4500, lng: -64.3900, zoom: 12 },
  { id: 'jost-van-dyke', name: 'Jost Van Dyke', lat: 18.4425, lng: -64.7500, zoom: 13 },
  { id: 'anegada', name: 'Anegada', lat: 18.7200, lng: -64.3500, zoom: 12 },
  { id: 'norman-island', name: 'Norman Island', lat: 18.3200, lng: -64.6200, zoom: 14 },
  { id: 'peter-island', name: 'Peter Island', lat: 18.3500, lng: -64.5800, zoom: 13 },
  { id: 'salt-island', name: 'Salt Island', lat: 18.3700, lng: -64.5200, zoom: 14 },
  { id: 'cooper-island', name: 'Cooper Island', lat: 18.3900, lng: -64.5100, zoom: 14 },
  { id: 'ginger-island', name: 'Ginger Island', lat: 18.3800, lng: -64.5000, zoom: 14 },
  { id: 'great-camanoe', name: 'Great Camanoe', lat: 18.4700, lng: -64.5200, zoom: 14 },
  { id: 'guana-island', name: 'Guana Island', lat: 18.4800, lng: -64.5700, zoom: 14 },
  { id: 'necker-island', name: 'Necker Island', lat: 18.5100, lng: -64.3600, zoom: 15 },
  { id: 'beef-island', name: 'Beef Island', lat: 18.4500, lng: -64.5400, zoom: 14 },
  { id: 'great-thatch', name: 'Great Thatch', lat: 18.3900, lng: -64.7500, zoom: 14 },
  { id: 'sandy-cay', name: 'Sandy Cay', lat: 18.4500, lng: -64.7100, zoom: 15 },
  { id: 'the-dogs', name: 'The Dogs', lat: 18.4700, lng: -64.4600, zoom: 14 },
  { id: 'the-tobagos', name: 'The Tobagos', lat: 18.4600, lng: -64.6800, zoom: 14 },
];

// Default layer visibility - anchorages and dive sites ON, protected areas OFF
const DEFAULT_LAYERS: LayerVisibility = {
  anchorages: true,
  diveSites: true,
  marineParks: false,
  nationalParks: false,
  birdSanctuaries: false,
  fisheriesProtected: false,
  fisheriesPriority: false,
};

type SearchResult =
  | { type: 'anchorage'; data: Anchorage }
  | { type: 'diveSite'; data: DiveSite }
  | { type: 'island'; data: typeof BVI_ISLANDS[0] };

export default function AnchoragesPage() {
  const [anchorages, setAnchorages] = useState<Anchorage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnchorage, setSelectedAnchorage] = useState<Anchorage | null>(null);
  const [selectedDiveSite, setSelectedDiveSite] = useState<DiveSite | null>(null);
  const [selectedRestrictedArea, setSelectedRestrictedArea] = useState<RestrictedArea | null>(null);
  const [selectedProtectedArea, setSelectedProtectedArea] = useState<ProtectedArea | null>(null);
  const [showRegulations, setShowRegulations] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSidebarHint, setShowSidebarHint] = useState(true);
  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYERS);
  const [flyToLocation, setFlyToLocation] = useState<{ lng: number; lat: number; zoom: number } | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Hide sidebar hint after first interaction or after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSidebarHint(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search results
  const searchResults = useMemo((): SearchResult[] => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search islands
    BVI_ISLANDS.forEach(island => {
      if (island.name.toLowerCase().includes(query)) {
        results.push({ type: 'island', data: island });
      }
    });

    // Search anchorages
    anchorages.forEach(anchorage => {
      if (anchorage.name.toLowerCase().includes(query) ||
          anchorage.island.toLowerCase().includes(query)) {
        results.push({ type: 'anchorage', data: anchorage });
      }
    });

    // Search dive sites
    BVI_DIVE_SITES.forEach(site => {
      if (site.name.toLowerCase().includes(query) ||
          site.location.toLowerCase().includes(query)) {
        results.push({ type: 'diveSite', data: site });
      }
    });

    return results.slice(0, 10); // Limit to 10 results
  }, [searchQuery, anchorages]);

  // Handler functions
  const handleSelectAnchorage = (anchorage: Anchorage) => {
    setSelectedDiveSite(null);
    setSelectedRestrictedArea(null);
    setSelectedProtectedArea(null);
    setShowRegulations(false);
    setSelectedAnchorage(anchorage);
    setSidebarOpen(false);
    setShowSidebarHint(false);
  };

  const handleSelectDiveSite = (diveSite: DiveSite) => {
    setSelectedAnchorage(null);
    setSelectedRestrictedArea(null);
    setSelectedProtectedArea(null);
    setShowRegulations(false);
    setSelectedDiveSite(diveSite);
    setSidebarOpen(false);
    setShowSidebarHint(false);
  };

  const handleSelectProtectedArea = (area: ProtectedArea) => {
    setSelectedAnchorage(null);
    setSelectedDiveSite(null);
    setSelectedRestrictedArea(null);
    setShowRegulations(false);
    setSelectedProtectedArea(area);
    setSidebarOpen(false);
    setShowSidebarHint(false);
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setSearchQuery("");
    setShowSearchResults(false);

    if (result.type === 'anchorage') {
      handleSelectAnchorage(result.data);
      setFlyToLocation({ lng: result.data.longitude, lat: result.data.latitude, zoom: 14 });
    } else if (result.type === 'diveSite') {
      handleSelectDiveSite(result.data);
      setFlyToLocation({ lng: result.data.coordinates.lng, lat: result.data.coordinates.lat, zoom: 14 });
    } else if (result.type === 'island') {
      setFlyToLocation({ lng: result.data.lng, lat: result.data.lat, zoom: result.data.zoom });
    }
  };

  const handleLayerChange = (layer: keyof LayerVisibility, value: boolean) => {
    setLayers(prev => ({ ...prev, [layer]: value }));
  };

  const handleShowAll = () => {
    setLayers({
      anchorages: true,
      diveSites: true,
      marineParks: true,
      nationalParks: true,
      birdSanctuaries: true,
      fisheriesProtected: true,
      fisheriesPriority: true,
    });
  };

  const handleHideAll = () => {
    setLayers({
      anchorages: false,
      diveSites: false,
      marineParks: false,
      nationalParks: false,
      birdSanctuaries: false,
      fisheriesProtected: false,
      fisheriesPriority: false,
    });
  };

  const fetchAnchorages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/anchorages');
      if (response.ok) {
        const data = await response.json();
        setAnchorages(data.anchorages);
      }
    } catch (error) {
      console.error("Failed to fetch anchorages:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnchorages();
  }, [fetchAnchorages]);

  const hasPanelOpen = selectedAnchorage || selectedDiveSite || selectedRestrictedArea || selectedProtectedArea || showRegulations;

  return (
    <div className="relative h-[calc(100dvh-3.5rem-5rem)] sm:h-[calc(100dvh-4rem-5rem)] md:h-[calc(100dvh-5rem)] lg:h-[calc(100dvh-11rem)]">
      {/* Top Search Bar */}
      <div className="absolute left-0 right-0 top-0 z-30 bg-background/95 p-3 backdrop-blur border-b">
        <div className="flex gap-2 max-w-xl mx-auto">
          <div className="relative flex-1" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search anchorages, dive sites, islands..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="pl-10 h-9"
            />

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
                {searchResults.map((result, index) => (
                  <button
                    key={`${result.type}-${index}`}
                    onClick={() => handleSearchResultClick(result)}
                    className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center gap-3 border-b last:border-b-0"
                  >
                    {result.type === 'island' && (
                      <>
                        <Navigation className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{result.data.name}</div>
                          <div className="text-xs text-muted-foreground">Island</div>
                        </div>
                      </>
                    )}
                    {result.type === 'anchorage' && (
                      <>
                        <Anchor className="h-5 w-5 text-ocean-600 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{result.data.name}</div>
                          <div className="text-xs text-muted-foreground">Anchorage • {result.data.island}</div>
                        </div>
                      </>
                    )}
                    {result.type === 'diveSite' && (
                      <>
                        <MapPin className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{result.data.name}</div>
                          <div className="text-xs text-muted-foreground">Dive Site • {result.data.location}</div>
                        </div>
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* No results message */}
            {showSearchResults && searchQuery.trim() && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg p-4 text-center text-muted-foreground z-50">
                No results found for &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedAnchorage(null);
              setSelectedDiveSite(null);
              setSelectedRestrictedArea(null);
              setSelectedProtectedArea(null);
              setShowRegulations(true);
            }}
            className="hidden sm:flex items-center gap-1.5 h-9"
          >
            <Fish className="h-4 w-4" />
            Regulations
          </Button>
        </div>
      </div>

      {/* Sidebar Hint (shows on first load) */}
      {showSidebarHint && !sidebarOpen && (
        <div
          className="fixed left-16 top-[4.5rem] sm:top-[5rem] md:top-[6rem] lg:top-[12rem] z-40 bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg text-sm max-w-[200px] animate-pulse cursor-pointer"
          onClick={() => {
            setSidebarOpen(true);
            setShowSidebarHint(false);
          }}
        >
          <div className="absolute -left-2 top-3 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-primary border-b-[6px] border-b-transparent" />
          Click here for more layers and sites
        </div>
      )}

      {/* Sidebar */}
      <MapSidebar
        isOpen={sidebarOpen}
        onToggle={() => {
          setSidebarOpen(!sidebarOpen);
          setShowSidebarHint(false);
        }}
        layers={layers}
        onLayerChange={handleLayerChange}
        onShowAll={handleShowAll}
        onHideAll={handleHideAll}
        anchorages={anchorages}
        diveSites={BVI_DIVE_SITES}
        protectedAreas={ALL_PROTECTED_AREAS}
        onSelectAnchorage={handleSelectAnchorage}
        onSelectDiveSite={handleSelectDiveSite}
        onSelectProtectedArea={handleSelectProtectedArea}
        className="pt-14 sm:pt-16 md:pt-20 lg:pt-44"
      />

      {/* Map */}
      <AnchorageMap
        anchorages={anchorages}
        diveSites={BVI_DIVE_SITES}
        protectedAreas={ALL_PROTECTED_AREAS}
        selectedId={selectedAnchorage?.id}
        selectedDiveSiteId={selectedDiveSite?.id}
        selectedProtectedAreaId={selectedProtectedArea?.id}
        onSelect={handleSelectAnchorage}
        onSelectDiveSite={handleSelectDiveSite}
        onSelectProtectedArea={handleSelectProtectedArea}
        layers={layers}
        flyToLocation={flyToLocation}
        onFlyToComplete={() => setFlyToLocation(null)}
        className={cn(
          "h-full pt-14",
          sidebarOpen && "md:pl-80",
          hasPanelOpen && "md:pr-96"
        )}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      )}

      {/* Panels */}
      <AnchoragePanel
        anchorage={selectedAnchorage}
        onClose={() => setSelectedAnchorage(null)}
      />

      <DiveSitePanel
        diveSite={selectedDiveSite}
        onClose={() => setSelectedDiveSite(null)}
      />

      <RestrictedAreaPanel
        area={selectedRestrictedArea}
        onClose={() => setSelectedRestrictedArea(null)}
      />

      <ProtectedAreaPanel
        area={selectedProtectedArea}
        onClose={() => setSelectedProtectedArea(null)}
      />

      <RegulationsPanel
        isOpen={showRegulations}
        onClose={() => setShowRegulations(false)}
      />

      {/* Mobile Regulations Button */}
      <div className="fixed bottom-20 right-4 z-40 sm:hidden">
        <Button
          onClick={() => {
            setSelectedAnchorage(null);
            setSelectedDiveSite(null);
            setSelectedRestrictedArea(null);
            setSelectedProtectedArea(null);
            setShowRegulations(true);
          }}
          className="h-12 w-12 rounded-full shadow-lg bg-ocean-600 hover:bg-ocean-700"
          size="icon"
        >
          <Fish className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
