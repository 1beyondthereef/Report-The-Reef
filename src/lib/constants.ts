// BVI Map Bounds
export const BVI_BOUNDS = {
  southwest: { lng: -64.85, lat: 18.25 },
  northeast: { lng: -64.20, lat: 18.75 },
  center: { lng: -64.64, lat: 18.4207 },
  zoom: 9,
} as const;

// Extended BVI bounds for check-in verification (slightly larger for GPS accuracy)
export const BVI_CHECKIN_BOUNDS = {
  minLat: 18.2,
  maxLat: 18.8,
  minLng: -65.1,
  maxLng: -64.2,
} as const;

// Check-in configuration
export const CHECKIN_CONFIG = {
  EXPIRY_HOURS: 8,
  VERIFICATION_INTERVAL_HOURS: 2,
  MAX_DISTANCE_FROM_ANCHORAGE_KM: 5, // Max distance to suggest an anchorage
} as const;

// BVI Anchorages for check-in system - Complete list of 59 locations organized by island
// All coordinates verified to be IN THE WATER of each anchorage/bay
export const BVI_ANCHORAGES = [
  // TORTOLA (17 locations)
  { id: "road-town", name: "Road Town", island: "Tortola", lat: 18.4235, lng: -64.6165 },
  { id: "nanny-cay", name: "Nanny Cay", island: "Tortola", lat: 18.3885, lng: -64.6345 },
  { id: "sopers-hole", name: "Soper's Hole", island: "Tortola", lat: 18.3910, lng: -64.6955 },
  { id: "cane-garden-bay", name: "Cane Garden Bay", island: "Tortola", lat: 18.4380, lng: -64.6490 },
  { id: "brandywine-bay", name: "Brandywine Bay", island: "Tortola", lat: 18.4045, lng: -64.5630 },
  { id: "hodges-creek", name: "Hodges Creek", island: "Tortola", lat: 18.4115, lng: -64.5345 },
  { id: "maya-cove", name: "Maya Cove", island: "Tortola", lat: 18.4060, lng: -64.5445 },
  { id: "trellis-bay", name: "Trellis Bay", island: "Tortola", lat: 18.4480, lng: -64.5340 },
  { id: "fat-hogs-bay", name: "Fat Hogs Bay", island: "Tortola", lat: 18.4165, lng: -64.5395 },
  { id: "brewers-bay", name: "Brewers Bay", island: "Tortola", lat: 18.4345, lng: -64.6685 },
  { id: "long-bay-west", name: "Long Bay West", island: "Tortola", lat: 18.3915, lng: -64.6810 },
  { id: "sea-cow-bay", name: "Sea Cow Bay", island: "Tortola", lat: 18.4065, lng: -64.6145 },
  { id: "west-end", name: "West End", island: "Tortola", lat: 18.3895, lng: -64.6985 },
  { id: "east-end", name: "East End", island: "Tortola", lat: 18.4510, lng: -64.5215 },
  { id: "paraquita-bay", name: "Paraquita Bay", island: "Tortola", lat: 18.4115, lng: -64.5660 },
  { id: "buck-island", name: "Buck Island", island: "Tortola", lat: 18.3720, lng: -64.5340 },
  { id: "frenchmans-cay", name: "Frenchman's Cay", island: "Tortola", lat: 18.3960, lng: -64.6910 },

  // VIRGIN GORDA (12 locations)
  { id: "the-baths", name: "The Baths", island: "Virgin Gorda", lat: 18.4285, lng: -64.3720 },
  { id: "spanish-town", name: "Spanish Town", island: "Virgin Gorda", lat: 18.4435, lng: -64.3755 },
  { id: "leverick-bay", name: "Leverick Bay", island: "Virgin Gorda", lat: 18.4935, lng: -64.3960 },
  { id: "gun-creek", name: "Gun Creek", island: "Virgin Gorda", lat: 18.4990, lng: -64.3985 },
  { id: "north-sound", name: "North Sound", island: "Virgin Gorda", lat: 18.5050, lng: -64.3800 },
  { id: "savannah-bay", name: "Savannah Bay", island: "Virgin Gorda", lat: 18.4620, lng: -64.3740 },
  { id: "pond-bay", name: "Pond Bay", island: "Virgin Gorda", lat: 18.4535, lng: -64.3735 },
  { id: "bitter-end", name: "Bitter End", island: "Virgin Gorda", lat: 18.5115, lng: -64.3620 },
  { id: "saba-rock", name: "Saba Rock", island: "Virgin Gorda", lat: 18.5005, lng: -64.3680 },
  { id: "oil-nut-bay", name: "Oil Nut Bay", island: "Virgin Gorda", lat: 18.5140, lng: -64.3465 },
  { id: "berchers-bay", name: "Berchers Bay", island: "Virgin Gorda", lat: 18.4690, lng: -64.3820 },
  { id: "valley-trunk-bay", name: "Valley Trunk Bay", island: "Virgin Gorda", lat: 18.4375, lng: -64.3775 },

  // JOST VAN DYKE (6 locations)
  { id: "great-harbour-jvd", name: "Great Harbour", island: "Jost Van Dyke", lat: 18.4400, lng: -64.7530 },
  { id: "white-bay-jvd", name: "White Bay", island: "Jost Van Dyke", lat: 18.4350, lng: -64.7610 },
  { id: "little-harbour-jvd", name: "Little Harbour", island: "Jost Van Dyke", lat: 18.4330, lng: -64.7190 },
  { id: "diamond-cay", name: "Diamond Cay", island: "Jost Van Dyke", lat: 18.4370, lng: -64.7140 },
  { id: "sandy-cay", name: "Sandy Cay", island: "Jost Van Dyke", lat: 18.4420, lng: -64.7100 },
  { id: "sandy-spit", name: "Sandy Spit", island: "Jost Van Dyke", lat: 18.4380, lng: -64.7150 },

  // NORMAN ISLAND (4 locations)
  { id: "the-bight", name: "The Bight", island: "Norman Island", lat: 18.3230, lng: -64.6215 },
  { id: "benures-bay", name: "Benures Bay", island: "Norman Island", lat: 18.3295, lng: -64.6040 },
  { id: "the-caves", name: "The Caves", island: "Norman Island", lat: 18.3185, lng: -64.6240 },
  { id: "privateer-bay", name: "Privateer Bay", island: "Norman Island", lat: 18.3270, lng: -64.5985 },

  // PETER ISLAND (4 locations)
  { id: "great-harbour-pi", name: "Great Harbour", island: "Peter Island", lat: 18.3635, lng: -64.5810 },
  { id: "deadmans-bay", name: "Deadman's Bay", island: "Peter Island", lat: 18.3680, lng: -64.5730 },
  { id: "little-harbour-pi", name: "Little Harbour", island: "Peter Island", lat: 18.3575, lng: -64.5615 },
  { id: "sprat-bay", name: "Sprat Bay", island: "Peter Island", lat: 18.3540, lng: -64.5670 },

  // COOPER ISLAND (2 locations)
  { id: "manchioneel-bay", name: "Manchioneel Bay", island: "Cooper Island", lat: 18.3895, lng: -64.5155 },
  { id: "cistern-point", name: "Cistern Point", island: "Cooper Island", lat: 18.3830, lng: -64.5110 },

  // SALT ISLAND (2 locations)
  { id: "salt-pond-bay", name: "Salt Pond Bay", island: "Salt Island", lat: 18.3970, lng: -64.5280 },
  { id: "lee-bay", name: "Lee Bay", island: "Salt Island", lat: 18.3920, lng: -64.5230 },

  // ANEGADA (4 locations)
  { id: "setting-point", name: "Setting Point", island: "Anegada", lat: 18.7250, lng: -64.3310 },
  { id: "pomato-point", name: "Pomato Point", island: "Anegada", lat: 18.7210, lng: -64.3560 },
  { id: "loblolly-bay", name: "Loblolly Bay", island: "Anegada", lat: 18.7485, lng: -64.3430 },
  { id: "cow-wreck-bay", name: "Cow Wreck Bay", island: "Anegada", lat: 18.7520, lng: -64.3580 },

  // OTHER CAYS (8 locations)
  { id: "marina-cay", name: "Marina Cay", island: "Other Cays", lat: 18.4535, lng: -64.5210 },
  { id: "scrub-island", name: "Scrub Island", island: "Other Cays", lat: 18.4685, lng: -64.5070 },
  { id: "guana-island", name: "Guana Island", island: "Other Cays", lat: 18.4810, lng: -64.5730 },
  { id: "the-dogs", name: "The Dogs", island: "Other Cays", lat: 18.4750, lng: -64.4500 },
  { id: "mosquito-island", name: "Mosquito Island", island: "Other Cays", lat: 18.5020, lng: -64.3870 },
  { id: "prickly-pear", name: "Prickly Pear", island: "Other Cays", lat: 18.5145, lng: -64.3845 },
  { id: "eustatia-island", name: "Eustatia Island", island: "Other Cays", lat: 18.5095, lng: -64.3615 },
  { id: "necker-island", name: "Necker Island", island: "Other Cays", lat: 18.5215, lng: -64.3565 },
] as const;

