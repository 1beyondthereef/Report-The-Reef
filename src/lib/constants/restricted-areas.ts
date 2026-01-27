// BVI Restricted/Protected Marine Areas
// Based on BVI National Parks Trust and Conservation & Fisheries Department regulations

export interface RestrictedArea {
  id: string;
  name: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  // For larger areas, define approximate boundary
  radiusMeters?: number;
  type: 'marine_park' | 'fisheries_protected' | 'coral_restoration' | 'seagrass_protection' | 'bird_sanctuary' | 'no_anchor_zone';
  restrictions: {
    noAnchoring: boolean;
    noFishing: boolean;
    noEntry: boolean;
    mooringRequired: boolean;
    diveOperatorRequired: boolean;
    dayUseOnly: boolean;
    noWake: boolean;
  };
  prohibitedActivities: string[];
  allowedActivities: string[];
  reason: string;
  seasonalRestrictions?: {
    startMonth: number;
    endMonth: number;
    description: string;
  };
  penalties?: string;
  managingAuthority: string;
  permitRequired: boolean;
  notes?: string;
}

export const BVI_RESTRICTED_AREAS: RestrictedArea[] = [
  // ==========================================
  // MARINE NATIONAL PARKS
  // ==========================================
  {
    id: 'rhone-marine-park',
    name: 'RMS Rhone Marine National Park',
    location: 'Salt Island',
    coordinates: {
      lat: 18.4067,
      lng: -64.5317
    },
    radiusMeters: 500,
    type: 'marine_park',
    restrictions: {
      noAnchoring: true,
      noFishing: true,
      noEntry: false,
      mooringRequired: true,
      diveOperatorRequired: false,
      dayUseOnly: true,
      noWake: true
    },
    prohibitedActivities: [
      'Anchoring',
      'Fishing (including spearfishing)',
      'Lobstering',
      'Shell collection',
      'Removal of artifacts',
      'Overnight mooring'
    ],
    allowedActivities: [
      'Diving with mooring permit',
      'Snorkeling',
      'Photography'
    ],
    reason: 'Historic shipwreck preservation and coral reef protection. The RMS Rhone sank in 1867 and is a protected underwater archaeological site.',
    penalties: 'Fines up to $10,000 and/or imprisonment for violations of National Parks regulations.',
    managingAuthority: 'BVI National Parks Trust',
    permitRequired: true,
    notes: 'NPT mooring permit required. 90-minute time limit on moorings. 5 MPH no-wake zone.'
  },
  {
    id: 'the-indians-protected',
    name: 'The Indians Marine Protected Area',
    location: 'Between Norman Island & Pelican Island',
    coordinates: {
      lat: 18.3322,
      lng: -64.6297
    },
    radiusMeters: 300,
    type: 'marine_park',
    restrictions: {
      noAnchoring: true,
      noFishing: true,
      noEntry: false,
      mooringRequired: true,
      diveOperatorRequired: false,
      dayUseOnly: true,
      noWake: true
    },
    prohibitedActivities: [
      'Anchoring',
      'Fishing',
      'Spearfishing',
      'Shell collection',
      'Coral touching/removal',
      'Overnight mooring'
    ],
    allowedActivities: [
      'Snorkeling',
      'Diving',
      'Photography'
    ],
    reason: 'Protected coral reef ecosystem. Four volcanic pinnacles with extensive coral growth and marine biodiversity.',
    penalties: 'Fines up to $10,000 for anchoring damage to coral.',
    managingAuthority: 'BVI National Parks Trust',
    permitRequired: true,
    notes: 'Day use only. Use mooring balls - do not anchor. NPT permit required.'
  },
  {
    id: 'the-caves-protected',
    name: 'The Caves at Norman Island',
    location: 'Norman Island',
    coordinates: {
      lat: 18.315769,
      lng: -64.623893
    },
    radiusMeters: 200,
    type: 'marine_park',
    restrictions: {
      noAnchoring: true,
      noFishing: true,
      noEntry: false,
      mooringRequired: true,
      diveOperatorRequired: false,
      dayUseOnly: true,
      noWake: true
    },
    prohibitedActivities: [
      'Anchoring',
      'Fishing',
      'Artifact removal',
      'Overnight stays'
    ],
    allowedActivities: [
      'Snorkeling',
      'Cave exploration',
      'Photography'
    ],
    reason: 'Historic sea caves and marine habitat protection. Rumored inspiration for Treasure Island.',
    managingAuthority: 'BVI National Parks Trust',
    permitRequired: true,
    notes: 'Use dinghy moorings. Bring underwater flashlight for cave exploration.'
  },
  {
    id: 'the-baths',
    name: 'The Baths National Park',
    location: 'Virgin Gorda',
    coordinates: {
      lat: 18.4297,
      lng: -64.4463
    },
    radiusMeters: 400,
    type: 'marine_park',
    restrictions: {
      noAnchoring: true,
      noFishing: true,
      noEntry: false,
      mooringRequired: true,
      diveOperatorRequired: false,
      dayUseOnly: true,
      noWake: true
    },
    prohibitedActivities: [
      'Anchoring',
      'Fishing',
      'Jet skis',
      'Loud music',
      'Removal of sand/rocks'
    ],
    allowedActivities: [
      'Swimming',
      'Snorkeling',
      'Photography',
      'Hiking trails'
    ],
    reason: 'Unique geological formations (giant granite boulders), protected beach, and marine habitat.',
    managingAuthority: 'BVI National Parks Trust',
    permitRequired: true,
    notes: 'Very popular tourist destination. Arrive early for best experience. Use mooring balls only.'
  },
  {
    id: 'west-dog-sanctuary',
    name: 'West Dog National Park',
    location: 'The Dogs, between Tortola & Virgin Gorda',
    coordinates: {
      lat: 18.4833,
      lng: -64.4667
    },
    radiusMeters: 300,
    type: 'bird_sanctuary',
    restrictions: {
      noAnchoring: true,
      noFishing: true,
      noEntry: true,  // Landing prohibited
      mooringRequired: true,
      diveOperatorRequired: false,
      dayUseOnly: true,
      noWake: true
    },
    prohibitedActivities: [
      'Landing on island',
      'Anchoring',
      'Fishing',
      'Disturbing wildlife',
      'Loud noises near nesting areas'
    ],
    allowedActivities: [
      'Diving from mooring',
      'Snorkeling',
      'Bird watching from boat'
    ],
    reason: 'Critical seabird nesting habitat including endangered Roseate Terns, Bridled Terns, and Red-billed Tropicbirds.',
    seasonalRestrictions: {
      startMonth: 4,
      endMonth: 9,
      description: 'Peak nesting season April-September. Extra caution required - no disturbance of nesting birds.'
    },
    managingAuthority: 'BVI National Parks Trust',
    permitRequired: true,
    notes: 'No landing on island. View birds from the water only to prevent nest abandonment.'
  },
  {
    id: 'monkey-point-guana',
    name: 'Monkey Point Marine Area',
    location: 'Guana Island',
    coordinates: {
      lat: 18.4500,
      lng: -64.5667
    },
    radiusMeters: 200,
    type: 'marine_park',
    restrictions: {
      noAnchoring: true,
      noFishing: true,
      noEntry: false,
      mooringRequired: true,
      diveOperatorRequired: false,
      dayUseOnly: true,
      noWake: true
    },
    prohibitedActivities: [
      'Anchoring',
      'Fishing',
      'Shell collection',
      'Overnight mooring'
    ],
    allowedActivities: [
      'Snorkeling',
      'Swimming',
      'Photography'
    ],
    reason: 'Protected snorkeling area with healthy coral and marine life.',
    managingAuthority: 'BVI National Parks Trust',
    permitRequired: true,
    notes: 'Day use only moorings available. Popular snorkeling spot.'
  },

  // ==========================================
  // FISHERIES PROTECTED AREAS
  // ==========================================
  {
    id: 'horseshoe-reef',
    name: 'Horseshoe Reef Fisheries Protected Area',
    location: 'Anegada',
    coordinates: {
      lat: 18.7500,
      lng: -64.3500
    },
    radiusMeters: 5000, // Large area - 18 miles long
    type: 'fisheries_protected',
    restrictions: {
      noAnchoring: true,
      noFishing: true,
      noEntry: false,
      mooringRequired: false,
      diveOperatorRequired: true,
      dayUseOnly: true,
      noWake: false
    },
    prohibitedActivities: [
      'Anchoring',
      'All fishing',
      'Spearfishing',
      'Snorkeling without operator',
      'Unaccompanied diving',
      'Shell/coral collection'
    ],
    allowedActivities: [
      'Diving with licensed operator only',
      'Guided tours'
    ],
    reason: 'Fourth largest barrier reef in the world (18 miles). Critical habitat for over 200 shipwrecks and extensive coral ecosystems.',
    penalties: 'Heavy fines for fishing or anchoring violations. Vessels may be seized.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: true,
    notes: 'EXTREME CAUTION: Dangerous reef has claimed 200+ vessels. Diving permitted only with reputable dive operator.'
  },
  {
    id: 'hans-creek',
    name: 'Hans Creek Fisheries Protected Area',
    location: 'Near Beef Island',
    coordinates: {
      lat: 18.4350,
      lng: -64.5250
    },
    radiusMeters: 500,
    type: 'fisheries_protected',
    restrictions: {
      noAnchoring: false,
      noFishing: true,
      noEntry: false,
      mooringRequired: false,
      diveOperatorRequired: false,
      dayUseOnly: false,
      noWake: true
    },
    prohibitedActivities: [
      'Commercial fishing',
      'Recreational fishing',
      'Spearfishing',
      'Net fishing',
      'Fish traps'
    ],
    allowedActivities: [
      'Anchoring in designated areas',
      'Snorkeling',
      'Swimming',
      'Kayaking'
    ],
    reason: 'Mangrove and seagrass nursery habitat essential for fish reproduction and juvenile development.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: false,
    notes: 'Important fish nursery area. Mangrove protection zone.'
  },

  // ==========================================
  // CORAL RESTORATION SITES
  // ==========================================
  {
    id: 'coral-restoration-cooper',
    name: 'Cooper Island Coral Restoration Site',
    location: 'Cooper Island',
    coordinates: {
      lat: 18.3856,
      lng: -64.5145
    },
    radiusMeters: 150,
    type: 'coral_restoration',
    restrictions: {
      noAnchoring: true,
      noFishing: true,
      noEntry: false,
      mooringRequired: true,
      diveOperatorRequired: false,
      dayUseOnly: false,
      noWake: true
    },
    prohibitedActivities: [
      'Anchoring',
      'Touching coral structures',
      'Standing on reef',
      'Fishing'
    ],
    allowedActivities: [
      'Snorkeling (careful observation)',
      'Diving (no contact)',
      'Photography'
    ],
    reason: 'Active coral restoration project. Coral nurseries and transplanted colonies are regenerating reef ecosystems.',
    managingAuthority: 'ARK BVI / Cooper Island Beach Club',
    permitRequired: false,
    notes: 'Coral nurseries in area. Maintain distance from restoration structures. Report any damage.'
  },

  // ==========================================
  // SEAGRASS PROTECTION ZONES
  // ==========================================
  {
    id: 'manchioneel-seagrass',
    name: 'Manchioneel Bay Seagrass Protection Zone',
    location: 'Cooper Island',
    coordinates: {
      lat: 18.3870,
      lng: -64.5130
    },
    radiusMeters: 300,
    type: 'seagrass_protection',
    restrictions: {
      noAnchoring: true,
      noFishing: false,
      noEntry: false,
      mooringRequired: true,
      diveOperatorRequired: false,
      dayUseOnly: false,
      noWake: true
    },
    prohibitedActivities: [
      'Anchoring (seagrass beds)',
      'Prop scarring',
      'Bottom disturbance'
    ],
    allowedActivities: [
      'Mooring',
      'Snorkeling',
      'Swimming',
      'Kayaking'
    ],
    reason: 'Critical seagrass habitat monitored by Conservation & Fisheries. Essential for sea turtle feeding and fish nursery.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: false,
    notes: 'Part of BVI seagrass monitoring program. Use mooring balls only - 30 balls available.'
  },
  {
    id: 'trellis-bay-seagrass',
    name: 'Trellis Bay Seagrass Area',
    location: 'Beef Island',
    coordinates: {
      lat: 18.4450,
      lng: -64.5350
    },
    radiusMeters: 400,
    type: 'seagrass_protection',
    restrictions: {
      noAnchoring: true,
      noFishing: false,
      noEntry: false,
      mooringRequired: true,
      diveOperatorRequired: false,
      dayUseOnly: false,
      noWake: true
    },
    prohibitedActivities: [
      'Anchoring in seagrass',
      'Prop scarring',
      'Dredging'
    ],
    allowedActivities: [
      'Mooring',
      'Swimming',
      'Kayaking',
      'Dining ashore'
    ],
    reason: 'Protected seagrass beds supporting green sea turtle population and juvenile fish.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: false,
    notes: 'Anchor only in sandy patches if no moorings available. Popular anchorage near airport.'
  },

  // ==========================================
  // SHARK & RAY SANCTUARY (Territory-wide)
  // ==========================================
  {
    id: 'bvi-shark-sanctuary',
    name: 'BVI Shark & Ray Sanctuary',
    location: 'All BVI Waters',
    coordinates: {
      lat: 18.4255,
      lng: -64.6205
    },
    radiusMeters: 50000, // Territory-wide
    type: 'fisheries_protected',
    restrictions: {
      noAnchoring: false,
      noFishing: false, // General fishing allowed, just not sharks/rays
      noEntry: false,
      mooringRequired: false,
      diveOperatorRequired: false,
      dayUseOnly: false,
      noWake: false
    },
    prohibitedActivities: [
      'Shark fishing',
      'Ray fishing',
      'Possession of shark/ray products',
      'Sale of shark/ray products',
      'Shark finning'
    ],
    allowedActivities: [
      'All other activities',
      'Shark/ray observation',
      'Photography'
    ],
    reason: 'The BVI is a designated Shark & Ray Sanctuary. All shark and ray species are fully protected throughout territorial waters.',
    penalties: 'Illegal to commercially fish for, sell, or possess any shark or ray species. Heavy fines apply.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: false,
    notes: 'Territory-wide protection. Report any shark/ray fishing to authorities.'
  }
];

// Helper functions
export const getRestrictedAreasByType = (type: RestrictedArea['type']) => {
  return BVI_RESTRICTED_AREAS.filter(area => area.type === type);
};

export const getAreasWithNoAnchoring = () => {
  return BVI_RESTRICTED_AREAS.filter(area => area.restrictions.noAnchoring);
};

export const getAreasRequiringPermit = () => {
  return BVI_RESTRICTED_AREAS.filter(area => area.permitRequired);
};

export const getSeasonallyRestricted = (month: number) => {
  return BVI_RESTRICTED_AREAS.filter(area => {
    if (!area.seasonalRestrictions) return false;
    const { startMonth, endMonth } = area.seasonalRestrictions;
    if (startMonth <= endMonth) {
      return month >= startMonth && month <= endMonth;
    }
    // Handle wrap-around (e.g., Nov-Feb)
    return month >= startMonth || month <= endMonth;
  });
};
