// BVI Restricted/Protected Marine Areas
// Sources: BVI ARK, BVI Fisheries Regulations 2003 (Statutory Instrument No. 20 of 2003),
// Bird Sanctuaries Order (S.R.O. 20/1959), National GIS, NPT Act 2006

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
  sizeAcres?: number;
  type: 'marine_park' | 'fisheries_protected' | 'fisheries_priority' | 'coral_restoration' | 'seagrass_protection' | 'bird_sanctuary' | 'no_anchor_zone';
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
  dateEstablished?: number;
  legalSource?: string;
  notes?: string;
}

// BVI Fishing Closed Seasons - Territory Wide
export interface ClosedSeason {
  id: string;
  species: string;
  startMonth: number;
  endMonth: number;
  description: string;
  restrictions: string[];
  notes?: string;
}

export const BVI_CLOSED_SEASONS: ClosedSeason[] = [
  {
    id: 'lobster-closed',
    species: 'Spiny Lobster',
    startMonth: 8, // August 1
    endMonth: 10, // October 31
    description: 'Closed season for spiny lobster fishing. No taking, selling, or possessing spiny lobsters.',
    restrictions: [
      'No catching or taking of lobsters',
      'No buying or selling of lobsters',
      'No possessing of lobsters',
      'No importing or exporting of lobsters',
      'Minimum size 3.5 inches carapace length applies year-round'
    ],
    notes: 'Berried (egg-bearing) females are protected year-round.'
  },
  {
    id: 'conch-closed',
    species: 'Queen Conch',
    startMonth: 7, // July 1
    endMonth: 9, // September 30
    description: 'Closed season for queen conch harvesting. Protects breeding population.',
    restrictions: [
      'No catching or taking of conch',
      'No buying or selling of conch',
      'No possessing of conch meat',
      'Minimum size 9 inches shell length applies year-round',
      'Maximum 2 conch per person per day (open season)'
    ],
    notes: 'Conch populations have declined significantly. Help protect this species.'
  },
  {
    id: 'whelk-closed',
    species: 'Whelk',
    startMonth: 4, // April 1
    endMonth: 9, // September 30
    description: 'Closed season for whelk harvesting to protect breeding season.',
    restrictions: [
      'No catching or taking of whelks',
      'No buying or selling of whelks',
      'No possessing of whelks',
      'Minimum size 2.5 inches shell length applies year-round'
    ]
  },
  {
    id: 'turtle-protected',
    species: 'Sea Turtles (All Species)',
    startMonth: 1, // Year-round
    endMonth: 12, // Year-round
    description: 'All sea turtles are protected year-round in BVI waters.',
    restrictions: [
      'No catching, hunting, or killing sea turtles',
      'No taking or destroying turtle eggs',
      'No possessing turtle meat, shell, or eggs',
      'No buying or selling turtle products',
      'No disturbing nesting turtles',
      'Keep 20ft distance from sea turtles'
    ],
    notes: 'Hawksbill, Green, Leatherback, and Loggerhead turtles are all protected. Report nesting activity to Conservation & Fisheries.'
  },
  {
    id: 'shark-ray-protected',
    species: 'Sharks & Rays (All Species)',
    startMonth: 1, // Year-round
    endMonth: 12, // Year-round
    description: 'BVI is a Shark & Ray Sanctuary. All species fully protected.',
    restrictions: [
      'No fishing for sharks or rays',
      'No possessing shark or ray products',
      'No selling shark or ray products',
      'No shark finning',
      'Release any accidentally caught sharks/rays immediately'
    ],
    notes: 'Heavy fines for violations. Report illegal shark fishing to authorities.'
  },
  {
    id: 'grouper-closed',
    species: 'Nassau Grouper',
    startMonth: 12, // December 1
    endMonth: 3, // March 31
    description: 'Closed season during spawning aggregation. No taking of Nassau grouper.',
    restrictions: [
      'No catching or taking of Nassau grouper',
      'No buying or selling of Nassau grouper',
      'No possessing of Nassau grouper',
      'Minimum size 12 inches applies year-round'
    ],
    notes: 'Nassau grouper spawning aggregations are critical for population recovery.'
  },
  {
    id: 'parrotfish-protected',
    species: 'Parrotfish',
    startMonth: 1, // Year-round
    endMonth: 12, // Year-round
    description: 'Parrotfish harvest is restricted. These fish are essential for coral reef health.',
    restrictions: [
      'Commercial harvest prohibited',
      'Recreational limit: 2 per person per day',
      'Minimum size: 10 inches',
      'No spearfishing of parrotfish'
    ],
    notes: 'Parrotfish produce sand and help maintain healthy coral reefs.'
  }
];