// Check-in visibility options
export const CHECKIN_VISIBILITY = {
  PUBLIC: "public",
  FRIENDS: "friends",
} as const;

// Auto-detect check-in radius (0.5 nautical miles in km)
export const AUTO_CHECKIN_RADIUS_KM = 0.926; // 0.5 nautical miles

// Mapbox style
export const MAPBOX_STYLE = "mapbox://styles/mapbox/outdoors-v12";

// Activity types for incident reports (matches Supabase activity_type column)
export const ACTIVITY_TYPES = [
  { value: "reef_damage", label: "Reef Damage", description: "Coral bleaching, anchor damage, or other reef harm" },
  { value: "pollution", label: "Pollution", description: "Oil spills, debris, or water contamination" },
  { value: "abandoned_fishing_gear", label: "Abandoned Fishing Gear", description: "Ghost nets, traps, lines, or other derelict fishing equipment" },
  { value: "wildlife", label: "Wildlife Concern", description: "Injured animals, nesting disruption, or poaching" },
  { value: "safety", label: "Safety Hazard", description: "Navigation hazards, unmarked obstacles, or dangerous conditions" },
  { value: "other", label: "Other", description: "Any other environmental or boating concern" },
] as const;

// Legacy alias for backwards compatibility
export const INCIDENT_CATEGORIES = ACTIVITY_TYPES;

