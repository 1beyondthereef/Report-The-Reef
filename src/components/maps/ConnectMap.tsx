"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Locate, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BVI_BOUNDS, MAPBOX_STYLE, BVI_ANCHORAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CheckedInUser {
  id: string;
  user_id: string;
  location_name: string;
  location_lat: number;
  location_lng: number;
  anchorage_id?: string;
  note?: string;
  checked_in_at: string;
  expires_at: string;
  profiles: {
    id: string;
    display_name: string;
    vessel_name?: string;
    boat_name?: string;
    avatar_url?: string;
    show_on_map: boolean;
  };
}

interface AnchorageWithCount {
  id: string;
  name: string;
  island: string;
  lat: number;
  lng: number;
  checkinCount: number;
}

interface ConnectMapProps {
  checkins: CheckedInUser[];
  onUserClick: (checkin: CheckedInUser) => void;
  onAnchorageClick?: (anchorage: AnchorageWithCount, usersAtAnchorage: CheckedInUser[]) => void;
  selectedUserId?: string;
  selectedAnchorageId?: string;
  className?: string;
  userLocation?: { lat: number; lng: number } | null;
  showAnchorageMarkers?: boolean;
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
  allowCustomPin?: boolean;
  customPinLocation?: { lng: number; lat: number } | null;
}

