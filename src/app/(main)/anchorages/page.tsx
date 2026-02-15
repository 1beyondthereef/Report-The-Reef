"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Fish } from "lucide-react";
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

// Default layer visibility - anchorages and dive sites ON, protected areas OFF
const DEFAULT_LAYERS: LayerVisibility = {
  anchorages: true,
  diveSites: true,
  marineParks: false,
  nationalParks: false,
  birdSanctuaries: false,
  fisheriesProtected: false,
  fisheriesPriority: false,
  proposedMPAs: false,
};

export default function AnchoragesPage() {
  const [anchorages, setAnchorages] = useState<Anchorage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnchorage, setSelectedAnchorage] = useState<Anchorage | null>(null);
  const [selectedDiveSite, setSelectedDiveSite] = useState<DiveSite | null>(null);
  const [selectedRestrictedArea, setSelectedRestrictedArea] = useState<RestrictedArea | null>(null);
  const [selectedProtectedArea, setSelectedProtectedArea] = useState<ProtectedArea | null>(null);
  const [showRegulations, setShowRegulations] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYERS);

  // Handler functions
  const handleSelectAnchorage = (anchorage: Anchorage) => {
    setSelectedDiveSite(null);
    setSelectedRestrictedArea(null);
    setSelectedProtectedArea(null);
    setShowRegulations(false);
    setSelectedAnchorage(anchorage);
    setSidebarOpen(false); // Close sidebar on selection (mobile)
  };

  const handleSelectDiveSite = (diveSite: DiveSite) => {
    setSelectedAnchorage(null);
    setSelectedRestrictedArea(null);
    setSelectedProtectedArea(null);
    setShowRegulations(false);
    setSelectedDiveSite(diveSite);
    setSidebarOpen(false);
  };

  const handleSelectRestrictedArea = (area: RestrictedArea) => {
    setSelectedAnchorage(null);
    setSelectedDiveSite(null);
    setSelectedProtectedArea(null);
    setShowRegulations(false);
    setSelectedRestrictedArea(area);
    setSidebarOpen(false);
  };

  const handleSelectProtectedArea = (area: ProtectedArea) => {
    setSelectedAnchorage(null);
    setSelectedDiveSite(null);
    setSelectedRestrictedArea(null);
    setShowRegulations(false);
    setSelectedProtectedArea(area);
    setSidebarOpen(false);
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
      proposedMPAs: true,
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
      proposedMPAs: false,
    });
  };

  const fetchAnchorages = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);

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
  }, [searchQuery]);

  useEffect(() => {
    fetchAnchorages();
  }, [fetchAnchorages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnchorages();
  };

  const hasPanelOpen = selectedAnchorage || selectedDiveSite || selectedRestrictedArea || selectedProtectedArea || showRegulations;

  return (
    <div className="relative h-[calc(100vh-4rem-4rem)] md:h-[calc(100vh-4rem)]">
      {/* Top Search Bar */}
      <div className="absolute left-0 right-0 top-0 z-30 bg-background/95 p-3 backdrop-blur border-b">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search sites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
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
        </form>
      </div>

      {/* Sidebar */}
      <MapSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
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
        className="pt-14"
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