// Wildlife species for megafauna reporting
export const WILDLIFE_SPECIES = [
  { value: "humpback_whale", label: "Humpback whale", scientific: "Megaptera novaeangliae" },
  { value: "bottlenose_dolphin", label: "Bottlenose dolphin", scientific: "Tursiops truncatus" },
  { value: "spinner_dolphin", label: "Spinner dolphin", scientific: "Stenella longirostris" },
  { value: "atlantic_spotted_dolphin", label: "Atlantic spotted dolphin", scientific: "Stenella frontalis" },
  { value: "clymene_dolphin", label: "Clymene dolphin", scientific: "Stenella clymene" },
  { value: "rough_toothed_dolphin", label: "Rough-toothed dolphin", scientific: "Steno bredanensis" },
  { value: "sperm_whale", label: "Sperm whale", scientific: "Physeter catodon" },
  { value: "cuviers_beaked_whale", label: "Cuvier's beaked whale", scientific: "Ziphius cavirostris" },
  { value: "dwarf_sperm_whale", label: "Dwarf sperm whale", scientific: "Kogia sima" },
  { value: "pygmy_sperm_whale", label: "Pygmy sperm whale", scientific: "Kogia breviceps" },
  { value: "west_indian_manatee", label: "West Indian manatee", scientific: "Trichechus manatus" },
  { value: "short_finned_pilot_whale", label: "Short-finned pilot whale", scientific: "Globicephala macrorhynchus" },
  { value: "tiger_shark", label: "Tiger shark", scientific: "Galeocerdo cuvier" },
  { value: "great_hammerhead", label: "Great hammerhead", scientific: "Sphyrna mokarran" },
  { value: "scalloped_hammerhead", label: "Scalloped hammerhead", scientific: "Sphyrna lewini" },
  { value: "unknown", label: "Unknown species", scientific: "" },
] as const;

// Number of individuals for wildlife sightings
export const WILDLIFE_COUNT = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6-10", label: "6-10" },
  { value: "11-20", label: "11-20" },
  { value: "20+", label: "20+" },
] as const;

