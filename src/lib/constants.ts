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
  EXPIRY_HOURS: 48,
  VERIFICATION_INTERVAL_HOURS: 6,
  MAX_DISTANCE_FROM_ANCHORAGE_KM: 5, // Max distance to suggest an anchorage
} as const;

// BVI Anchorages for check-in system - 43 overnight-eligible locations organized by island
// Coordinate confidence varies across entries; validate updates with `npm run check:anchorages` and planned chart/map review
// Some of these locations overlap with src/data/anchorages.ts (Explore page).
// Run `npm run check:anchorages` to verify coordinates stay in sync.
export const BVI_ANCHORAGES = [
  // TORTOLA (12 locations)
  { id: "road-town", name: "Road Town", island: "Tortola", lat: 18.4235, lng: -64.6165 },
  { id: "nanny-cay", name: "Nanny Cay", island: "Tortola", lat: 18.3960, lng: -64.6360 },
  { id: "sopers-hole", name: "Soper's Hole", island: "Tortola", lat: 18.3857, lng: -64.7040 },
  { id: "cane-garden-bay", name: "Cane Garden Bay", island: "Tortola", lat: 18.4276, lng: -64.6596 },
  { id: "brandywine-bay", name: "Brandywine Bay", island: "Tortola", lat: 18.4136, lng: -64.5809 },
  { id: "hodges-creek", name: "Hodges Creek", island: "Tortola", lat: 18.4243, lng: -64.5658 },
  { id: "trellis-bay", name: "Trellis Bay", island: "Tortola", lat: 18.4469, lng: -64.5309 },
  { id: "fat-hogs-bay", name: "Fat Hogs Bay", island: "Tortola", lat: 18.4165, lng: -64.5395 },
  { id: "brewers-bay", name: "Brewers Bay", island: "Tortola", lat: 18.4460, lng: -64.6494 },
  { id: "sea-cow-bay", name: "Sea Cow Bay", island: "Tortola", lat: 18.4065, lng: -64.6145 },
  { id: "beef-island-bluff", name: "Beef Island Bluff", island: "Tortola", lat: 18.4307, lng: -64.5275 },
  { id: "frenchmans-cay", name: "Frenchman's Cay", island: "Tortola", lat: 18.3960, lng: -64.6910 },

  // VIRGIN GORDA (12 locations)
  { id: "spanish-town", name: "Spanish Town", island: "Virgin Gorda", lat: 18.4563, lng: -64.4422 },
  { id: "leverick-bay", name: "Leverick Bay", island: "Virgin Gorda", lat: 18.4995, lng: -64.3877 },
  { id: "gun-creek", name: "Gun Creek", island: "Virgin Gorda", lat: 18.4899, lng: -64.3825 },
  { id: "north-sound", name: "North Sound", island: "Virgin Gorda", lat: 18.5050, lng: -64.3800 },
  { id: "savannah-bay", name: "Savannah Bay", island: "Virgin Gorda", lat: 18.4660, lng: -64.4214 },
  { id: "pond-bay", name: "Pond Bay", island: "Virgin Gorda", lat: 18.4694, lng: -64.4156 },
  { id: "mountain-point-vg", name: "Mountain Point", island: "Virgin Gorda", lat: 18.4997, lng: -64.4114 },
  { id: "bitter-end", name: "Bitter End", island: "Virgin Gorda", lat: 18.4988, lng: -64.3596 },
  { id: "biras-creek", name: "Biras Creek", island: "Virgin Gorda", lat: 18.4929, lng: -64.3568 },
  { id: "saba-rock", name: "Saba Rock", island: "Virgin Gorda", lat: 18.5030, lng: -64.3589 },
  { id: "oil-nut-bay", name: "Oil Nut Bay", island: "Virgin Gorda", lat: 18.5000, lng: -64.3452 },
  { id: "valley-trunk-bay", name: "Valley Trunk Bay", island: "Virgin Gorda", lat: 18.4390, lng: -64.4444 },

  // JOST VAN DYKE (4 locations)
  { id: "great-harbour-jvd", name: "Great Harbour", island: "Jost Van Dyke", lat: 18.4418, lng: -64.7515 },
  { id: "white-bay-jvd", name: "White Bay", island: "Jost Van Dyke", lat: 18.4415, lng: -64.7603 },
  { id: "little-harbour-jvd", name: "Little Harbour", island: "Jost Van Dyke", lat: 18.4393, lng: -64.7299 },
  { id: "diamond-cay", name: "Diamond Cay", island: "Jost Van Dyke", lat: 18.4502, lng: -64.7238 },

  // NORMAN ISLAND (3 locations)
  { id: "the-bight", name: "The Bight", island: "Norman Island", lat: 18.3166, lng: -64.6193 },
  { id: "benures-bay", name: "Benures Bay", island: "Norman Island", lat: 18.3222, lng: -64.6081 },
  { id: "privateer-bay", name: "Privateer Bay", island: "Norman Island", lat: 18.3120, lng: -64.6247 },

  // PETER ISLAND (4 locations)
  { id: "great-harbour-pi", name: "Great Harbour", island: "Peter Island", lat: 18.3575, lng: -64.5857 },
  { id: "deadmans-bay", name: "Deadman's Bay", island: "Peter Island", lat: 18.3573, lng: -64.5707 },
  { id: "little-harbour-pi", name: "Little Harbour", island: "Peter Island", lat: 18.3542, lng: -64.6028 },
  { id: "sprat-bay", name: "Sprat Bay", island: "Peter Island", lat: 18.3576, lng: -64.5767 },

  // COOPER ISLAND (1 location)
  { id: "manchioneel-bay", name: "Manchioneel Bay", island: "Cooper Island", lat: 18.3853, lng: -64.5137 },

  // SALT ISLAND (1 location)
  { id: "salt-pond-bay", name: "Salt Island Anchorage", island: "Salt Island", lat: 18.3703, lng: -64.5342 },

  // ANEGADA (1 location)
  { id: "setting-point", name: "Setting Point", island: "Anegada", lat: 18.7232, lng: -64.3844 },

  // OTHER CAYS & GUANA ISLAND (5 locations)
  { id: "marina-cay", name: "Marina Cay", island: "Other Cays", lat: 18.4600, lng: -64.5283 },
  { id: "scrub-island", name: "Scrub Island", island: "Other Cays", lat: 18.4663, lng: -64.5249 },
  { id: "guana-island-monkey-point", name: "Monkey Point", island: "Guana Island", lat: 18.4641, lng: -64.5720 },
  { id: "guana-island-white-bay", name: "White Bay", island: "Guana Island", lat: 18.4726, lng: -64.5763 },
  { id: "prickly-pear", name: "Prickly Pear", island: "Other Cays", lat: 18.5047, lng: -64.3718 },
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
  { value: "sand_rock", label: "Sand/Rock" },
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

// File upload limits (centralized in upload-limits.ts)
export { MAX_UPLOAD_BYTES as MAX_FILE_SIZE } from "./upload-limits";
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
  { href: "/connect", label: "Connect", icon: "Users" },
] as const;
