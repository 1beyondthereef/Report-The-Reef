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

// BVI Anchorages for check-in system
export const BVI_ANCHORAGES = [
  { id: "bight-norman", name: "The Bight, Norman Island", lat: 18.3186, lng: -64.6189 },
  { id: "great-harbour-jvd", name: "Great Harbour, Jost Van Dyke", lat: 18.4367, lng: -64.7528 },
  { id: "cane-garden-bay", name: "Cane Garden Bay, Tortola", lat: 18.4289, lng: -64.6481 },
  { id: "the-baths", name: "The Baths, Virgin Gorda", lat: 18.4283, lng: -64.4472 },
  { id: "anegada-setting-point", name: "Setting Point, Anegada", lat: 18.7267, lng: -64.3333 },
  { id: "sopers-hole", name: "Soper's Hole, Tortola", lat: 18.3897, lng: -64.7039 },
  { id: "road-town", name: "Road Town, Tortola", lat: 18.4267, lng: -64.6200 },
  { id: "trellis-bay", name: "Trellis Bay, Beef Island", lat: 18.4478, lng: -64.5317 },
  { id: "cooper-island", name: "Cooper Island", lat: 18.3894, lng: -64.5119 },
  { id: "salt-island", name: "Salt Island", lat: 18.3722, lng: -64.5256 },
  { id: "peter-island", name: "Peter Island", lat: 18.3511, lng: -64.5789 },
  { id: "white-bay-jvd", name: "White Bay, Jost Van Dyke", lat: 18.4397, lng: -64.7614 },
  { id: "diamond-cay-jvd", name: "Diamond Cay, Jost Van Dyke", lat: 18.4528, lng: -64.7711 },
  { id: "sandy-spit", name: "Sandy Spit", lat: 18.4489, lng: -64.7517 },
  { id: "north-sound-vg", name: "North Sound, Virgin Gorda", lat: 18.5072, lng: -64.3833 },
  { id: "spanish-town-vg", name: "Spanish Town, Virgin Gorda", lat: 18.4456, lng: -64.4319 },
  { id: "leverick-bay", name: "Leverick Bay, Virgin Gorda", lat: 18.4922, lng: -64.3928 },
  { id: "bitter-end", name: "Bitter End, Virgin Gorda", lat: 18.5139, lng: -64.3556 },
  { id: "marina-cay", name: "Marina Cay", lat: 18.4539, lng: -64.5158 },
  { id: "manchioneel-bay", name: "Manchioneel Bay, Cooper Island", lat: 18.3861, lng: -64.5097 },
  { id: "deadmans-bay-pi", name: "Deadman's Bay, Peter Island", lat: 18.3572, lng: -64.5708 },
  { id: "little-harbour-pi", name: "Little Harbour, Peter Island", lat: 18.3519, lng: -64.5986 },
  { id: "brandywine-bay", name: "Brandywine Bay, Tortola", lat: 18.4067, lng: -64.5719 },
  { id: "nanny-cay", name: "Nanny Cay, Tortola", lat: 18.3928, lng: -64.6339 },
  { id: "west-end-tortola", name: "West End, Tortola", lat: 18.3867, lng: -64.7014 },
  { id: "little-jost", name: "Little Jost Van Dyke", lat: 18.4631, lng: -64.7567 },
  { id: "guana-island", name: "Guana Island", lat: 18.4828, lng: -64.5736 },
  { id: "scrub-island", name: "Scrub Island", lat: 18.4622, lng: -64.5028 },
] as const;

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