// Incident severity levels
export const INCIDENT_SEVERITY = [
  { value: "low", label: "Low", color: "bg-green-500", description: "Minor issue, no immediate action needed" },
  { value: "medium", label: "Medium", color: "bg-yellow-500", description: "Moderate concern, should be addressed" },
  { value: "high", label: "High", color: "bg-orange-500", description: "Significant issue, needs prompt attention" },
  { value: "critical", label: "Critical", color: "bg-red-500", description: "Urgent, immediate action required" },
] as const;

// Incident status
export const INCIDENT_STATUS = [
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-500" },
  { value: "reviewed", label: "Reviewed", color: "bg-purple-500" },
  { value: "resolved", label: "Resolved", color: "bg-green-500" },
  { value: "dismissed", label: "Dismissed", color: "bg-gray-400" },
] as const;

// Reservation status
export const RESERVATION_STATUS = [
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "confirmed", label: "Confirmed", color: "bg-green-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
  { value: "completed", label: "Completed", color: "bg-gray-500" },
] as const;

// Payment status
export const PAYMENT_STATUS = [
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "paid", label: "Paid", color: "bg-green-500" },
  { value: "refunded", label: "Refunded", color: "bg-gray-500" },
] as const;

// BVI Islands
export const BVI_ISLANDS = [
  "Tortola",
  "Virgin Gorda",
  "Jost Van Dyke",
  "Anegada",
  "Peter Island",
  "Norman Island",
  "Cooper Island",
  "Salt Island",
  "Ginger Island",
  "Dead Chest",
  "Guana Island",
  "Great Camanoe",
  "Scrub Island",
  "Necker Island",
  "Mosquito Island",
  "Eustatia Island",
  "Saba Rock",
  "The Dogs",
  "Fallen Jerusalem",
  "Round Rock",
] as const;

// Anchorage amenities
export const ANCHORAGE_AMENITIES = [
  { value: "dinghy_dock", label: "Dinghy Dock" },
  { value: "restaurant", label: "Restaurant" },
  { value: "bar", label: "Bar" },
  { value: "fuel", label: "Fuel" },
  { value: "water", label: "Fresh Water" },
  { value: "ice", label: "Ice" },
  { value: "wifi", label: "WiFi" },
  { value: "showers", label: "Showers" },
  { value: "laundry", label: "Laundry" },
  { value: "provisions", label: "Provisions" },
  { value: "trash", label: "Trash Disposal" },
  { value: "snorkeling", label: "Snorkeling" },
  { value: "beach", label: "Beach Access" },
  { value: "hiking", label: "Hiking Trails" },
] as const;

// Holding types
export const HOLDING_TYPES = [
  { value: "sand", label: "Sand" },
  { value: "sand_mud", label: "Sand/Mud" },
  { value: "mud", label: "Mud" },
  { value: "grass", label: "Grass" },
  { value: "rocky", label: "Rocky" },
  { value: "coral", label: "Coral (avoid anchoring)" },
] as const;

// Protection levels
export const PROTECTION_LEVELS = [
  { value: "all_weather", label: "All Weather" },
  { value: "fair_weather", label: "Fair Weather Only" },
  { value: "ne_swell", label: "Protected from NE Swell" },
  { value: "se_swell", label: "Protected from SE Swell" },
  { value: "christmas_winds", label: "Christmas Winds Protected" },
] as const;

// User roles
export const USER_ROLES = [
  { value: "user", label: "User" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Administrator" },
] as const;

// Session duration
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const MAGIC_LINK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// File upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_PER_INCIDENT = 5;
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "video/mp4",
  "video/quicktime",
];

// Polling intervals
export const MESSAGE_POLL_INTERVAL = 5000; // 5 seconds
export const INCIDENT_POLL_INTERVAL = 30000; // 30 seconds

// Navigation items
export const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "Home" },
  { href: "/report", label: "Report", icon: "AlertTriangle" },
  { href: "/anchorages", label: "Anchorages", icon: "Anchor" },
  { href: "/moorings", label: "Moorings", icon: "Ship" },
  { href: "/connect", label: "Connect", icon: "Users" },
] as const;
