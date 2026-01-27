"use client";

import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, ZoomIn, ZoomOut, Locate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BVI_BOUNDS, MAPBOX_STYLE } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: { lat: number; lng: number };
  className?: string;
}

export interface MapPickerRef {
  locateUser: () => void;
}

export const MapPicker = forwardRef<MapPickerRef, MapPickerProps>(function MapPicker(
  { onLocationSelect, initialLocation, className },
  ref
) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );

  // Create a styled marker element
  const createMarkerElement = useCallback(() => {
    const el = document.createElement("div");
    el.style.cssText = `
      width: 40px;
      height: 40px;
      cursor: grab;
    `;
    el.innerHTML = `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
        <path d="M20 2C12.268 2 6 8.268 6 16c0 10.5 14 22 14 22s14-11.5 14-22c0-7.732-6.268-14-14-14z" fill="#0d9488" stroke="#ffffff" stroke-width="2"/>
        <circle cx="20" cy="16" r="5" fill="#ffffff"/>
      </svg>
    `;
    return el;
  }, []);

  const updateMarker = useCallback(
    (lng: number, lat: number) => {
      if (!map.current) return;

      if (marker.current) {
        // Move existing marker
        marker.current.setLngLat([lng, lat]);
      } else {
        // Create new marker
        const el = createMarkerElement();

        marker.current = new mapboxgl.Marker({
          element: el,
          draggable: true,
          anchor: 'bottom'
        })
          .setLngLat([lng, lat])
          .addTo(map.current);

        // Handle drag end to update location
        marker.current.on('dragend', () => {
          const lngLat = marker.current?.getLngLat();
          if (lngLat) {
            setSelectedLocation({ lat: lngLat.lat, lng: lngLat.lng });
            onLocationSelect(lngLat.lat, lngLat.lng);
          }
        });
      }

      setSelectedLocation({ lat, lng });
      onLocationSelect(lat, lng);
    },
    [onLocationSelect, createMarkerElement]
  );

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

      // Set initial marker if provided
      if (initialLocation) {
        updateMarker(initialLocation.lng, initialLocation.lat);
      }
    });

    // Click to place marker
    map.current.on("click", (e) => {
      updateMarker(e.lngLat.lng, e.lngLat.lat);
    });

    // Disable rotation
    map.current.dragRotate.disable();
    map.current.touchZoomRotate.disableRotation();

    return () => {
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initialLocation, updateMarker]);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Check if within BVI bounds
        if (
          longitude < BVI_BOUNDS.southwest.lng ||
          longitude > BVI_BOUNDS.northeast.lng ||
          latitude < BVI_BOUNDS.southwest.lat ||
          latitude > BVI_BOUNDS.northeast.lat
        ) {
          alert("Your location is outside BVI waters. Please select a location on the map.");
          return;
        }

        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 14,
          });
        }
        updateMarker(longitude, latitude);
      },
      () => {
        alert("Unable to retrieve your location");
      }
    );
  }, [updateMarker]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    locateUser: handleLocateMe,
  }), [handleLocateMe]);

  const handleZoomIn = () => {
    map.current?.zoomIn();
  };

  const handleZoomOut = () => {
    map.current?.zoomOut();
  };

  return (
    <div className={cn("relative overflow-hidden rounded-xl border", className)}>
      {/* Map container */}
      <div ref={mapContainer} className="h-full w-full min-h-[300px]" />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Instructions overlay */}
      {isLoaded && !selectedLocation && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-xl bg-background/95 px-4 py-2.5 shadow-lg backdrop-blur-sm border border-border/50">
          <p className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4 text-primary" />
            Tap on the map to drop a pin
          </p>
        </div>
      )}

      {/* Drag hint when pin is placed */}
      {isLoaded && selectedLocation && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-xl bg-green-50 dark:bg-green-950/50 px-4 py-2.5 shadow-lg backdrop-blur-sm border border-green-200 dark:border-green-800">
          <p className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
            <MapPin className="h-4 w-4" />
            Pin placed! Drag to adjust
          </p>
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

      {/* Coordinates display when pin is placed */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 rounded-xl bg-background/95 px-4 py-3 shadow-lg backdrop-blur-sm border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Selected Location</p>
          <p className="font-mono text-sm font-medium">
            {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
});
