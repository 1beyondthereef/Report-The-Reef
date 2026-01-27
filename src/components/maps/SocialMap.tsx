"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Locate, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BVI_BOUNDS, MAPBOX_STYLE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { OnlineUser } from "@/types/social";

interface SocialMapProps {
  users: OnlineUser[];
  onUserClick: (user: OnlineUser) => void;
  selectedUserId?: string;
  className?: string;
  currentUserLocation?: { lat: number; lng: number } | null;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

export function SocialMap({
  users,
  onUserClick,
  selectedUserId,
  className,
  currentUserLocation,
  onLocationUpdate,
}: SocialMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  // Create marker element for a user
  const createMarkerElement = useCallback(
    (user: OnlineUser, isSelected: boolean) => {
      const el = document.createElement("div");
      el.className = "user-marker";
      el.style.cssText = "cursor: pointer;";

      const size = isSelected ? 56 : 48;
      const statusColor = user.isOnline ? "#22c55e" : "#9ca3af";
      const borderColor = user.isCurrentUser ? "#0d9488" : isSelected ? "#0d9488" : "#ffffff";
      const displayName = user.name || "Boater";
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
              user.avatarUrl
                ? `<img src="${user.avatarUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />`
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
            background: ${statusColor};
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          "></div>
          <div style="
            margin-top: 4px;
            background: white;
            padding: 4px 8px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            max-width: 120px;
            text-align: center;
          ">
            <p style="font-size: 12px; font-weight: 600; color: #1f2937; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${displayName}${user.isCurrentUser ? " (You)" : ""}
            </p>
            ${
              user.boatName
                ? `<p style="font-size: 10px; color: #6b7280; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${user.boatName}</p>`
                : ""
            }
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

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when users change
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    const map = mapRef.current;
    const currentMarkers = markersRef.current;
    const userIds = new Set(users.map((u) => u.id));

    // Remove markers for users no longer in the list
    currentMarkers.forEach((marker, id) => {
      if (!userIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    });

    // Add or update markers
    users.forEach((user) => {
      const isSelected = user.id === selectedUserId;
      const existingMarker = currentMarkers.get(user.id);

      if (existingMarker) {
        // Update position
        existingMarker.setLngLat([user.longitude, user.latitude]);
        // Update element
        const el = createMarkerElement(user, isSelected);
        el.addEventListener("click", () => onUserClick(user));
        existingMarker.getElement().replaceWith(el);
      } else {
        // Create new marker
        const el = createMarkerElement(user, isSelected);
        el.addEventListener("click", () => onUserClick(user));

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([user.longitude, user.latitude])
          .addTo(map);

        currentMarkers.set(user.id, marker);
      }
    });
  }, [users, selectedUserId, isLoaded, createMarkerElement, onUserClick]);

  // Fly to selected user
  useEffect(() => {
    if (!mapRef.current || !selectedUserId) return;

    const user = users.find((u) => u.id === selectedUserId);
    if (user) {
      mapRef.current.flyTo({
        center: [user.longitude, user.latitude],
        zoom: 12,
        duration: 1000,
      });
    }
  }, [selectedUserId, users]);

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

        if (onLocationUpdate) {
          onLocationUpdate(latitude, longitude);
        }
      },
      () => {
        alert("Unable to retrieve your location");
      }
    );
  }, [onLocationUpdate]);

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
        <p className="mb-2 font-semibold text-sm">Boaters Nearby</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>Online now</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-400" />
            <span>Recently active</span>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          {users.length} boater{users.length !== 1 ? "s" : ""} visible
        </p>
      </div>
    </div>
  );
}
