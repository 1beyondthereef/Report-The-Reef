// Static anchorage data for production use
// This loads directly from the seed data file so it works on Vercel
// without needing a persistent database for anchorage information

import { anchoragesData } from "../../prisma/seed-data/anchorages";

export interface Anchorage {
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
  hasReef: boolean;
  hasSeagrass: boolean;
  habitatWarning: string | null;
  moorings: {
    id: string;
    name: string;
    pricePerNight: number;
    maxLength: number;
    maxWeight: number | null;
    notes: string | null;
  }[];
  _count: {
    reviews: number;
    moorings: number;
  };
}

// Transform seed data to match the API response format
function transformAnchorageData(): Anchorage[] {
  return anchoragesData.map((anchorage, index) => ({
    id: `anchorage-${index + 1}`,
    name: anchorage.name,
    description: anchorage.description,
    latitude: anchorage.latitude,
    longitude: anchorage.longitude,
    island: anchorage.island,
    depth: anchorage.depth,
    holding: anchorage.holding,
    protection: anchorage.protection,
    capacity: anchorage.capacity,
    amenities: JSON.stringify(anchorage.amenities),
    images: JSON.stringify(anchorage.images),
    hasReef: anchorage.sensitiveHabitat.hasReef,
    hasSeagrass: anchorage.sensitiveHabitat.hasSeagrass,
    habitatWarning: anchorage.sensitiveHabitat.warning,
    moorings: anchorage.moorings.map((mooring, mIndex) => ({
      id: `mooring-${index + 1}-${mIndex + 1}`,
      name: mooring.name,
      pricePerNight: mooring.pricePerNight,
      maxLength: mooring.maxLength,
      maxWeight: mooring.maxWeight,
      notes: mooring.notes,
    })),
    _count: {
      reviews: 0,
      moorings: anchorage.moorings.length,
    },
  }));
}

// Cached anchorages data
let cachedAnchorages: Anchorage[] | null = null;

export function getAnchorages(): Anchorage[] {
  if (!cachedAnchorages) {
    cachedAnchorages = transformAnchorageData();
  }
  return cachedAnchorages;
}

export function getAnchorageById(id: string): Anchorage | undefined {
  return getAnchorages().find((a) => a.id === id);
}

export function searchAnchorages(options: {
  search?: string;
  island?: string;
}): Anchorage[] {
  let results = getAnchorages();

  if (options.island) {
    results = results.filter((a) => a.island === options.island);
  }

  if (options.search) {
    const searchLower = options.search.toLowerCase();
    results = results.filter(
      (a) =>
        a.name.toLowerCase().includes(searchLower) ||
        a.description.toLowerCase().includes(searchLower) ||
        a.island.toLowerCase().includes(searchLower)
    );
  }

  return results.sort((a, b) => a.name.localeCompare(b.name));
}

// Mooring type with anchorage info
export interface MooringWithAnchorage {
  id: string;
  name: string;
  pricePerNight: number;
  maxLength: number;
  maxWeight: number | null;
  notes: string | null;
  isActive: boolean;
  anchorage: {
    id: string;
    name: string;
    island: string;
    latitude: number;
    longitude: number;
  };
}

export function getMoorings(options?: {
  anchorageId?: string;
  minLength?: number;
  maxPrice?: number;
}): MooringWithAnchorage[] {
  const anchorages = getAnchorages();
  const moorings: MooringWithAnchorage[] = [];

  for (const anchorage of anchorages) {
    for (const mooring of anchorage.moorings) {
      moorings.push({
        ...mooring,
        isActive: true,
        anchorage: {
          id: anchorage.id,
          name: anchorage.name,
          island: anchorage.island,
          latitude: anchorage.latitude,
          longitude: anchorage.longitude,
        },
      });
    }
  }

  let results = moorings;

  if (options?.anchorageId) {
    results = results.filter((m) => m.anchorage.id === options.anchorageId);
  }

  if (options?.minLength) {
    results = results.filter((m) => m.maxLength >= options.minLength!);
  }

  if (options?.maxPrice) {
    results = results.filter((m) => m.pricePerNight <= options.maxPrice!);
  }

  return results.sort((a, b) => {
    const anchorageCompare = a.anchorage.name.localeCompare(b.anchorage.name);
    if (anchorageCompare !== 0) return anchorageCompare;
    return a.name.localeCompare(b.name);
  });
}
