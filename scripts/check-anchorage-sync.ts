import { BVI_ANCHORAGES } from '../src/lib/constants';
import { anchoragesData } from '../src/data/anchorages';

const TOLERANCE = 0.001; // ~100m

// Full mapping of Explore names to Connect IDs for all entries that exist in both datasets
const EXPLORE_TO_CONNECT_ID: Record<string, string> = {
  // Norman Island
  "The Bight at Norman Island": "the-bight",
  "Benures Bay": "benures-bay",
  "Privateer Bay": "privateer-bay",
  // Tortola
  "Road Town, Tortola": "road-town",
  "Nanny Cay, Tortola": "nanny-cay",
  "Soper's Hole, Tortola": "sopers-hole",
  "Cane Garden Bay, Tortola": "cane-garden-bay",
  "Brandywine Bay, Tortola": "brandywine-bay",
  "Hodges Creek, Tortola": "hodges-creek",
  "Maya Cove, Tortola": "maya-cove",
  "Trellis Bay, Tortola": "trellis-bay",
  "Fat Hogs Bay, Tortola": "fat-hogs-bay",
  "Brewers Bay, Tortola": "brewers-bay",
  "Long Bay West, Tortola": "long-bay-west",
  "Sea Cow Bay, Tortola": "sea-cow-bay",
  "Beef Island Bluff, Tortola": "beef-island-bluff",
  "Paraquita Bay, Tortola": "paraquita-bay",
  "Frenchman's Cay, Tortola": "frenchmans-cay",
  // Virgin Gorda
  "Virgin Gorda Yacht Harbour": "spanish-town",
  "Leverick Bay, Virgin Gorda": "leverick-bay",
  "Gun Creek, Virgin Gorda": "gun-creek",
  "North Sound, Virgin Gorda": "north-sound",
  "Savannah Bay, Virgin Gorda": "savannah-bay",
  "Pond Bay, Virgin Gorda": "pond-bay",
  "Mountain Point, Virgin Gorda": "mountain-point-vg",
  "Bitter End, Virgin Gorda": "bitter-end",
  "Biras Creek, Virgin Gorda": "biras-creek",
  "Saba Rock, Virgin Gorda": "saba-rock",
  "Oil Nut Bay, Virgin Gorda": "oil-nut-bay",
  "Berchers Bay, Virgin Gorda": "berchers-bay",
  "Valley Trunk Bay, Virgin Gorda": "valley-trunk-bay",
  // Jost Van Dyke
  "Great Harbour, Jost Van Dyke": "great-harbour-jvd",
  "White Bay, Jost Van Dyke": "white-bay-jvd",
  "Little Harbour, Jost Van Dyke": "little-harbour-jvd",
  "Diamond Cay, Jost Van Dyke": "diamond-cay",
  // Peter Island
  "Great Harbour, Peter Island": "great-harbour-pi",
  "Deadman's Bay, Peter Island": "deadmans-bay",
  "Little Harbour, Peter Island": "little-harbour-pi",
  "Sprat Bay, Peter Island": "sprat-bay",
  // Cooper Island
  "Cooper Island": "manchioneel-bay",
  // Salt Island
  "Salt Island Anchorage": "salt-pond-bay",
  // Anegada
  "Anegada Settlement": "setting-point",
  "Pomato Point, Anegada": "pomato-point",
  // Other Cays & Islands
  "Marina Cay": "marina-cay",
  "Scrub Island": "scrub-island",
  "Monkey Point, Guana Island": "guana-island-monkey-point",
  "White Bay, Guana Island": "guana-island-white-bay",
  "Mosquito Island": "mosquito-island",
  "Prickly Pear Island": "prickly-pear",
};

// Entries that intentionally exist in only one dataset
const INTENTIONAL_NON_OVERLAPS = {
  exploreOnly: [
    "The Indians",                    // Day-use dive site, no Connect counterpart
    "The Caves, Norman Island",       // Day-use snorkel site, removed from Connect
    "The Baths, Virgin Gorda",        // Day-use mooring, removed from Connect
    "Sandy Cay",                      // Day-use only, removed from Connect
    "Sandy Spit",                     // Day-use only, removed from Connect
    "West End, Tortola",              // Ferry port edge case, removed from Connect
    "East End, Tortola",              // Edge case, removed from Connect
    "Buck Island, Tortola",           // Day stop, removed from Connect
    "Cistern Point, Cooper Island",   // Redundant with Cooper Island, removed from Connect
    "Loblolly Bay, Anegada",          // Day-use beach, removed from Connect
    "Cow Wreck Bay, Anegada",         // Day-use beach, removed from Connect
    "Lee Bay, Great Camanoe",         // Broken coords, removed from Connect pending re-add
    "The Dogs",                       // Day-use dive site, removed from Connect
    "Eustatia Island",                // Private/restricted, removed from Connect
    "Necker Island",                  // Private/restricted, removed from Connect
  ],
  connectOnly: [] as string[],
};

let failures = 0;

// 1. Coordinate sync check for all overlapping entries
for (const [exploreName, connectId] of Object.entries(EXPLORE_TO_CONNECT_ID)) {
  const explore = anchoragesData.find(a => a.name === exploreName);
  const connect = BVI_ANCHORAGES.find(a => a.id === connectId);

  if (!explore) {
    console.error(`MISSING Explore entry: "${exploreName}"`);
    failures++;
    continue;
  }
  if (!connect) {
    console.error(`MISSING Connect entry: "${connectId}"`);
    failures++;
    continue;
  }

  const latDiff = Math.abs(explore.latitude - connect.lat);
  const lngDiff = Math.abs(explore.longitude - connect.lng);

  if (latDiff > TOLERANCE || lngDiff > TOLERANCE) {
    console.error(
      `DRIFT: "${exploreName}" ↔ "${connectId}" — ` +
      `Explore(${explore.latitude}, ${explore.longitude}) vs ` +
      `Connect(${connect.lat}, ${connect.lng}) — ` +
      `Δlat=${latDiff.toFixed(4)} Δlng=${lngDiff.toFixed(4)}`
    );
    failures++;
  }
}

