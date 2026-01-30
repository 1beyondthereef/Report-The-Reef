"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Locate, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BVI_BOUNDS, MAPBOX_STYLE } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CheckedInUser {
  id: string;
  user_id: string;
  location_name: string;
  location_lat: number;
  location_lng: number;
  checked_in_at: string;
  expires_at: string;
  profiles: {
    id: string;
    display_name: string;
    boat_name?: string;
    photo_url?: string;
    is_visible: boolean;
  };
}

interface ConnectMapProps {
  checkins: CheckedInUser[];
  onUserClick: (checkin: CheckedInUser) => void;
  selectedUserId?: string;
  className?: string;
  userLocation?: { lat: number; lng: number } | null;
}

export function ConnectMap({
  checkins,
  onUserClick,
  selectedUserId,
  className,
  userLocation,
}: ConnectMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Create marker element for a checked-in user
  const createMarkerElement = useCallback(
    (checkin: CheckedInUser, isSelected: boolean) => {
      const el = document.createElement("div");
      el.className = "checkin-marker";
      el.style.cssText = "cursor: pointer;";

      const profile = checkin.profiles;
      const size = isSelected ? 56 : 48;
      const borderColor = isSelected ? "#0d9488" : "#ffffff";
      const displayName = profile.display_name || "Boater";
      const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      el.innerHTML = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
            border: 3px solid ${borderColor};
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
            ${isSelected ? "transform: scale(1.1);" : ""}
          ">
            ${
              profile.photo_url
                ? `<img src="${profile.photo_url}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />`
                : `<span style="color: white; font-weight: 600; font-size: ${isSelected ? "18px" : "16px"};">${initials}</span>`
            }
          </div>
          <div style="
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #22c55e;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          "></div>
          <div style="
            margin-top: 4px;
            background: white;
            padding: 4px 8px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            max-width: 140px;
            text-align: center;
          ">
            <p style="font-size: 12px; font-weight: 600; color: #1f2937; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${displayName}
            </p>
            ${
              profile.boat_name
                ? `<p style="font-size: 10px; color: #6b7280; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${profile.boat_name}</p>`
                : ""
            }
            <p style="font-size: 9px; color: #0d9488; margin: 2px 0 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${checkin.location_name}
            </p>
          </div>
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

    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    const markers = markersRef.current;
    return () => {
      markers.forEach((marker) => marker.remove());
      markers.clear();
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when checkins change
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    const map = mapRef.current;
    const currentMarkers = markersRef.current;
    const checkinIds = new Set(checkins.map((c) => c.id));

    // Remove markers for checkins no longer in the list
    currentMarkers.forEach((marker, id) => {
      if (!checkinIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    });

    // Add or update markers
    checkins.forEach((checkin) => {
      const isSelected = checkin.user_id === selectedUserId;
      const existingMarker = currentMarkers.get(checkin.id);

      if (existingMarker) {
        // Update position (use anchorage location for privacy)
        existingMarker.setLngLat([checkin.location_lng, checkin.location_lat]);
        // Update element
        const el = createMarkerElement(checkin, isSelected);
        el.addEventListener("click", () => onUserClick(checkin));
        existingMarker.getElement().replaceWith(el);
      } else {
        // Create new marker
        const el = createMarkerElement(checkin, isSelected);
        el.addEventListener("click", () => onUserClick(checkin));

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([checkin.location_lng, checkin.location_lat])
          .addTo(map);

        currentMarkers.set(checkin.id, marker);
      }
    });
  }, [checkins, selectedUserId, isLoaded, createMarkerElement, onUserClick]);

  // Add/update user location marker
  useEffect(() => {
    if (!mapRef.current || !isLoaded || !userLocation) return;

    const map = mapRef.current;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
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

      userMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map);
    }
  }, [userLocation, isLoaded]);

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
        <p className="mb-2 font-semibold text-sm">Checked-In Boaters</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>Checked in nearby</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span>Your location</span>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          {checkins.length} boater{checkins.length !== 1 ? "s" : ""} checked in
        </p>
      </div>
    </div>
  );
}