export function ConnectMap({
  checkins,
  onUserClick: _onUserClick,
  onAnchorageClick,
  selectedUserId,
  selectedAnchorageId,
  className,
  userLocation,
  showAnchorageMarkers = true,
  onMapClick,
  allowCustomPin = false,
  customPinLocation,
}: ConnectMapProps) {
  // Note: onUserClick is kept in interface for future use but currently unused
  void _onUserClick;
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const anchorageMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const userLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const customPinMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Create marker element for an anchorage
  const createAnchorageMarkerElement = useCallback(
    (anchorage: AnchorageWithCount, isSelected: boolean) => {
      const el = document.createElement("div");
      el.className = "anchorage-marker";
      el.style.cssText = "cursor: pointer;";

      const hasUsers = anchorage.checkinCount > 0;
      const size = isSelected ? 40 : 32;
      const bgColor = hasUsers ? "#0d9488" : "#6b7280";
      const borderColor = isSelected ? "#ffffff" : (hasUsers ? "#0f766e" : "#4b5563");

      el.innerHTML = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: ${bgColor};
            border: 3px solid ${borderColor};
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
            ${isSelected ? "transform: scale(1.1);" : ""}
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="5" r="3"/>
              <line x1="12" y1="22" x2="12" y2="8"/>
              <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
            </svg>
          </div>
          ${hasUsers ? `
            <div style="
              position: absolute;
              top: -4px;
              right: -4px;
              min-width: 20px;
              height: 20px;
              padding: 0 6px;
              border-radius: 10px;
              background: #ef4444;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="color: white; font-size: 11px; font-weight: 700;">${anchorage.checkinCount}</span>
            </div>
          ` : ""}
          ${isSelected ? `
            <div style="
              margin-top: 4px;
              background: white;
              padding: 4px 8px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              max-width: 160px;
              text-align: center;
            ">
              <p style="font-size: 11px; font-weight: 600; color: #1f2937; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${anchorage.name}
              </p>
              <p style="font-size: 9px; color: #6b7280; margin: 0;">
                ${anchorage.island}
              </p>
            </div>
          ` : ""}
        </div>
      `;

      return el;
    },
    []
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("Mapbox token not configured");
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_STYLE,
      center: [BVI_BOUNDS.center.lng, BVI_BOUNDS.center.lat],
      zoom: BVI_BOUNDS.zoom,
      maxBounds: [
        [BVI_BOUNDS.southwest.lng - 0.5, BVI_BOUNDS.southwest.lat - 0.5],
        [BVI_BOUNDS.northeast.lng + 0.5, BVI_BOUNDS.northeast.lat + 0.5],
      ],
    });

    mapRef.current = map;

    map.on("load", () => {
      setIsLoaded(true);
    });

    // Handle map clicks for custom pin
    map.on("click", (e) => {
      if (allowCustomPin && onMapClick) {
        onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      }
    });

    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    const userMarkers = userMarkersRef.current;
    const anchorageMarkers = anchorageMarkersRef.current;

    return () => {
      userMarkers.forEach((marker) => marker.remove());
      userMarkers.clear();
      anchorageMarkers.forEach((marker) => marker.remove());
      anchorageMarkers.clear();
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
      }
      if (customPinMarkerRef.current) {
        customPinMarkerRef.current.remove();
      }
      map.remove();
      mapRef.current = null;
    };
  }, [allowCustomPin, onMapClick]);

  // Update anchorage markers - uses BVI_ANCHORAGES as single source of truth
  useEffect(() => {
    if (!mapRef.current || !isLoaded || !showAnchorageMarkers) return;

    const map = mapRef.current;
    const currentMarkers = anchorageMarkersRef.current;

    // ALWAYS use BVI_ANCHORAGES directly - single source of truth for coordinates
    // This ensures markers never get wrong coordinates
    const anchorageList: AnchorageWithCount[] = BVI_ANCHORAGES.map(a => ({
      id: a.id,
      name: a.name,
      island: a.island,
      lat: a.lat,
      lng: a.lng,
      checkinCount: 0,
    }));

    // Count checkins per anchorage
    checkins.forEach((c) => {
      if (c.anchorage_id) {
        const anchorage = anchorageList.find(a => a.id === c.anchorage_id);
        if (anchorage) {
          anchorage.checkinCount++;
        }
      }
    });

    const anchorageIds = new Set(anchorageList.map((a) => a.id));

    // Remove markers no longer in the list
    currentMarkers.forEach((marker, id) => {
      if (!anchorageIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    });

    // Debug: Log on first load only
    if (currentMarkers.size === 0 && anchorageList.length > 0) {
      console.log(`[ConnectMap] Creating ${anchorageList.length} anchorage markers`);
      console.log("[ConnectMap] Sample coords [lng, lat]:", anchorageList.slice(0, 3).map(a =>
        `${a.name}: [${a.lng}, ${a.lat}]`
      ).join(", "));
    }

    // Add or update markers
    anchorageList.forEach((anchorage) => {
      const isSelected = anchorage.id === selectedAnchorageId;
      const existingMarker = currentMarkers.get(anchorage.id);

      if (existingMarker) {
        // Only recreate marker if selection state changed
        // Don't touch position - it's already correct from BVI_ANCHORAGES
        const needsUpdate = existingMarker.getElement().dataset.selected !== String(isSelected);

        if (needsUpdate) {
          // Remove old marker and create new one
          existingMarker.remove();
          currentMarkers.delete(anchorage.id);

          const el = createAnchorageMarkerElement(anchorage, isSelected);
          el.dataset.selected = String(isSelected);
          el.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onAnchorageClick) {
              const usersAtAnchorage = checkins.filter(c => c.anchorage_id === anchorage.id);
              onAnchorageClick(anchorage, usersAtAnchorage);
            }
          });

          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([anchorage.lng, anchorage.lat])
            .addTo(map);

          currentMarkers.set(anchorage.id, marker);
        }
      } else {
        // Create new marker with correct [lng, lat] order for Mapbox
        const el = createAnchorageMarkerElement(anchorage, isSelected);
        el.dataset.selected = String(isSelected);
        el.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onAnchorageClick) {
            const usersAtAnchorage = checkins.filter(c => c.anchorage_id === anchorage.id);
            onAnchorageClick(anchorage, usersAtAnchorage);
          }
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([anchorage.lng, anchorage.lat])
          .addTo(map);

        currentMarkers.set(anchorage.id, marker);
      }
    });
  }, [checkins, selectedAnchorageId, isLoaded, showAnchorageMarkers, createAnchorageMarkerElement, onAnchorageClick]);

  // Individual user markers are disabled - we only show anchorage markers with counts
  // Users can tap an anchorage to see the list of boaters there
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    // Clear any existing user markers
    const currentMarkers = userMarkersRef.current;
    currentMarkers.forEach((marker) => marker.remove());
    currentMarkers.clear();
  }, [checkins, isLoaded]);

  // Add/update user location marker
  useEffect(() => {
    if (!mapRef.current || !isLoaded || !userLocation) return;

    const map = mapRef.current;

    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
    } else {
      const el = document.createElement("div");
      el.innerHTML = `
        <div style="
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          border: 3px solid white;
          box-shadow: 0 0 0 2px #3b82f6, 0 4px 8px rgba(0,0,0,0.3);
        "></div>
      `;

      userLocationMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map);
    }
  }, [userLocation, isLoaded]);

  // Add/update custom pin marker
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    const map = mapRef.current;

    if (customPinLocation) {
      if (customPinMarkerRef.current) {
        customPinMarkerRef.current.setLngLat([customPinLocation.lng, customPinLocation.lat]);
      } else {
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
          ">
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 50% 50% 50% 0;
              background: #f97316;
              border: 3px solid white;
              box-shadow: 0 4px 8px rgba(0,0,0,0.3);
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="transform: rotate(45deg); color: white; font-size: 14px; font-weight: bold;">+</span>
            </div>
            <div style="
              margin-top: 4px;
              background: white;
              padding: 4px 8px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            ">
              <p style="font-size: 10px; font-weight: 600; color: #f97316; margin: 0;">Custom Location</p>
            </div>
          </div>
        `;

        customPinMarkerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([customPinLocation.lng, customPinLocation.lat])
          .addTo(map);
      }
    } else if (customPinMarkerRef.current) {
      customPinMarkerRef.current.remove();
      customPinMarkerRef.current = null;
    }
  }, [customPinLocation, isLoaded]);

  // Fly to selected user
  useEffect(() => {
    if (!mapRef.current || !selectedUserId) return;

    const checkin = checkins.find((c) => c.user_id === selectedUserId);
    if (checkin) {
      mapRef.current.flyTo({
        center: [checkin.location_lng, checkin.location_lat],
        zoom: 12,
        duration: 1000,
      });
    }
  }, [selectedUserId, checkins]);

  // Fly to selected anchorage
  useEffect(() => {
    if (!mapRef.current || !selectedAnchorageId) return;

    const anchorage = BVI_ANCHORAGES.find((a) => a.id === selectedAnchorageId);
    if (anchorage) {
      mapRef.current.flyTo({
        center: [anchorage.lng, anchorage.lat],
        zoom: 13,
        duration: 1000,
      });
    }
  }, [selectedAnchorageId]);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 12,
          });
        }
      },
      () => {
        alert("Unable to retrieve your location");
      }
    );
  }, []);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
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
          className="h-10 w-10 shadow-lg rounded-xl bg-white dark:bg-gray-800"
          aria-label="Use my location"
          title="Use my location"
        >
          <Locate className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={handleZoomIn}
          className="h-10 w-10 shadow-lg rounded-xl bg-white dark:bg-gray-800"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={handleZoomOut}
          className="h-10 w-10 shadow-lg rounded-xl bg-white dark:bg-gray-800"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 rounded-xl bg-background/95 p-3 text-xs shadow-lg backdrop-blur-sm border border-border/50">
        <p className="mb-2 font-semibold text-sm">BVI Connect</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-teal-500" />
            <span>Anchorage with boaters</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-500" />
            <span>Empty anchorage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span>Boater count badge</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span>Your location</span>
          </div>
          {allowCustomPin && (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-500" />
              <span>Custom location</span>
            </div>
          )}
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          {checkins.length} boater{checkins.length !== 1 ? "s" : ""} checked in
        </p>
      </div>

      {/* Custom pin instructions */}
      {allowCustomPin && (
        <div className="absolute top-4 left-4 rounded-xl bg-orange-500/90 text-white px-4 py-2 text-sm shadow-lg">
          <p className="font-medium">Tap the map to drop a pin</p>
          <p className="text-xs opacity-90">Or select an anchorage from the list</p>
        </div>
      )}
    </div>
  );
}
