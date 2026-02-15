"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Locate, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BVI_BOUNDS, MAPBOX_STYLE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { DiveSite } from "@/lib/constants/dive-sites";
import type { ProtectedArea } from "@/lib/constants/protected-areas";
import type { LayerVisibility } from "./MapSidebar";

interface BaseAnchorage {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  island: string;
  description: string;
  hasReef?: boolean;
  hasSeagrass?: boolean;
  moorings?: { id: string }[];
  _count?: { moorings: number };
}

interface AnchorageMapProps<T extends BaseAnchorage> {
  anchorages: T[];
  diveSites?: DiveSite[];
  protectedAreas?: ProtectedArea[];
  selectedId?: string;
  selectedDiveSiteId?: string;
  selectedProtectedAreaId?: string;
  onSelect: (anchorage: T) => void;
  onSelectDiveSite?: (diveSite: DiveSite) => void;
  onSelectProtectedArea?: (area: ProtectedArea) => void;
  layers: LayerVisibility;
  className?: string;
}

export function AnchorageMap<T extends BaseAnchorage>({
  anchorages,
  diveSites = [],
  protectedAreas = [],
  selectedId,
  selectedDiveSiteId,
  selectedProtectedAreaId,
  onSelect,
  onSelectDiveSite,
  onSelectProtectedArea,
  layers,
  className
}: AnchorageMapProps<T>) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const diveSiteMarkers = useRef<mapboxgl.Marker[]>([]);
  const protectedAreaMarkers = useRef<mapboxgl.Marker[]>([]);

  const [isLoaded, setIsLoaded] = useState(false);

  // Categorize protected areas
  const categorizeProtectedArea = useCallback((area: ProtectedArea) => {
    if (area.protectionType === 'Bird Sanctuary' || area.existingStatus === 'Bird Sanctuary') {
      return 'birdSanctuaries';
    }
    if (area.existingStatus === 'Marine Park' || area.managementDescription === 'Marine Park') {
      return 'marineParks';
    }
    if (area.existingStatus === 'National Park' || area.managementDescription === 'National Park') {
      return 'nationalParks';
    }
    if (area.protectionType === 'Fisheries Protected Area' || area.existingStatus === 'Fisheries Protected Area') {
      return 'fisheriesProtected';
    }
    if (area.protectionType === 'Fisheries Priority Area' || area.existingStatus === 'Fisheries Priority Area') {
      return 'fisheriesPriority';
    }
    if (area.protectionType.includes('Proposed')) {
      return 'proposedMPAs';
    }
    return 'proposedMPAs'; // Default for other types
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("Mapbox token not configured");
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_STYLE,
      center: [BVI_BOUNDS.center.lng, BVI_BOUNDS.center.lat],
      zoom: BVI_BOUNDS.zoom,
      maxBounds: [
        [BVI_BOUNDS.southwest.lng - 0.1, BVI_BOUNDS.southwest.lat - 0.1],
        [BVI_BOUNDS.northeast.lng + 0.1, BVI_BOUNDS.northeast.lat + 0.1],
      ],
    });

    map.current.on("load", () => {
      setIsLoaded(true);
    });

    // Disable rotation
    map.current.dragRotate.disable();
    map.current.touchZoomRotate.disableRotation();

    return () => {
      markers.current.forEach((m) => m.remove());
      markers.current = [];
      diveSiteMarkers.current.forEach((m) => m.remove());
      diveSiteMarkers.current = [];
      protectedAreaMarkers.current.forEach((m) => m.remove());
      protectedAreaMarkers.current = [];
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update anchorage markers
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    markers.current.forEach((m) => m.remove());
    markers.current = [];

    if (!layers.anchorages) return;

    anchorages.forEach((anchorage) => {
      const isSelected = anchorage.id === selectedId;
      const mooringCount = anchorage._count?.moorings || anchorage.moorings?.length || 0;
      const hasMoorings = mooringCount > 0;
      const hasSensitiveHabitat = anchorage.hasReef || anchorage.hasSeagrass;

      const el = document.createElement("div");
      el.className = "anchorage-marker cursor-pointer";
      el.innerHTML = `
        <div class="relative group" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          <div class="${cn(
            "flex items-center justify-center rounded-full transition-transform border-2",
            isSelected
              ? "h-10 w-10 bg-primary border-white scale-110"
              : hasSensitiveHabitat
                ? "h-7 w-7 bg-ocean-600 border-amber-400 hover:scale-110"
                : "h-7 w-7 bg-ocean-600 border-white hover:scale-110"
          )}">
            <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 20 : 14}" height="${isSelected ? 20 : 14}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="5" r="3"/>
              <line x1="12" y1="22" x2="12" y2="8"/>
              <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
            </svg>
          </div>
          ${hasMoorings ? `<div class="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border border-white flex items-center justify-center">
              <span class="text-[8px] font-bold text-white">${mooringCount}</span>
            </div>` : ""}
        </div>
      `;

      el.addEventListener("click", () => onSelect(anchorage));

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([anchorage.longitude, anchorage.latitude])
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [anchorages, selectedId, isLoaded, onSelect, layers.anchorages]);

  // Update dive site markers
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    diveSiteMarkers.current.forEach((m) => m.remove());
    diveSiteMarkers.current = [];

    if (!layers.diveSites || !onSelectDiveSite) return;

    diveSites.forEach((diveSite) => {
      const isSelected = diveSite.id === selectedDiveSiteId;
      const isArtReef = diveSite.isArtReef;

      const el = document.createElement("div");
      el.className = "dive-site-marker cursor-pointer";
      el.innerHTML = `
        <div class="relative group" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          <div class="${cn("transition-transform", isSelected ? "scale-125" : "hover:scale-110")}">
            <svg viewBox="0 0 32 40" width="${isSelected ? 32 : 24}" height="${isSelected ? 40 : 30}">
              <rect x="2" y="0" width="3" height="40" fill="#4A5568"/>
              <rect x="5" y="2" width="24" height="18" fill="#DC2626"/>
              <polygon points="5,2 29,20 29,14 11,2" fill="white"/>
              <polygon points="5,8 23,20 29,20 5,2" fill="white"/>
            </svg>
          </div>
          ${isArtReef ? `<div class="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-purple-600 border border-white flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="white"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
            </div>` : ""}
        </div>
      `;

      el.addEventListener("click", () => onSelectDiveSite(diveSite));

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([diveSite.coordinates.lng, diveSite.coordinates.lat])
        .addTo(map.current!);

      diveSiteMarkers.current.push(marker);
    });
  }, [diveSites, selectedDiveSiteId, isLoaded, onSelectDiveSite, layers.diveSites]);

  // Update protected area markers
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    protectedAreaMarkers.current.forEach((m) => m.remove());
    protectedAreaMarkers.current = [];

    if (!onSelectProtectedArea) return;

    // Filter based on layer visibility
    const visibleAreas = protectedAreas.filter((area) => {
      const category = categorizeProtectedArea(area);
      return layers[category as keyof LayerVisibility];
    });

    visibleAreas.forEach((area) => {
      const isSelected = area.id === selectedProtectedAreaId;
      const category = categorizeProtectedArea(area);

      // Determine marker style
      let bgColor = 'bg-slate-600';
      let iconSvg = '';
      const iconSize = isSelected ? 16 : 12;

      switch (category) {
        case 'birdSanctuaries':
          bgColor = 'bg-green-600';
          iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/></svg>`;
          break;
        case 'marineParks':
          bgColor = 'bg-teal-600';
          iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>`;
          break;
        case 'nationalParks':
          bgColor = 'bg-emerald-700';
          iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>`;
          break;
        case 'fisheriesProtected':
          bgColor = 'bg-blue-600';
          iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/></svg>`;
          break;
        case 'fisheriesPriority':
          bgColor = 'bg-yellow-500';
          iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/></svg>`;
          break;
        case 'proposedMPAs':
          bgColor = 'bg-orange-500';
          iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
          break;
      }

      const el = document.createElement("div");
      el.className = "protected-area-marker cursor-pointer";
      el.innerHTML = `
        <div class="relative group" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          <div class="${cn(
            "flex items-center justify-center rounded-full transition-transform border-2",
            isSelected
              ? `h-9 w-9 ${bgColor} border-white scale-110`
              : `h-6 w-6 ${bgColor} border-white/80 hover:scale-110`
          )}">
            ${iconSvg}
          </div>
        </div>
      `;

      el.addEventListener("click", () => onSelectProtectedArea(area));

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([area.coordinates.lng, area.coordinates.lat])
        .addTo(map.current!);

      protectedAreaMarkers.current.push(marker);
    });
  }, [protectedAreas, selectedProtectedAreaId, isLoaded, onSelectProtectedArea, layers, categorizeProtectedArea]);

  // Fly to selected items
  useEffect(() => {
    if (!map.current || !selectedProtectedAreaId) return;
    const area = protectedAreas.find((a) => a.id === selectedProtectedAreaId);
    if (area) {
      map.current.flyTo({ center: [area.coordinates.lng, area.coordinates.lat], zoom: 13, duration: 1000 });
    }
  }, [selectedProtectedAreaId, protectedAreas]);

  useEffect(() => {
    if (!map.current || !selectedId) return;
    const anchorage = anchorages.find((a) => a.id === selectedId);
    if (anchorage) {
      map.current.flyTo({ center: [anchorage.longitude, anchorage.latitude], zoom: 13, duration: 1000 });
    }
  }, [selectedId, anchorages]);

  useEffect(() => {
    if (!map.current || !selectedDiveSiteId) return;
    const diveSite = diveSites.find((d) => d.id === selectedDiveSiteId);
    if (diveSite) {
      map.current.flyTo({ center: [diveSite.coordinates.lng, diveSite.coordinates.lat], zoom: 13, duration: 1000 });
    }
  }, [selectedDiveSiteId, diveSites]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.current?.flyTo({ center: [position.coords.longitude, position.coords.latitude], zoom: 12 });
      },
      () => console.log("Unable to get location")
    );
  };

  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();
  const handleResetView = () => {
    map.current?.flyTo({
      center: [BVI_BOUNDS.center.lng, BVI_BOUNDS.center.lat],
      zoom: BVI_BOUNDS.zoom,
    });
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div ref={mapContainer} className="h-full w-full" />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute right-4 top-20 flex flex-col gap-2">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={handleLocateMe}
          className="h-9 w-9 shadow-lg"
          aria-label="Use my location"
        >
          <Locate className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={handleZoomIn}
          className="h-9 w-9 shadow-lg"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={handleZoomOut}
          className="h-9 w-9 shadow-lg"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={handleResetView}
          className="h-9 w-9 shadow-lg"
          aria-label="Reset view"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