// General BVI Fishing Regulations
export const BVI_GENERAL_REGULATIONS = {
  title: 'BVI Fishing Regulations',
  source: 'BVI Conservation & Fisheries Department',
  lastUpdated: '2024',
  generalRules: [
    'Fishing license required for all non-BVI residents',
    'Spearfishing prohibited within 200 meters of shore',
    'No spearfishing while using SCUBA',
    'No fish traps without permit',
    'No nets longer than 150 feet',
    'No fishing with chemicals or explosives',
    'Catch limits apply to all species'
  ],
  mooringRules: [
    'Use mooring balls where available',
    'Anchoring in seagrass beds prohibited',
    'National Parks Trust permit required for NPT moorings',
    'Maximum 90-minute mooring at dive sites',
    'No overnight mooring at day-use sites'
  ],
  penalties: [
    'First offense: Up to $5,000 fine',
    'Subsequent offenses: Up to $10,000 fine and/or imprisonment',
    'Vessel and equipment may be seized',
    'Court may order compensation for damage'
  ],
  reportViolations: {
    phone: '(284) 468-6373',
    email: 'fisheries@gov.vg',
    description: 'Report illegal fishing activity to Conservation & Fisheries Department'
  },
  attribution: 'Source: BVI ARK, BVI Fisheries Regulations 2003, Bird Sanctuaries Order 1959'
};

