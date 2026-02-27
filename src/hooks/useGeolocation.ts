"use client";

import { useState, useCallback, useMemo } from "react";

interface GeolocationResult {
  lat: number;
  lng: number;
}

export function useGeolocation() {
  const [userLocation, setUserLocation] = useState<GeolocationResult | null>(null);

  const geoOptions: PositionOptions = useMemo(() => ({
    enableHighAccuracy: false,
    timeout: 15000,
    maximumAge: 300000,
  }), []);

  const getCurrentLocation = useCallback((): Promise<GeolocationResult> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);
          resolve(loc);
        },
        (error) => {
          console.error("[GPS] Error getting location:", error.code, error.message);
          reject(error);
        },
        geoOptions
      );
    });
  }, [geoOptions]);

  return { userLocation, getCurrentLocation };
}
