// BVI Protected Areas Data
// Sources: S.R.O. 20/1959, S.R.O. 24/1977, Statutory Instrument No. 20 of 2003, National GIS, NPT Act 2006

import protectedAreasData from './protected-areas.json';

export interface ProtectedArea {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  protectionType: ProtectionType;
  existingStatus: ExistingStatus;
  proposedMgmtCategory: ManagementCategory | null;
  managementDescription: string | null;
  siteType: 'Marine' | 'Terrestrial';
  region: string;
  dateEstablished?: number;
  sizeAcres?: number;
  legalSource?: string;
  description?: string;
  legendNo?: number;
}

export type ProtectionType =
  | 'Bird Sanctuary'
  | 'Fisheries Protected Area'
  | 'Fisheries Priority Area'
  | 'National Park'
  | 'Marine Park'
  | 'Terrestrial Protected Area'
  | 'Proposed Marine Protected Area'
  | 'Proposed Marine and Terrestrial Areas'
  | 'Proposed Terrestrial Protected Area';

export type ExistingStatus =
  | 'Bird Sanctuary'
  | 'Fisheries Protected Area'
  | 'Fisheries Priority Area'
  | 'National Park'
  | 'Marine Park'
  | 'Ramsar site'
  | 'Fisheries Priority Area within boundary'
  | 'none';

export type ManagementCategory =
  | '15a(i)'  // Strict Nature Reserve
  | '15b'    // National Park / Marine Park
  | '15c'    // Natural Monument
  | '15d'    // Habitat/Species Management Area
  | '15e'    // Protected Landscape/Seascape
  | '15f'    // Managed Resource Area
  | '15h';   // Historic Site

export const MANAGEMENT_CATEGORIES: Record<ManagementCategory, { description: string; summary: string }> = {
  '15a(i)': { description: 'Strict Nature Reserve', summary: 'Managed for science or wilderness protection' },
  '15b': { description: 'National Park / Marine Park', summary: 'Managed for ecosystem protection and recreation' },
  '15c': { description: 'Natural Monument', summary: 'Managed for conservation of specific natural features' },
  '15d': { description: 'Habitat/Species Management Area', summary: 'Managed for conservation through intervention' },
  '15e': { description: 'Protected Landscape/Seascape', summary: 'Managed for landscape/seascape conservation and recreation' },
  '15f': { description: 'Managed Resource Area', summary: 'Managed for sustainable use of natural ecosystems' },
  '15h': { description: 'Historic Site', summary: 'Managed for historic and cultural preservation' }
};

// Activity restrictions by protection type
export const ACTIVITY_RESTRICTIONS: Record<string, string[]> = {
  'Bird Sanctuary': [
    'No landing on island (most sites)',
    'No disturbing wildlife',
    'No loud noises',
    'No hunting or trapping',
    'No collection of eggs or nests'
  ],
  'Fisheries Protected Area': [
    'No fishing of any kind',
    'No anchoring',
    'No spearfishing',
    'No collection of marine life',
    'No fish traps'
  ],
  'Fisheries Priority Area': [
    'Commercial fishing restricted',
    'Recreational fishing with limits',
    'No net fishing',
    'No fish traps',
    'Catch limits apply'
  ],
  'National Park': [
    'No removal of natural materials',
    'No hunting',
    'No littering',
    'Follow marked trails',
    'Permit may be required'
  ],
  'Marine Park': [
    'No anchoring on coral',
    'Use mooring buoys',
    'No fishing in core zones',
    'No collection of marine life',
    'NPT permit required'
  ],
  'Proposed Marine Protected Area': [
    'Future restrictions pending',
    'Check current regulations',
    'Respect wildlife',
    'Sustainable use encouraged'
  ],
  'Proposed Marine and Terrestrial Areas': [
    'Future restrictions pending',
    'Check current regulations',
    'Respect wildlife',
    'Sustainable use encouraged'
  ],
  'Proposed Terrestrial Protected Area': [
    'Future restrictions pending',
    'Check current regulations',
    'Respect wildlife',
    'Sustainable use encouraged'
  ],
  'Terrestrial Protected Area': [
    'No removal of natural materials',
    'No hunting',
    'No littering',
    'Follow marked trails'
  ]
};

