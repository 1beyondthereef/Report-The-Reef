"use client";

import { useState, useMemo } from "react";
import {
  Search, X, ChevronLeft, Layers,
  Anchor, Bird, Fish, Shield, AlertTriangle, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { DiveSite } from "@/lib/constants/dive-sites";
import type { ProtectedArea } from "@/lib/constants/protected-areas";

interface BaseAnchorage {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  island: string;
}

export interface LayerVisibility {
  anchorages: boolean;
  diveSites: boolean;
  marineParks: boolean;
  nationalParks: boolean;
  birdSanctuaries: boolean;
  fisheriesProtected: boolean;
  fisheriesPriority: boolean;
  proposedMPAs: boolean;
}

interface MapSidebarProps<T extends BaseAnchorage> {
  isOpen: boolean;
  onToggle: () => void;
  layers: LayerVisibility;
  onLayerChange: (layer: keyof LayerVisibility, value: boolean) => void;
  onShowAll: () => void;
  onHideAll: () => void;
  anchorages: T[];
  diveSites: DiveSite[];
  protectedAreas: ProtectedArea[];
  onSelectAnchorage: (anchorage: T) => void;
  onSelectDiveSite: (diveSite: DiveSite) => void;
  onSelectProtectedArea: (area: ProtectedArea) => void;
  className?: string;
}

const layerConfig: { key: keyof LayerVisibility; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'anchorages', label: 'Anchorages', icon: <Anchor className="h-4 w-4" />, color: 'text-ocean-600' },
  { key: 'diveSites', label: 'Dive Sites', icon: <div className="h-4 w-4 rounded bg-red-600" />, color: 'text-red-600' },
  { key: 'marineParks', label: 'Marine Parks', icon: <Anchor className="h-4 w-4" />, color: 'text-teal-600' },
  { key: 'nationalParks', label: 'National Parks', icon: <Anchor className="h-4 w-4" />, color: 'text-emerald-700' },
  { key: 'birdSanctuaries', label: 'Bird Sanctuaries', icon: <Bird className="h-4 w-4" />, color: 'text-green-600' },
  { key: 'fisheriesProtected', label: 'Fisheries Protected', icon: <Fish className="h-4 w-4" />, color: 'text-blue-600' },
  { key: 'fisheriesPriority', label: 'Fisheries Priority', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-yellow-600' },
  { key: 'proposedMPAs', label: 'Proposed MPAs', icon: <Shield className="h-4 w-4" />, color: 'text-orange-500' },
];

export function MapSidebar<T extends BaseAnchorage>({
  isOpen,
  onToggle,
  layers,
  onLayerChange,
  onShowAll,
  onHideAll,
  anchorages,
  diveSites,
  protectedAreas,
  onSelectAnchorage,
  onSelectDiveSite,
  onSelectProtectedArea,
  className
}: MapSidebarProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and categorize items based on search
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();

    const filteredAnchorages = anchorages.filter(a =>
      a.name.toLowerCase().includes(query) || a.island.toLowerCase().includes(query)
    );

    const filteredDiveSites = diveSites.filter(d =>
      d.name.toLowerCase().includes(query) || d.location.toLowerCase().includes(query)
    );

    const marineParks = protectedAreas.filter(p =>
      (p.existingStatus === 'Marine Park' || p.managementDescription === 'Marine Park') &&
      (p.name.toLowerCase().includes(query) || p.region.toLowerCase().includes(query))
    );

    const nationalParks = protectedAreas.filter(p =>
      (p.existingStatus === 'National Park' || p.managementDescription === 'National Park') &&
      (p.name.toLowerCase().includes(query) || p.region.toLowerCase().includes(query))
    );

    const birdSanctuaries = protectedAreas.filter(p =>
      p.protectionType === 'Bird Sanctuary' &&
      (p.name.toLowerCase().includes(query) || p.region.toLowerCase().includes(query))
    );

    const fisheriesProtected = protectedAreas.filter(p =>
      (p.protectionType === 'Fisheries Protected Area' || p.existingStatus === 'Fisheries Protected Area') &&
      p.protectionType !== 'Bird Sanctuary' &&
      (p.name.toLowerCase().includes(query) || p.region.toLowerCase().includes(query))
    );

    const fisheriesPriority = protectedAreas.filter(p =>
      (p.protectionType === 'Fisheries Priority Area' || p.existingStatus === 'Fisheries Priority Area') &&
      (p.name.toLowerCase().includes(query) || p.region.toLowerCase().includes(query))
    );

    const proposedMPAs = protectedAreas.filter(p =>
      p.protectionType.includes('Proposed') &&
      (p.name.toLowerCase().includes(query) || p.region.toLowerCase().includes(query))
    );

    return {
      anchorages: filteredAnchorages,
      diveSites: filteredDiveSites,
      marineParks,
      nationalParks,
      birdSanctuaries,
      fisheriesProtected,
      fisheriesPriority,
      proposedMPAs
    };
  }, [searchQuery, anchorages, diveSites, protectedAreas]);

  // Count visible items per category
  const counts = useMemo(() => ({
    anchorages: layers.anchorages ? filteredItems.anchorages.length : 0,
    diveSites: layers.diveSites ? filteredItems.diveSites.length : 0,
    marineParks: layers.marineParks ? filteredItems.marineParks.length : 0,
    nationalParks: layers.nationalParks ? filteredItems.nationalParks.length : 0,
    birdSanctuaries: layers.birdSanctuaries ? filteredItems.birdSanctuaries.length : 0,
    fisheriesProtected: layers.fisheriesProtected ? filteredItems.fisheriesProtected.length : 0,
    fisheriesPriority: layers.fisheriesPriority ? filteredItems.fisheriesPriority.length : 0,
    proposedMPAs: layers.proposedMPAs ? filteredItems.proposedMPAs.length : 0,
  }), [layers, filteredItems]);

  const totalVisible = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <>
      {/* Toggle Button - always visible */}
      <Button
        variant="secondary"
        size="icon"
        onClick={onToggle}
        className={cn(
          "fixed z-30 h-10 w-10 shadow-lg transition-all duration-300",
          isOpen ? "left-72 md:left-80" : "left-4",
          "top-20"
        )}
        aria-label={isOpen ? "Close sidebar" : "Open layers"}
      >
        {isOpen ? <ChevronLeft className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-20 h-full w-72 md:w-80 bg-background border-r shadow-xl transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Map Layers
            </h2>
            <span className="text-sm text-muted-foreground">
              {totalVisible} visible
            </span>
          </div>

          {/* Show All / Hide All */}
          <div className="flex gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={onShowAll} className="flex-1">
              <Eye className="h-4 w-4 mr-1" />
              Show All
            </Button>
            <Button variant="outline" size="sm" onClick={onHideAll} className="flex-1">
              <EyeOff className="h-4 w-4 mr-1" />
              Hide All
            </Button>
          </div>

          {/* Layer Toggles */}
          <div className="space-y-2">
            {layerConfig.map(({ key, label, icon, color }) => (
              <div key={key} className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <span className={color}>{icon}</span>
                  <span>{label}</span>
                  <span className="text-xs text-muted-foreground">
                    ({counts[key]})
                  </span>
                </label>
                <Switch
                  checked={layers[key]}
                  onCheckedChange={(checked) => onLayerChange(key, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="flex-shrink-0 p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search sites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-8"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Site List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Anchorages */}
            {layers.anchorages && filteredItems.anchorages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Anchor className="h-4 w-4 text-ocean-600" />
                  Anchorages ({filteredItems.anchorages.length})
                </h3>
                <div className="space-y-1">
                  {filteredItems.anchorages.map((anchorage) => (
                    <button
                      key={anchorage.id}
                      onClick={() => onSelectAnchorage(anchorage)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      <div className="font-medium truncate">{anchorage.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{anchorage.island}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dive Sites */}
            {layers.diveSites && filteredItems.diveSites.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-red-600" />
                  Dive Sites ({filteredItems.diveSites.length})
                </h3>
                <div className="space-y-1">
                  {filteredItems.diveSites.map((site) => (
                    <button
                      key={site.id}
                      onClick={() => onSelectDiveSite(site)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      <div className="font-medium truncate">{site.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{site.location}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Marine Parks */}
            {layers.marineParks && filteredItems.marineParks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Anchor className="h-4 w-4 text-teal-600" />
                  Marine Parks ({filteredItems.marineParks.length})
                </h3>
                <div className="space-y-1">
                  {filteredItems.marineParks.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => onSelectProtectedArea(area)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      <div className="font-medium truncate">{area.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{area.region}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* National Parks */}
            {layers.nationalParks && filteredItems.nationalParks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Anchor className="h-4 w-4 text-emerald-700" />
                  National Parks ({filteredItems.nationalParks.length})
                </h3>
                <div className="space-y-1">
                  {filteredItems.nationalParks.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => onSelectProtectedArea(area)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      <div className="font-medium truncate">{area.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{area.region}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bird Sanctuaries */}
            {layers.birdSanctuaries && filteredItems.birdSanctuaries.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Bird className="h-4 w-4 text-green-600" />
                  Bird Sanctuaries ({filteredItems.birdSanctuaries.length})
                </h3>
                <div className="space-y-1">
                  {filteredItems.birdSanctuaries.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => onSelectProtectedArea(area)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      <div className="font-medium truncate">{area.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{area.region}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fisheries Protected */}
            {layers.fisheriesProtected && filteredItems.fisheriesProtected.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Fish className="h-4 w-4 text-blue-600" />
                  Fisheries Protected ({filteredItems.fisheriesProtected.length})
                </h3>
                <div className="space-y-1">
                  {filteredItems.fisheriesProtected.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => onSelectProtectedArea(area)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      <div className="font-medium truncate">{area.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{area.region}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fisheries Priority */}
            {layers.fisheriesPriority && filteredItems.fisheriesPriority.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  Fisheries Priority ({filteredItems.fisheriesPriority.length})
                </h3>
                <div className="space-y-1">
                  {filteredItems.fisheriesPriority.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => onSelectProtectedArea(area)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      <div className="font-medium truncate">{area.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{area.region}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Proposed MPAs */}
            {layers.proposedMPAs && filteredItems.proposedMPAs.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-500" />
                  Proposed MPAs ({filteredItems.proposedMPAs.length})
                </h3>
                <div className="space-y-1">
                  {filteredItems.proposedMPAs.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => onSelectProtectedArea(area)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      <div className="font-medium truncate">{area.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{area.region}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {totalVisible === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No layers visible</p>
                <p className="text-xs">Toggle layers above to see sites</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}
