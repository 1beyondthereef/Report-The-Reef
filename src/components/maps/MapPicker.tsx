"use client";

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
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
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const onLocationSelectRef = useRef(onLocationSelect);

  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );

  // Keep the callback ref updated
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("Mapbox token not configured");
      return;
    }

    console.log("MapPicker: Initializing map...");
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_STYLE,
      center: [BVI_BOUNDS.center.lng, BVI_BOUNDS.center.lat],
      zoom: BVI_BOUNDS.zoom,
      maxBounds: [
        [BVI_BOUNDS.southwest.lng - 0.1, BVI_BOUNDS.southwest.lat - 0.1],
        [BVI_BOUNDS.northeast.lng + 0.1, BVI_BOUNDS.northeast.lat + 0.1],
      ],
    });

    mapRef.current = map;

    map.on("load", () => {
      console.log("MapPicker: Map loaded successfully");
      setIsLoaded(true);

      // Set initial marker if provided
      if (initialLocation) {
        console.log("MapPicker: Setting initial location", initialLocation);
        placeMarker(initialLocation.lng, initialLocation.lat);
      }
    });

    // Click to place marker
    map.on("click", (e) => {
      console.log("MapPicker: Map clicked at", e.lngLat.lng, e.lngLat.lat);
      placeMarker(e.lngLat.lng, e.lngLat.lat);
    });

    // Disable rotation
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    // Function to place/move marker
    function placeMarker(lng: number, lat: number) {
      console.log("MapPicker: placeMarker called", { lng, lat });

      if (!mapRef.current) {
        console.error("MapPicker: Map not available");
        return;
      }

      if (markerRef.current) {
        // Move existing marker
        console.log("MapPicker: Moving existing marker");
        markerRef.current.setLngLat([lng, lat]);
      } else {
        // Create new marker with default Mapbox style (red pin)
        console.log("MapPicker: Creating new marker");

        const marker = new mapboxgl.Marker({
          color: "#0d9488", // Teal color
          draggable: true,
        })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        // Handle drag end
        marker.on("dragend", () => {
          const lngLat = marker.getLngLat();
          console.log("MapPicker: Marker dragged to", lngLat.lng, lngLat.lat);
          setSelectedLocation({ lat: lngLat.lat, lng: lngLat.lng });
          onLocationSelectRef.current(lngLat.lat, lngLat.lng);
        });

        markerRef.current = marker;
        console.log("MapPicker: Marker created and added to map");
      }

      setSelectedLocation({ lat, lng });
      onLocationSelectRef.current(lat, lng);
    }

    return () => {
      console.log("MapPicker: Cleaning up");
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once, initialLocation is captured at mount

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("MapPicker: Got user location", { latitude, longitude });

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

        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 14,
          });

          // Place marker at user location
          if (markerRef.current) {
            markerRef.current.setLngLat([longitude, latitude]);
          } else {
            const marker = new mapboxgl.Marker({
              color: "#0d9488",
              draggable: true,
            })
              .setLngLat([longitude, latitude])
              .addTo(mapRef.current);

            marker.on("dragend", () => {
              const lngLat = marker.getLngLat();
              setSelectedLocation({ lat: lngLat.lat, lng: lngLat.lng });
              onLocationSelectRef.current(lngLat.lat, lngLat.lng);
            });

            markerRef.current = marker;
          }

          setSelectedLocation({ lat: latitude, lng: longitude });
          onLocationSelectRef.current(latitude, longitude);
        }
      },
      (error) => {
        console.error("MapPicker: Geolocation error", error);
        alert("Unable to retrieve your location");
      }
    );
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    locateUser: handleLocateMe,
  }), []);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
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
