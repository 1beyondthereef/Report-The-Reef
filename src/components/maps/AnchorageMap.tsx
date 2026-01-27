"use client";

import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Locate, ZoomIn, ZoomOut, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BVI_BOUNDS, MAPBOX_STYLE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { DiveSite } from "@/lib/constants/dive-sites";

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
  selectedId?: string;
  selectedDiveSiteId?: string;
  onSelect: (anchorage: T) => void;
  onSelectDiveSite?: (diveSite: DiveSite) => void;
  showDiveSites?: boolean;
  showAnchorages?: boolean;
  className?: string;
}

export function AnchorageMap<T extends BaseAnchorage>({
  anchorages,
  diveSites = [],
  selectedId,
  selectedDiveSiteId,
  onSelect,
  onSelectDiveSite,
  showDiveSites = true,
  showAnchorages = true,
  className
}: AnchorageMapProps<T>) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const diveSiteMarkers = useRef<mapboxgl.Marker[]>([]);

  const [isLoaded, setIsLoaded] = useState(false);

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
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update anchorage markers when anchorages change
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Remove existing markers
    markers.current.forEach((m) => m.remove());
    markers.current = [];

    // Only add markers if showAnchorages is true
    if (!showAnchorages) return;

    // Add new markers
    anchorages.forEach((anchorage) => {
      const isSelected = anchorage.id === selectedId;
      const mooringCount = anchorage._count?.moorings || anchorage.moorings?.length || 0;
      const hasMoorings = mooringCount > 0;
      const hasSensitiveHabitat = anchorage.hasReef || anchorage.hasSeagrass;

      const el = document.createElement("div");
      el.className = "anchorage-marker cursor-pointer";
      el.innerHTML = `
        <div class="relative group">
          <div class="${cn(
            "flex items-center justify-center rounded-full shadow-lg transition-transform border-2",
            isSelected
              ? "h-12 w-12 bg-primary border-white scale-110"
              : hasSensitiveHabitat
                ? "h-9 w-9 bg-ocean-600 border-amber-400 hover:scale-110"
                : "h-9 w-9 bg-ocean-600 border-white hover:scale-110"
          )}">
            <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 26 : 20}" height="${isSelected ? 26 : 20}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="5" r="3"/>
              <line x1="12" y1="22" x2="12" y2="8"/>
              <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
            </svg>
          </div>
          ${
            hasMoorings
              ? `<div class="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center shadow-sm">
                  <span class="text-[10px] font-bold text-white">${mooringCount}</span>
                </div>`
              : ""
          }
          ${
            hasSensitiveHabitat && !hasMoorings
              ? `<div class="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                </div>`
              : ""
          }
        </div>
      `;

      el.addEventListener("click", () => {
        onSelect(anchorage);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([anchorage.longitude, anchorage.latitude])
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [anchorages, selectedId, isLoaded, onSelect, showAnchorages]);

  // Update dive site markers when diveSites change
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Remove existing dive site markers
    diveSiteMarkers.current.forEach((m) => m.remove());
    diveSiteMarkers.current = [];

    // Only add markers if showDiveSites is true
    if (!showDiveSites || !onSelectDiveSite) return;

    // Add dive site markers
    diveSites.forEach((diveSite) => {
      const isSelected = diveSite.id === selectedDiveSiteId;
      const isArtReef = diveSite.isArtReef;

      const el = document.createElement("div");
      el.className = "dive-site-marker cursor-pointer";
      el.innerHTML = `
        <div class="relative group">
          <div class="${cn(
            "transition-transform",
            isSelected ? "scale-125" : "hover:scale-110"
          )}">
            <svg viewBox="0 0 32 40" width="${isSelected ? 40 : 32}" height="${isSelected ? 50 : 40}">
              <rect x="2" y="0" width="3" height="40" fill="#4A5568" stroke="#2D3748" stroke-width="0.5"/>
              <rect x="5" y="2" width="24" height="18" fill="#DC2626" stroke="#B91C1C" stroke-width="0.5"/>
              <polygon points="5,2 29,20 29,14 11,2" fill="white"/>
              <polygon points="5,8 23,20 29,20 5,2" fill="white"/>
              <rect x="5" y="2" width="24" height="18" fill="none" stroke="#991B1B" stroke-width="0.5"/>
            </svg>
          </div>
          ${
            isArtReef
              ? `<div class="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                </div>`
              : ""
          }
        </div>
      `;

      el.addEventListener("click", () => {
        onSelectDiveSite(diveSite);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([diveSite.coordinates.lng, diveSite.coordinates.lat])
        .addTo(map.current!);

      diveSiteMarkers.current.push(marker);
    });
  }, [diveSites, selectedDiveSiteId, isLoaded, onSelectDiveSite, showDiveSites]);

  // Fly to selected anchorage
  useEffect(() => {
    if (!map.current || !selectedId) return;

    const anchorage = anchorages.find((a) => a.id === selectedId);
    if (anchorage) {
      map.current.flyTo({
        center: [anchorage.longitude, anchorage.latitude],
        zoom: 13,
        duration: 1000,
      });
    }
  }, [selectedId, anchorages]);

  // Fly to selected dive site
  useEffect(() => {
    if (!map.current || !selectedDiveSiteId) return;

    const diveSite = diveSites.find((d) => d.id === selectedDiveSiteId);
    if (diveSite) {
      map.current.flyTo({
        center: [diveSite.coordinates.lng, diveSite.coordinates.lat],
        zoom: 13,
        duration: 1000,
      });
    }
  }, [selectedDiveSiteId, diveSites]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.current?.flyTo({
          center: [longitude, latitude],
          zoom: 12,
        });
      },
      () => {
        console.log("Unable to get location");
      }
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
      <div className="absolute right-4 top-4 flex flex-col gap-2">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={handleLocateMe}
          className="h-10 w-10 shadow-lg"
          aria-label="Use my location"
        >
          <Locate className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={handleZoomIn}
          className="h-10 w-10 shadow-lg"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={handleZoomOut}
          className="h-10 w-10 shadow-lg"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={handleResetView}
          className="h-10 w-10 shadow-lg"
          aria-label="Reset view"
        >
          <Layers className="h-5 w-5" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 rounded-xl bg-background/95 p-3 text-xs shadow-lg backdrop-blur-sm border border-border/50">
        <p className="mb-2 font-semibold text-sm">Legend</p>
        <div className="space-y-2">
          {showAnchorages && (
            <>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-ocean-600 border-2 border-white shadow-sm" />
                <span>Anchorage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative h-4 w-4">
                  <div className="h-4 w-4 rounded-full bg-ocean-600 border border-white" />
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border border-white" />
                </div>
                <span>Moorings Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-ocean-600 border-2 border-amber-400 shadow-sm" />
                <span>Sensitive Habitat</span>
              </div>
            </>
          )}
          {showDiveSites && (
            <>
              <div className="flex items-center gap-2">
                <div className="h-4 w-5 flex items-end justify-center">
                  <svg viewBox="0 0 32 40" width="16" height="20">
                    <rect x="2" y="0" width="3" height="40" fill="#4A5568"/>
                    <rect x="5" y="2" width="24" height="18" fill="#DC2626"/>
                    <polygon points="5,2 29,20 29,14 11,2" fill="white"/>
                    <polygon points="5,8 23,20 29,20 5,2" fill="white"/>
                  </svg>
                </div>
                <span>Dive Site</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative h-4 w-5 flex items-end justify-center">
                  <svg viewBox="0 0 32 40" width="16" height="20">
                    <rect x="2" y="0" width="3" height="40" fill="#4A5568"/>
                    <rect x="5" y="2" width="24" height="18" fill="#DC2626"/>
                    <polygon points="5,2 29,20 29,14 11,2" fill="white"/>
                    <polygon points="5,8 23,20 29,20 5,2" fill="white"/>
                  </svg>
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-purple-600 border border-white" />
                </div>
                <span>BVI Art Reef</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