// Helper function to get activity restrictions for a protected area
export function getActivityRestrictions(area: ProtectedArea): string[] {
  // Check existing status first, then protection type
  if (area.existingStatus !== 'none' && ACTIVITY_RESTRICTIONS[area.existingStatus]) {
    return ACTIVITY_RESTRICTIONS[area.existingStatus];
  }
  return ACTIVITY_RESTRICTIONS[area.protectionType] || [];
}

// Convert bird sanctuaries from JSON
export const BIRD_SANCTUARIES: ProtectedArea[] = protectedAreasData.birdSanctuaries.map((bs) => ({
  id: bs.id,
  name: bs.name,
  coordinates: bs.coordinates,
  protectionType: 'Bird Sanctuary' as ProtectionType,
  existingStatus: 'Bird Sanctuary' as ExistingStatus,
  proposedMgmtCategory: null,
  managementDescription: null,
  siteType: 'Terrestrial' as const,
  region: 'BVI',
  dateEstablished: bs.dateEstablished,
  legalSource: bs.legalSource
}));

// Convert fisheries protected areas from JSON
export const FISHERIES_PROTECTED_AREAS: ProtectedArea[] = protectedAreasData.fisheriesProtectedAreas.map((fpa) => ({
  id: fpa.id,
  name: fpa.name,
  coordinates: fpa.coordinates,
  protectionType: 'Fisheries Protected Area' as ProtectionType,
  existingStatus: 'Fisheries Protected Area' as ExistingStatus,
  proposedMgmtCategory: null,
  managementDescription: null,
  siteType: (fpa.siteType || 'Marine') as 'Marine' | 'Terrestrial',
  region: fpa.region || 'BVI',
  dateEstablished: fpa.dateEstablished,
  sizeAcres: fpa.sizeAcres,
  description: fpa.description
}));

// Convert map-based protected areas from JSON
function convertMapAreas(): ProtectedArea[] {
  const areas: ProtectedArea[] = [];
  const maps = protectedAreasData.protectedAreasByMap;

  Object.entries(maps).forEach(([mapKey, mapData]) => {
    const typedMapData = mapData as { mapTitle: string; region: string; areas: Array<{
      legendNo: number;
      name: string;
      proposedOrExisting: string;
      siteType: string;
      existingStatus: string;
      proposedMgmtCategory: string | null;
      managementDescription: string | null;
      coordinates: { lat: number; lng: number };
    }> };

    typedMapData.areas.forEach((area) => {
      areas.push({
        id: `map-${mapKey}-${area.legendNo}`,
        name: area.name,
        coordinates: area.coordinates,
        protectionType: area.proposedOrExisting as ProtectionType,
        existingStatus: (area.existingStatus || 'none') as ExistingStatus,
        proposedMgmtCategory: area.proposedMgmtCategory as ManagementCategory | null,
        managementDescription: area.managementDescription,
        siteType: area.siteType as 'Marine' | 'Terrestrial',
        region: typedMapData.region,
        legendNo: area.legendNo
      });
    });
  });

  return areas;
}

export const MAP_PROTECTED_AREAS: ProtectedArea[] = convertMapAreas();

// Combined array of all protected areas
export const ALL_PROTECTED_AREAS: ProtectedArea[] = [
  ...BIRD_SANCTUARIES,
  ...FISHERIES_PROTECTED_AREAS,
  ...MAP_PROTECTED_AREAS
];

// Helper functions
export const getProtectedAreasByType = (type: ProtectionType) => {
  return ALL_PROTECTED_AREAS.filter(area => area.protectionType === type);
};

export const getProtectedAreasByRegion = (region: string) => {
  return ALL_PROTECTED_AREAS.filter(area => area.region === region);
};

export const getProtectedAreasByStatus = (status: ExistingStatus) => {
  return ALL_PROTECTED_AREAS.filter(area => area.existingStatus === status);
};

export const getBirdSanctuaries = () => BIRD_SANCTUARIES;
export const getFisheriesProtectedAreas = () => FISHERIES_PROTECTED_AREAS;
export const getProposedAreas = () => ALL_PROTECTED_AREAS.filter(
  area => area.protectionType.includes('Proposed')
);
export const getExistingParks = () => ALL_PROTECTED_AREAS.filter(
  area => area.existingStatus === 'National Park' || area.existingStatus === 'Marine Park'
);