export const BVI_RESTRICTED_AREAS: RestrictedArea[] = [
  // ==========================================
  // MARINE NATIONAL PARKS
  // ==========================================
  {
    id: 'rhone-marine-park',
    name: 'RMS Rhone Marine National Park',
    location: 'Salt Island',
    coordinates: {
      lat: 18.3800,
      lng: -64.5350
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

  // ==========================================
  // FISHERIES PROTECTED AREAS (14 total from 2003 regulations)
  // Source: Fisheries Regulations, 2003 (Statutory Instrument No. 20 of 2003)
  // ==========================================
  {
    id: 'horseshoe-reef',
    name: 'Horseshoe Reef',
    location: 'Anegada',
    coordinates: {
      lat: 18.7200,
      lng: -64.2800
    },
    radiusMeters: 8000,
    sizeAcres: 10144.8,
    type: 'fisheries_protected',
    dateEstablished: 2003,
    legalSource: 'Statutory Instrument No. 20 of 2003',
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
    reason: 'Fourth-largest barrier reef in the world (18 miles). Critical habitat for over 200 shipwrecks and extensive coral ecosystems.',
    penalties: 'Heavy fines for fishing or anchoring violations. Vessels may be seized.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: true,
    notes: 'EXTREME CAUTION: Dangerous reef has claimed 200+ vessels. Diving permitted only with reputable dive operator.'
  },
  {
    id: 'hans-creek',
    name: 'Hans Creek',
    location: 'Beef Island',
    coordinates: {
      lat: 18.4230,
      lng: -64.5240
    },
    radiusMeters: 400,
    sizeAcres: 119.4,
    type: 'fisheries_protected',
    dateEstablished: 2003,
    legalSource: 'Statutory Instrument No. 20 of 2003',
    restrictions: {
      noAnchoring: true,
      noFishing: true,
      noEntry: false,
      mooringRequired: false,
      diveOperatorRequired: false,
      dayUseOnly: false,
      noWake: true
    },
    prohibitedActivities: [
      'Anchoring',
      'All fishing activities',
      'Spearfishing',
      'Net fishing',
      'Fish traps'
    ],
    allowedActivities: [
      'Snorkeling (no-take)',
      'Swimming',
      'Kayaking',
      'Photography'
    ],
    reason: 'Mangrove and seagrass nursery habitat essential for fish reproduction and juvenile development.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: false,
    notes: 'Important fish nursery area. Mangrove protection zone. No anchoring or recreational fishing.'
  },
  {
    id: 'beef-island-channel',
    name: 'Beef Island Channel',
    location: 'Beef Island',
    coordinates: {
      lat: 18.4400,
      lng: -64.5350
    },
    radiusMeters: 350,
    sizeAcres: 93.9,
    type: 'fisheries_protected',
    dateEstablished: 2003,
    legalSource: 'Statutory Instrument No. 20 of 2003',
    restrictions: {
      noAnchoring: true,
      noFishing: true,
      noEntry: false,
      mooringRequired: false,
      diveOperatorRequired: false,
      dayUseOnly: false,
      noWake: true
    },
    prohibitedActivities: [
      'Anchoring',
      'All fishing',
      'Spearfishing'
    ],
    allowedActivities: [
      'Transit through channel',
      'Snorkeling',
      'Swimming'
    ],
    reason: 'Protected channel ecosystem connecting to mangrove and seagrass areas.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: false,
    notes: 'Important marine corridor. No anchoring or fishing.'
  },
  {
    id: 'south-sound-vg',
    name: 'South Sound',
    location: 'Virgin Gorda',
    coordinates: {
      lat: 18.4450,
      lng: -64.4000
    },
    radiusMeters: 500,
    sizeAcres: 312.8,
    type: 'fisheries_protected',
    dateEstablished: 2003,
    legalSource: 'Statutory Instrument No. 20 of 2003',
    restrictions: {
      noAnchoring: true,
      noFishing: true,
      noEntry: false,
      mooringRequired: false,
      diveOperatorRequired: false,
      dayUseOnly: false,
      noWake: true
    },
    prohibitedActivities: [
      'Anchoring',
      'All fishing',
      'Spearfishing',
      'Shell collection'
    ],
    allowedActivities: [
      'Snorkeling',
      'Swimming',
      'Kayaking'
    ],
    reason: 'Protected marine ecosystem on southern Virgin Gorda coast.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: false,
    notes: 'No anchoring or fishing allowed.'
  },
  {
    id: 'taylor-bay-vg',
    name: 'Taylor Bay',
    location: 'Virgin Gorda',
    coordinates: {
      lat: 18.4500,
      lng: -64.3850
    },
    radiusMeters: 600,
    sizeAcres: 647.9,
    type: 'fisheries_protected',
    dateEstablished: 2003,
    legalSource: 'Statutory Instrument No. 20 of 2003',
    restrictions: {
      noAnchoring: true,
      noFishing: true,
      noEntry: false,
      mooringRequired: false,
      diveOperatorRequired: false,
      dayUseOnly: false,
      noWake: true
    },
    prohibitedActivities: [
      'Anchoring',
      'All fishing',
      'Spearfishing'
    ],
    allowedActivities: [
      'Snorkeling',
      'Swimming',
      'Kayaking'
    ],
    reason: 'Large protected bay area with important marine habitat.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: false,
    notes: 'One of the larger FPAs at 647.9 acres.'
  },
  {
    id: 'the-sound-salt-island',
    name: 'The Sound',
    location: 'Salt Island',
    coordinates: {
      lat: 18.3950,
      lng: -64.5150
    },
    radiusMeters: 350,
    sizeAcres: 112.8,
    type: 'fisheries_protected',
    dateEstablished: 2003,
    legalSource: 'Statutory Instrument No. 20 of 2003',
    restrictions: {
      noAnchoring: true,
      noFishing: true,
      noEntry: false,
      mooringRequired: false,
      diveOperatorRequired: false,
      dayUseOnly: false,
      noWake: true
    },
    prohibitedActivities: [
      'Anchoring',
      'All fishing',
      'Spearfishing'
    ],
    allowedActivities: [
      'Snorkeling',
      'Diving',
      'Swimming'
    ],
    reason: 'Protected sound area near Salt Island with reef ecosystem.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: false,
    notes: 'Adjacent to RMS Rhone Marine Park.'
  },
  {
    id: 'the-sound-ginger',
    name: 'The Sound (including Wedgeo Bay)',
    location: 'Ginger Island',
    coordinates: {
      lat: 18.3790,
      lng: -64.4870
    },
    radiusMeters: 250,
    sizeAcres: 62.5,
    type: 'fisheries_protected',
    dateEstablished: 2003,
    legalSource: 'Statutory Instrument No. 20 of 2003',
    restrictions: {
      noAnchoring: true,
      noFishing: true,
      noEntry: false,
      mooringRequired: false,
      diveOperatorRequired: false,
      dayUseOnly: false,
      noWake: true
    },
    prohibitedActivities: [
      'Anchoring',
      'All fishing',
      'Spearfishing'
    ],
    allowedActivities: [
      'Snorkeling',
      'Diving',
      'Swimming'
    ],
    reason: 'Protected sound and bay area at Ginger Island.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: false,
    notes: 'Includes Wedgeo Bay.'
  },
  {
    id: 'dead-chest',
    name: 'Dead Chest',
    location: 'Within Wreck of the Rhone Marine Park',
    coordinates: {
      lat: 18.3700,
      lng: -64.5600
    },
    radiusMeters: 500,
    sizeAcres: 326.9,
    type: 'fisheries_protected',
    dateEstablished: 2003,
    legalSource: 'Statutory Instrument No. 20 of 2003',
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
      'All fishing',
      'Spearfishing',
      'Overnight mooring'
    ],
    allowedActivities: [
      'Diving from mooring',
      'Snorkeling',
      'Swimming'
    ],
    reason: 'Part of the Rhone Marine Park area. Historic Dead Chest Island referenced in "Fifteen men on a dead man\'s chest."',
    managingAuthority: 'BVI Conservation & Fisheries Department / NPT',
    permitRequired: true,
    notes: 'Day use only. Use mooring balls.'
  },
  {
    id: 'big-reef-peter',
    name: 'Big Reef',
    location: 'Peter Island',
    coordinates: {
      lat: 18.3480,
      lng: -64.5650
    },
    radiusMeters: 550,
    sizeAcres: 362.1,
    type: 'fisheries_protected',
    dateEstablished: 2003,
    legalSource: 'Statutory Instrument No. 20 of 2003',
    restrictions: {
      noAnchoring: true,
      noFishing: true,
      noEntry: false,
      mooringRequired: false,
      diveOperatorRequired: false,
      dayUseOnly: false,
      noWake: true
    },
    prohibitedActivities: [
      'Anchoring',
      'All fishing',
      'Spearfishing',
      'Shell collection'
    ],
    allowedActivities: [
      'Snorkeling',
      'Diving',
      'Swimming',
      'Photography'
    ],
    reason: 'Large reef system on the north side of Peter Island.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: false,
    notes: 'Excellent snorkeling and diving. No anchoring on reef.'
  },
  {
    id: 'green-cay-jvd',
    name: 'Green Cay',
    location: 'Jost Van Dyke',
    coordinates: {
      lat: 18.4530,
      lng: -64.7000
    },
    radiusMeters: 200,
    sizeAcres: 38.4,
    type: 'fisheries_protected',
    dateEstablished: 2003,
    legalSource: 'Statutory Instrument No. 20 of 2003',
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
      'All fishing',
      'Spearfishing'
    ],
    allowedActivities: [
      'Snorkeling from mooring',
      'Swimming',
      'Photography'
    ],
    reason: 'Small protected cay with pristine reef ecosystem.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: true,
    notes: 'Near Sandy Cay. Day use moorings available.'
  },
  {
    id: 'money-bay-norman',
    name: 'Money Bay',
    location: 'Norman Island',
    coordinates: {
      lat: 18.3200,
      lng: -64.5950
    },
    radiusMeters: 250,
    sizeAcres: 79.8,
    type: 'fisheries_protected',
    dateEstablished: 2003,
    legalSource: 'Statutory Instrument No. 20 of 2003',
    restrictions: {
      noAnchoring: true,
      noFishing: true,
      noEntry: false,
      mooringRequired: false,
      diveOperatorRequired: false,
      dayUseOnly: false,
      noWake: true
    },
    prohibitedActivities: [
      'Anchoring',
      'All fishing',
      'Spearfishing'
    ],
    allowedActivities: [
      'Snorkeling',
      'Swimming',
      'Kayaking'
    ],
    reason: 'Protected bay on the south side of Norman Island.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: false,
    notes: 'Quiet protected bay with good snorkeling.'
  },
  {
    id: 'santa-monica-rock',
    name: 'Santa Monica Rock',
    location: 'South West off Norman Island',
    coordinates: {
      lat: 18.3050,
      lng: -64.6250
    },
    radiusMeters: 100,
    sizeAcres: 10.4,
    type: 'fisheries_protected',
    dateEstablished: 2003,
    legalSource: 'Statutory Instrument No. 20 of 2003',
    restrictions: {
      noAnchoring: true,
      noFishing: true,
      noEntry: false,
      mooringRequired: false,
      diveOperatorRequired: true,
      dayUseOnly: true,
      noWake: true
    },
    prohibitedActivities: [
      'Anchoring',
      'All fishing',
      'Spearfishing',
      'Unaccompanied diving'
    ],
    allowedActivities: [
      'Diving with operator',
      'Photography'
    ],
    reason: 'Submerged rock formation with diverse marine life. Advanced dive site.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: true,
    notes: 'Advanced dive site. Strong currents. Dive operator recommended.'
  },
  {
    id: 'north-bay-guana',
    name: 'North Bay',
    location: 'Guana Island',
    coordinates: {
      lat: 18.5050,
      lng: -64.6280
    },
    radiusMeters: 250,
    sizeAcres: 70.7,
    type: 'fisheries_protected',
    dateEstablished: 2003,
    legalSource: 'Statutory Instrument No. 20 of 2003',
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
      'All fishing',
      'Spearfishing',
      'Overnight mooring'
    ],
    allowedActivities: [
      'Snorkeling from mooring',
      'Swimming',
      'Photography'
    ],
    reason: 'Protected bay on north side of Guana Island with healthy reef.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: true,
    notes: 'Popular snorkeling spot. Use mooring balls only.'
  },
  {
    id: 'frenchmans-cay',
    name: "Frenchman's Cay",
    location: 'West End, Tortola',
    coordinates: {
      lat: 18.4100,
      lng: -64.6600
    },
    radiusMeters: 150,
    sizeAcres: 23.5,
    type: 'fisheries_protected',
    dateEstablished: 2003,
    legalSource: 'Statutory Instrument No. 20 of 2003',
    restrictions: {
      noAnchoring: true,
      noFishing: true,
      noEntry: false,
      mooringRequired: false,
      diveOperatorRequired: false,
      dayUseOnly: false,
      noWake: true
    },
    prohibitedActivities: [
      'Anchoring',
      'All fishing',
      'Spearfishing'
    ],
    allowedActivities: [
      'Snorkeling',
      'Swimming',
      'Kayaking'
    ],
    reason: 'Small protected area near Soper\'s Hole.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: false,
    notes: 'Near popular West End anchorage.'
  },

  // ==========================================
  // FISHERY PRIORITY AREAS (Recreational Activities Allowed)
  // These areas have management focus but allow recreational fishing with limits
  // ==========================================
  {
    id: 'great-camanoe-priority',
    name: 'Great Camanoe',
    location: 'Great Camanoe Island',
    coordinates: {
      lat: 18.4850,
      lng: -64.5600
    },
    radiusMeters: 500,
    type: 'fisheries_priority',
    restrictions: {
      noAnchoring: false,
      noFishing: false,
      noEntry: false,
      mooringRequired: false,
      diveOperatorRequired: false,
      dayUseOnly: false,
      noWake: false
    },
    prohibitedActivities: [
      'Commercial fish traps',
      'Net fishing',
      'Spearfishing near coral'
    ],
    allowedActivities: [
      'Recreational fishing (with limits)',
      'Anchoring in sandy areas',
      'Snorkeling',
      'Diving',
      'Swimming'
    ],
    reason: 'Priority management area for sustainable fishing. Recreational activities permitted with restrictions.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: false,
    notes: 'Fishing catch limits apply. Avoid anchoring on coral.'
  },
  {
    id: 'west-guana-priority',
    name: 'West Guana Island',
    location: 'Guana Island',
    coordinates: {
      lat: 18.4980,
      lng: -64.6450
    },
    radiusMeters: 400,
    type: 'fisheries_priority',
    restrictions: {
      noAnchoring: false,
      noFishing: false,
      noEntry: false,
      mooringRequired: false,
      diveOperatorRequired: false,
      dayUseOnly: false,
      noWake: false
    },
    prohibitedActivities: [
      'Commercial fishing',
      'Net fishing',
      'Fish traps'
    ],
    allowedActivities: [
      'Recreational fishing (with limits)',
      'Anchoring',
      'Snorkeling',
      'Diving',
      'Swimming'
    ],
    reason: 'Priority management area on west side of Guana Island.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: false,
    notes: 'Catch limits apply.'
  },
  {
    id: 'benures-bay-priority',
    name: 'Benures Bay',
    location: 'Norman Island',
    coordinates: {
      lat: 18.3280,
      lng: -64.6050
    },
    radiusMeters: 300,
    type: 'fisheries_priority',
    restrictions: {
      noAnchoring: false,
      noFishing: false,
      noEntry: false,
      mooringRequired: false,
      diveOperatorRequired: false,
      dayUseOnly: false,
      noWake: false
    },
    prohibitedActivities: [
      'Commercial fishing',
      'Net fishing'
    ],
    allowedActivities: [
      'Recreational fishing (with limits)',
      'Anchoring',
      'Snorkeling',
      'Swimming',
      'Kayaking'
    ],
    reason: 'Priority management bay on north side of Norman Island.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: false,
    notes: 'Popular anchorage with managed fishing.'
  },
  {
    id: 'the-bight-norman-priority',
    name: 'The Bight',
    location: 'Norman Island',
    coordinates: {
      lat: 18.3250,
      lng: -64.6150
    },
    radiusMeters: 400,
    type: 'fisheries_priority',
    restrictions: {
      noAnchoring: false,
      noFishing: false,
      noEntry: false,
      mooringRequired: false,
      diveOperatorRequired: false,
      dayUseOnly: false,
      noWake: false
    },
    prohibitedActivities: [
      'Commercial fishing',
      'Anchoring on coral'
    ],
    allowedActivities: [
      'Recreational fishing (with limits)',
      'Anchoring in designated areas',
      'Snorkeling',
      'Diving',
      'Swimming',
      'Visiting Willy T\'s'
    ],
    reason: 'Popular anchorage and priority management area. Home to the famous Willy T floating bar.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: false,
    notes: 'Very popular cruising destination. Moorings available. Respect fishing limits.'
  },
  {
    id: 'soldier-bay-priority',
    name: 'Soldier Bay',
    location: 'Norman Island',
    coordinates: {
      lat: 18.3300,
      lng: -64.6100
    },
    radiusMeters: 250,
    type: 'fisheries_priority',
    restrictions: {
      noAnchoring: false,
      noFishing: false,
      noEntry: false,
      mooringRequired: false,
      diveOperatorRequired: false,
      dayUseOnly: false,
      noWake: false
    },
    prohibitedActivities: [
      'Commercial fishing',
      'Net fishing'
    ],
    allowedActivities: [
      'Recreational fishing (with limits)',
      'Anchoring',
      'Snorkeling',
      'Swimming'
    ],
    reason: 'Priority management bay on Norman Island.',
    managingAuthority: 'BVI Conservation & Fisheries Department',
    permitRequired: false,
    notes: 'Catch limits apply.'
  },

  // ==========================================
  // BIRD SANCTUARIES (20 locations from 1959/1977)
  // Source: Bird Sanctuaries Order (S.R.O. 20/1959), S.R.O. 24/1977
  // ==========================================
  {
    id: 'cockroach-island-sanctuary',
    name: 'Cockroach Island Bird Sanctuary',
    location: 'Near Virgin Gorda',
    coordinates: {
      lat: 18.4950,
      lng: -64.3320
    },
    radiusMeters: 200,
    type: 'bird_sanctuary',
    dateEstablished: 1959,
    legalSource: 'S.R.O. 20/1959',
    restrictions: {
      noAnchoring: false,
      noFishing: false,
      noEntry: true,
      mooringRequired: false,
      diveOperatorRequired: false,
      dayUseOnly: true,
      noWake: true
    },
    prohibitedActivities: [
      'Landing on island',
      'Disturbing wildlife',
      'Loud noises',
      'Hunting'
    ],
    allowedActivities: [
      'Viewing from boat',
      'Photography from distance'
    ],
    reason: 'Protected seabird nesting habitat.',
    managingAuthority: 'BVI National Parks Trust',
    permitRequired: false,
    notes: 'No landing. View birds from boat only.'
  },
  {
    id: 'west-dog-sanctuary',
    name: 'West Dog Island Bird Sanctuary',
    location: 'The Dogs',
    coordinates: {
      lat: 18.4833,
      lng: -64.4667
    },
    radiusMeters: 300,
    type: 'bird_sanctuary',
    dateEstablished: 1959,
    legalSource: 'S.R.O. 20/1959',
    restrictions: {
      noAnchoring: true,
      noFishing: true,
      noEntry: true,
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
    id: 'great-tobago-sanctuary',
    name: 'Great Tobago Island Bird Sanctuary',
    location: 'Near Jost Van Dyke',
    coordinates: {
      lat: 18.4720,
      lng: -64.7800
    },
    radiusMeters: 300,
    type: 'bird_sanctuary',
    dateEstablished: 1959,
    legalSource: 'S.R.O. 20/1959',
    restrictions: {
      noAnchoring: false,
      noFishing: false,
      noEntry: true,
      mooringRequired: false,
      diveOperatorRequired: false,
      dayUseOnly: true,
      noWake: true
    },
    prohibitedActivities: [
      'Landing on island',
      'Disturbing wildlife'
    ],
    allowedActivities: [
      'Viewing from boat',
      'Photography from distance',
      'Snorkeling nearby'
    ],
    reason: 'Protected seabird nesting habitat.',
    managingAuthority: 'BVI National Parks Trust',
    permitRequired: false,
    notes: 'No landing permitted.'
  },
  {
    id: 'little-tobago-sanctuary',
    name: 'Little Tobago Island Bird Sanctuary',
    location: 'Near Jost Van Dyke',
    coordinates: {
      lat: 18.4700,
      lng: -64.7700
    },
    radiusMeters: 200,
    type: 'bird_sanctuary',
    dateEstablished: 1959,
    legalSource: 'S.R.O. 20/1959',
    restrictions: {
      noAnchoring: false,
      noFishing: false,
      noEntry: true,
      mooringRequired: false,
      diveOperatorRequired: false,
      dayUseOnly: true,
      noWake: true
    },
    prohibitedActivities: [
      'Landing on island',
      'Disturbing wildlife'
    ],
    allowedActivities: [
      'Viewing from boat',
      'Photography from distance'
    ],
    reason: 'Protected seabird nesting habitat.',
    managingAuthority: 'BVI National Parks Trust',
    permitRequired: false,
    notes: 'No landing permitted.'
  },
  {
    id: 'flamingo-pond-sanctuary',
    name: 'Flamingo Pond Bird Sanctuary',
    location: 'Anegada',
    coordinates: {
      lat: 18.7350,
      lng: -64.3600
    },
    radiusMeters: 500,
    type: 'bird_sanctuary',
    dateEstablished: 1977,
    legalSource: 'S.R.O. 24/1977',
    restrictions: {
      noAnchoring: false,
      noFishing: false,
      noEntry: false,
      mooringRequired: false,
      diveOperatorRequired: false,
      dayUseOnly: true,
      noWake: false
    },
    prohibitedActivities: [
      'Disturbing flamingos',
      'Approaching closer than 100 meters',
      'Loud noises',
      'Hunting'
    ],
    allowedActivities: [
      'Bird watching from designated areas',
      'Photography from distance'
    ],
    reason: 'Critical habitat for the Caribbean Flamingo population in the BVI. Ramsar wetland site.',
    managingAuthority: 'BVI National Parks Trust',
    permitRequired: false,
    notes: 'Best viewing in early morning. Maintain distance from flamingos.'
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
    radiusMeters: 50000,
    type: 'fisheries_protected',
    restrictions: {
      noAnchoring: false,
      noFishing: false,
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
    return month >= startMonth || month <= endMonth;
  });
};

export const getFisheryProtectedAreas = () => {
  return BVI_RESTRICTED_AREAS.filter(area => area.type === 'fisheries_protected');
};

export const getFisheryPriorityAreas = () => {
  return BVI_RESTRICTED_AREAS.filter(area => area.type === 'fisheries_priority');
};

export const getBirdSanctuaries = () => {
  return BVI_RESTRICTED_AREAS.filter(area => area.type === 'bird_sanctuary');
};

export const getActiveClosedSeasons = (month: number) => {
  return BVI_CLOSED_SEASONS.filter(season => {
    if (season.startMonth <= season.endMonth) {
      return month >= season.startMonth && month <= season.endMonth;
    }
    return month >= season.startMonth || month <= season.endMonth;
  });
};

export const isSpeciesProtected = (speciesId: string): boolean => {
  const season = BVI_CLOSED_SEASONS.find(s => s.id === speciesId);
  if (!season) return false;
  return season.startMonth === 1 && season.endMonth === 12;
};