// 2. Validate the-bight coordinates (used to derive DEFAULT_BVI_LOCATION)
const theBight = BVI_ANCHORAGES.find(a => a.id === "the-bight");
if (!theBight) {
  console.error("CRITICAL: the-bight missing from BVI_ANCHORAGES");
  failures++;
} else if (
  Math.abs(theBight.lat - 18.3166) > TOLERANCE ||
  Math.abs(theBight.lng - (-64.6193)) > TOLERANCE
) {
  console.error(
    `DRIFT: the-bight coordinates changed — ` +
    `expected ~(18.3166, -64.6193), got (${theBight.lat}, ${theBight.lng}). ` +
    `This affects DEFAULT_BVI_LOCATION in checkins/route.ts.`
  );
  failures++;
}

// 3. Verify all intentional non-overlaps actually exist where claimed
for (const name of INTENTIONAL_NON_OVERLAPS.exploreOnly) {
  if (!anchoragesData.find(a => a.name === name)) {
    console.error(`MISSING: "${name}" claimed as exploreOnly but not found in anchoragesData`);
    failures++;
  }
}
for (const id of INTENTIONAL_NON_OVERLAPS.connectOnly) {
  if (!BVI_ANCHORAGES.find(a => a.id === id)) {
    console.error(`MISSING: "${id}" claimed as connectOnly but not found in BVI_ANCHORAGES`);
    failures++;
  }
}

// 4. Coverage check: every Connect entry should be in the mapping or connectOnly
for (const connect of BVI_ANCHORAGES) {
  const inMapping = Object.values(EXPLORE_TO_CONNECT_ID).includes(connect.id);
  const inConnectOnly = INTENTIONAL_NON_OVERLAPS.connectOnly.includes(connect.id);
  if (!inMapping && !inConnectOnly) {
    console.error(`UNMAPPED Connect entry: "${connect.id}" — add to EXPLORE_TO_CONNECT_ID or connectOnly`);
    failures++;
  }
}

// 5. Coverage check: every Explore entry should be in the mapping or exploreOnly
for (const explore of anchoragesData) {
  const inMapping = Object.keys(EXPLORE_TO_CONNECT_ID).includes(explore.name);
  const inExploreOnly = INTENTIONAL_NON_OVERLAPS.exploreOnly.includes(explore.name);
  if (!inMapping && !inExploreOnly) {
    console.error(`UNMAPPED Explore entry: "${explore.name}" — add to EXPLORE_TO_CONNECT_ID or exploreOnly`);
    failures++;
  }
}

// 6. Data quality: BVI bounding box (lat 18.2-18.8, lng -65.1 to -64.2)
const BVI_BOUNDS = { minLat: 18.2, maxLat: 18.8, minLng: -65.1, maxLng: -64.2 };

for (const a of anchoragesData) {
  if (a.latitude < BVI_BOUNDS.minLat || a.latitude > BVI_BOUNDS.maxLat ||
      a.longitude < BVI_BOUNDS.minLng || a.longitude > BVI_BOUNDS.maxLng) {
    console.error(`OUT OF BOUNDS (Explore): "${a.name}" at (${a.latitude}, ${a.longitude})`);
    failures++;
  }
}
for (const a of BVI_ANCHORAGES) {
  if (a.lat < BVI_BOUNDS.minLat || a.lat > BVI_BOUNDS.maxLat ||
      a.lng < BVI_BOUNDS.minLng || a.lng > BVI_BOUNDS.maxLng) {
    console.error(`OUT OF BOUNDS (Connect): "${a.id}" at (${a.lat}, ${a.lng})`);
    failures++;
  }
}

// 7. Data quality: no duplicate names within same island (Explore)
const nameIslandPairs = new Map<string, string>();
for (const a of anchoragesData) {
  const key = `${a.name}|${a.island}`;
  if (nameIslandPairs.has(key)) {
    console.error(`DUPLICATE: "${a.name}" on "${a.island}" appears more than once in Explore`);
    failures++;
  }
  nameIslandPairs.set(key, a.name);
}

// 8. Data quality: required fields non-empty (Explore)
for (const a of anchoragesData) {
  if (!a.name) { console.error(`EMPTY name in Explore entry`); failures++; }
  if (!a.description) { console.error(`EMPTY description for "${a.name}"`); failures++; }
  if (!a.island) { console.error(`EMPTY island for "${a.name}"`); failures++; }
  if (!a.depth) { console.error(`EMPTY depth for "${a.name}"`); failures++; }
  if (!a.holding) { console.error(`EMPTY holding for "${a.name}"`); failures++; }
  if (!a.protection) { console.error(`EMPTY protection for "${a.name}"`); failures++; }
}

if (failures > 0) {
  console.error(`\n✗ ${failures} sync/quality issue(s) found.`);
  process.exit(1);
} else {
  const overlapCount = Object.keys(EXPLORE_TO_CONNECT_ID).length;
  const exploreCount = anchoragesData.length;
  const connectCount = BVI_ANCHORAGES.length;
  console.log(
    `✓ ${overlapCount} coordinate pairs in sync. ` +
    `${exploreCount} Explore entries, ${connectCount} Connect entries. ` +
    `the-bight validated. All quality checks passed.`
  );
  process.exit(0);
}
