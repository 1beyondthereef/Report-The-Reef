// BVI Anchorages Seed Data
export interface AnchorageSeedData {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  island: string;
  depth: string;
  holding: string;
  protection: string;
  capacity: number;
  amenities: string[];
  images: string[];
  sensitiveHabitat: {
    hasReef: boolean;
    hasSeagrass: boolean;
    warning: string | null;
  };
  moorings: {
    name: string;
    maxLength: number;
    maxWeight: number | null;
    pricePerNight: number;
    notes: string | null;
  }[];
}

export const anchoragesData: AnchorageSeedData[] = [
  // ═══════════════════════════════════════
  // NORMAN ISLAND
  // ═══════════════════════════════════════
  {
    name: "The Bight at Norman Island",
    description: "The Bight is a spectacular, well-protected bay on the north side of Norman Island, rumored to be the inspiration for Robert Louis Stevenson's 'Treasure Island'. This popular anchorage offers excellent snorkeling at the famous caves on the western side, where you can explore underwater caverns teeming with marine life. The bay is home to the iconic Willie T floating bar and restaurant, as well as Pirates Bight beach bar and restaurant ashore.",
    latitude: 18.3166,
    longitude: -64.6193,
    island: "Norman Island",
    depth: "25-40ft",
    holding: "sand",
    protection: "all_weather",
    capacity: 50,
    amenities: ["restaurant", "bar", "dinghy_dock", "snorkeling", "trash"],
    images: [
      "/images/anchorages/norman-island-bight-1.jpg",
      "/images/anchorages/norman-island-bight-2.jpg",
      "/images/anchorages/norman-island-caves.jpg"
    ],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Coral reefs present near the caves and along the western shore. Please use mooring balls or anchor only in sandy areas to protect the reef."
    },
    moorings: [
      { name: "NI-01", maxLength: 60, maxWeight: 50000, pricePerNight: 35, notes: "Near Willie T" },
      { name: "NI-02", maxLength: 60, maxWeight: 50000, pricePerNight: 35, notes: "Near Willie T" },
      { name: "NI-03", maxLength: 50, maxWeight: 40000, pricePerNight: 30, notes: "Central bay" },
      { name: "NI-04", maxLength: 50, maxWeight: 40000, pricePerNight: 30, notes: "Central bay" },
      { name: "NI-05", maxLength: 45, maxWeight: 35000, pricePerNight: 30, notes: "Near beach" },
      { name: "NI-06", maxLength: 45, maxWeight: 35000, pricePerNight: 30, notes: "Near beach" },
      { name: "NI-07", maxLength: 40, maxWeight: 30000, pricePerNight: 25, notes: "Eastern side" },
      { name: "NI-08", maxLength: 40, maxWeight: 30000, pricePerNight: 25, notes: "Eastern side" }
    ]
  },
  {
    name: "Benures Bay",
    description: "Benures Bay is a quiet anchorage on the northeast side of Norman Island, offering a more secluded alternative to The Bight. The bay provides reasonable protection from the prevailing trade winds and features good snorkeling along the rocky shoreline. It is less crowded than The Bight and appeals to those seeking a peaceful night at anchor.",
    latitude: 18.3295,
    longitude: -64.6040,
    island: "Norman Island",
    depth: "20-35ft",
    holding: "sand_rock",
    protection: "fair_weather",
    capacity: 10,
    amenities: ["snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Rocky reef along shoreline. Anchor in sandy patches to avoid reef damage."
    },
    moorings: []
  },
  {
    name: "The Caves, Norman Island",
    description: "The Caves are a famous snorkeling destination on the western side of The Bight at Norman Island. Underwater caverns and overhangs teem with colorful fish, corals, and sponges. This is a day-use mooring area only; boats typically pick up a mooring ball for a few hours while passengers snorkel the caves, then move to The Bight or elsewhere for the night.",
    latitude: 18.3148,
    longitude: -64.6242,
    island: "Norman Island",
    depth: "15-30ft",
    holding: "rocky",
    protection: "fair_weather",
    capacity: 6,
    amenities: ["snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "PROTECTED SNORKEL SITE — Coral reefs throughout. Use mooring balls only; anchoring prohibited. No touching or standing on coral."
    },
    moorings: []
  },
  {
    name: "Privateer Bay",
    description: "Privateer Bay sits on the northeast coast of Norman Island and offers a remote, undeveloped anchorage. The bay is open to the east, making it best suited for settled conditions with light easterly winds. It appeals to experienced cruisers who want solitude and good snorkeling along the rocky headlands.",
    latitude: 18.3270,
    longitude: -64.5985,
    island: "Norman Island",
    depth: "20-40ft",
    holding: "sand_rock",
    protection: "fair_weather",
    capacity: 6,
    amenities: ["snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Rocky reef along the shore. Anchor in sand to protect coral."
    },
    moorings: []
  },
  {
    name: "The Indians",
    description: "The Indians are a cluster of four dramatic rock pinnacles rising from the sea between Norman Island and Pelican Island. This is one of the BVI's premier snorkeling and diving sites, featuring spectacular underwater scenery with caves, tunnels, and abundant marine life including colorful corals, tropical fish, and occasional sea turtles. This is a daytime-only stop; overnight anchoring is not permitted to protect the marine environment.",
    latitude: 18.3322,
    longitude: -64.6297,
    island: "The Indians",
    depth: "25-50ft",
    holding: "rocky",
    protection: "fair_weather",
    capacity: 8,
    amenities: ["snorkeling"],
    images: [
      "/images/anchorages/the-indians-1.jpg",
      "/images/anchorages/the-indians-2.jpg",
      "/images/anchorages/the-indians-underwater.jpg"
    ],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "PROTECTED MARINE AREA - This is a sensitive coral reef ecosystem. Anchoring is prohibited. Use mooring balls only. No touching or standing on coral. Daytime visits only."
    },
    moorings: [
      { name: "IN-01", maxLength: 50, maxWeight: 40000, pricePerNight: 25, notes: "Day use only - no overnight" },
      { name: "IN-02", maxLength: 50, maxWeight: 40000, pricePerNight: 25, notes: "Day use only - no overnight" },
      { name: "IN-03", maxLength: 45, maxWeight: 35000, pricePerNight: 25, notes: "Day use only - no overnight" },
      { name: "IN-04", maxLength: 45, maxWeight: 35000, pricePerNight: 25, notes: "Day use only - no overnight" }
    ]
  },

  // ═══════════════════════════════════════
  // TORTOLA
  // ═══════════════════════════════════════
  {
    name: "Road Town, Tortola",
    description: "Road Town is the capital of the British Virgin Islands and the commercial hub of Tortola. The harbor is home to several marinas including Village Cay and Wickham's Cay, offering full-service facilities. Provisioning, customs, restaurants, banks, and shops are all within walking distance. The anchorage can be busy with commercial and ferry traffic.",
    latitude: 18.4235,
    longitude: -64.6165,
    island: "Tortola",
    depth: "15-30ft",
    holding: "mud",
    protection: "all_weather",
    capacity: 40,
    amenities: ["restaurant", "bar", "dinghy_dock", "fuel", "water", "ice", "wifi", "showers", "laundry", "provisions", "trash", "customs"],
    images: [],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: false,
      warning: null
    },
    moorings: []
  },
  {
    name: "Nanny Cay, Tortola",
    description: "Nanny Cay is a full-service marina and boatyard on the south coast of Tortola, popular with both charter and private vessels. The marina offers haul-out facilities, a chandlery, fuel dock, restaurant, and pool. It is a convenient base for provisioning and boat maintenance, with a grocery store and several restaurants on site.",
    latitude: 18.3885,
    longitude: -64.6345,
    island: "Tortola",
    depth: "10-20ft",
    holding: "mud",
    protection: "all_weather",
    capacity: 25,
    amenities: ["restaurant", "bar", "dinghy_dock", "fuel", "water", "ice", "wifi", "showers", "laundry", "provisions", "trash"],
    images: [],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: true,
      warning: "Seagrass beds in the approach area. Follow marked channels."
    },
    moorings: []
  },
  {
    name: "Soper's Hole, Tortola",
    description: "Soper's Hole is a picturesque hurricane hole at the western tip of Tortola, offering excellent all-weather protection. The Soper's Hole Wharf & Marina features charming West Indian-style buildings painted in bright colors, housing boutiques, restaurants, and cafes. This is a popular stop for provisioning, with a well-stocked grocery store and marine supplies. The ferry to St. John, USVI departs from here.",
    latitude: 18.3857,
    longitude: -64.7040,
    island: "Tortola",
    depth: "20-40ft",
    holding: "mud",
    protection: "all_weather",
    capacity: 30,
    amenities: ["restaurant", "bar", "dinghy_dock", "fuel", "water", "ice", "wifi", "showers", "laundry", "provisions", "trash"],
    images: [
      "/images/anchorages/sopers-hole-1.jpg",
      "/images/anchorages/sopers-hole-2.jpg",
      "/images/anchorages/sopers-hole-wharf.jpg"
    ],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: false,
      warning: null
    },
    moorings: [
      { name: "SH-01", maxLength: 70, maxWeight: 60000, pricePerNight: 45, notes: "Near marina" },
      { name: "SH-02", maxLength: 70, maxWeight: 60000, pricePerNight: 45, notes: "Near marina" },
      { name: "SH-03", maxLength: 60, maxWeight: 50000, pricePerNight: 40, notes: "Central anchorage" },
      { name: "SH-04", maxLength: 60, maxWeight: 50000, pricePerNight: 40, notes: "Central anchorage" },
      { name: "SH-05", maxLength: 55, maxWeight: 45000, pricePerNight: 35, notes: "Inner harbor" },
      { name: "SH-06", maxLength: 55, maxWeight: 45000, pricePerNight: 35, notes: "Inner harbor" },
      { name: "SH-07", maxLength: 50, maxWeight: 40000, pricePerNight: 30, notes: "Outer anchorage" }
    ]
  },
  {
    name: "Cane Garden Bay, Tortola",
    description: "Cane Garden Bay is Tortola's most popular beach destination, offering a mile-long stretch of palm-lined white sand beach. This vibrant bay features numerous beach bars, restaurants, and water sports activities. The bay is famous for its sunset views and live music scene, with venues like Myett's and Quito's offering entertainment. The surrounding hills create a dramatic backdrop, and the bay is easily accessible from Road Town.",
    latitude: 18.4276,
    longitude: -64.6596,
    island: "Tortola",
    depth: "15-25ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 35,
    amenities: ["restaurant", "bar", "beach", "dinghy_dock", "water", "ice", "wifi", "showers", "provisions"],
    images: [
      "/images/anchorages/cane-garden-bay-1.jpg",
      "/images/anchorages/cane-garden-bay-2.jpg",
      "/images/anchorages/cane-garden-bay-sunset.jpg"
    ],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: true,
      warning: "Seagrass beds present throughout the bay. These are critical habitat for sea turtles. Please use mooring balls to avoid anchor damage."
    },
    moorings: [
      { name: "CG-01", maxLength: 55, maxWeight: 45000, pricePerNight: 30, notes: "Near Myett's" },
      { name: "CG-02", maxLength: 55, maxWeight: 45000, pricePerNight: 30, notes: "Near Myett's" },
      { name: "CG-03", maxLength: 50, maxWeight: 40000, pricePerNight: 30, notes: "Central bay" },
      { name: "CG-04", maxLength: 50, maxWeight: 40000, pricePerNight: 30, notes: "Central bay" },
      { name: "CG-05", maxLength: 45, maxWeight: 35000, pricePerNight: 25, notes: "Western end" },
      { name: "CG-06", maxLength: 45, maxWeight: 35000, pricePerNight: 25, notes: "Eastern end" }
    ]
  },
  {
    name: "Brandywine Bay, Tortola",
    description: "Brandywine Bay is a quiet anchorage on the south coast of Tortola, east of Road Town. The bay provides fair protection in normal trade wind conditions and is convenient for accessing the east end of Tortola. Brandywine Bay restaurant ashore is well-regarded for its Italian-inspired cuisine.",
    latitude: 18.4045,
    longitude: -64.5630,
    island: "Tortola",
    depth: "15-25ft",
    holding: "sand_mud",
    protection: "fair_weather",
    capacity: 10,
    amenities: ["restaurant"],
    images: [],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: true,
      warning: "Seagrass patches in parts of the bay. Anchor in sand where possible."
    },
    moorings: []
  },
  {
    name: "Hodges Creek, Tortola",
    description: "Hodges Creek is a small, well-protected harbor on the south coast of Tortola near the east end. The Hodges Creek Marina offers slips, fuel, and basic services. The harbor is surrounded by mangroves and offers good hurricane protection. It is a quieter alternative to the busier marinas further west.",
    latitude: 18.4115,
    longitude: -64.5345,
    island: "Tortola",
    depth: "8-15ft",
    holding: "mud",
    protection: "all_weather",
    capacity: 15,
    amenities: ["fuel", "water", "dinghy_dock"],
    images: [],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: true,
      warning: "Mangrove and seagrass habitat in the approach. Follow marked channel."
    },
    moorings: []
  },
  {
    name: "Maya Cove, Tortola",
    description: "Maya Cove is a small, sheltered bay on the south coast of Tortola near Fat Hogs Bay. It is home to a boatyard and offers a peaceful anchorage in calm conditions. The surrounding area has mangrove-lined shores and provides reasonable hurricane protection.",
    latitude: 18.4060,
    longitude: -64.5445,
    island: "Tortola",
    depth: "8-15ft",
    holding: "mud",
    protection: "all_weather",
    capacity: 8,
    amenities: [],
    images: [],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: true,
      warning: "Mangrove fringe and seagrass in the area. Anchor carefully to avoid habitat damage."
    },
    moorings: []
  },
  {
    name: "Trellis Bay, Tortola",
    description: "Trellis Bay is a popular anchorage on Beef Island, adjacent to the Terrance B. Lettsome International Airport. The bay is known for its monthly Full Moon parties, art installations on the beach, and the excellent Trellis Bay Market with food vendors and local crafts. Aragorn's Studio on the beach creates the famous fireballs used in the Full Moon celebrations. De Loose Mongoose bar and restaurant provides a lively waterfront vibe.",
    latitude: 18.4469,
    longitude: -64.5309,
    island: "Tortola",
    depth: "10-20ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 30,
    amenities: ["restaurant", "bar", "beach", "dinghy_dock", "wifi", "provisions"],
    images: [],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: true,
      warning: "Seagrass beds in the shallows. Use mooring balls where available."
    },
    moorings: []
  },
  {
    name: "Fat Hogs Bay, Tortola",
    description: "Fat Hogs Bay is a large harbor on the southeast coast of Tortola, hosting multiple marinas and boatyards including Penn's Landing Marina. The bay is a commercial hub for boat repairs, hauling, and long-term storage. Several marine supply stores and restaurants are located along the waterfront.",
    latitude: 18.4165,
    longitude: -64.5395,
    island: "Tortola",
    depth: "10-20ft",
    holding: "mud",
    protection: "all_weather",
    capacity: 20,
    amenities: ["restaurant", "dinghy_dock", "fuel", "water", "provisions"],
    images: [],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: false,
      warning: null
    },
    moorings: []
  },
  {
    name: "Brewers Bay, Tortola",
    description: "Brewers Bay is a scenic north-coast beach on Tortola, framed by steep green hills. The bay features a long sandy beach with calm, clear water that is popular for swimming and snorkeling. A small beach bar operates seasonally. The bay is exposed to northerly swells and best suited for settled weather conditions.",
    latitude: 18.4460,
    longitude: -64.6494,
    island: "Tortola",
    depth: "15-25ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 12,
    amenities: ["beach", "snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Coral reef at the western end of the bay. Anchor in the sandy center."
    },
    moorings: []
  },
  {
    name: "Long Bay West, Tortola",
    description: "Long Bay West is an anchorage on the southwest coast of Tortola near Frenchman's Cay. The bay faces south toward the Sir Francis Drake Channel and offers fair weather protection with views of the offshore islands. It is a quieter alternative to the busier anchorages further east along the south coast.",
    latitude: 18.3915,
    longitude: -64.6810,
    island: "Tortola",
    depth: "15-25ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 10,
    amenities: ["beach", "restaurant"],
    images: [],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: true,
      warning: "Seagrass patches near shore. Anchor in sand."
    },
    moorings: []
  },
  {
    name: "Sea Cow Bay, Tortola",
    description: "Sea Cow Bay is a shallow harbor on the south coast of Tortola, west of Road Town. It is primarily a local anchorage used by resident boat owners. The bay has limited facilities but offers fair protection and proximity to Road Town for provisioning and services.",
    latitude: 18.4065,
    longitude: -64.6145,
    island: "Tortola",
    depth: "8-15ft",
    holding: "mud",
    protection: "fair_weather",
    capacity: 15,
    amenities: [],
    images: [],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: true,
      warning: "Seagrass habitat present. Anchor carefully."
    },
    moorings: []
  },
  {
    name: "West End, Tortola",
    description: "West End is a ferry port and anchorage at the western tip of Tortola, adjacent to Soper's Hole. The area serves as the main entry point for ferries from the USVI. While the anchorage is convenient for clearing customs and catching ferries, it can experience ferry wash and commercial traffic throughout the day.",
    latitude: 18.3895,
    longitude: -64.6985,
    island: "Tortola",
    depth: "15-25ft",
    holding: "sand_mud",
    protection: "fair_weather",
    capacity: 10,
    amenities: ["customs", "provisions"],
    images: [],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: false,
      warning: null
    },
    moorings: []
  },
  {
    name: "Beef Island Bluff, Tortola",
    description: "Beef Island Bluff is a small anchorage on the south side of Beef Island, near the airport and the bridge to Tortola. The area offers basic anchorage in settled conditions and convenient access to the airport and Trellis Bay. It is not a common overnight stop but useful as a daytime staging area.",
    latitude: 18.4307,
    longitude: -64.5275,
    island: "Tortola",
    depth: "10-20ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 6,
    amenities: [],
    images: [],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: false,
      warning: null
    },
    moorings: []
  },
  {
    name: "East End, Tortola",
    description: "East End is the area around the eastern tip of Tortola, near the Beef Island bridge. The anchorage provides access to Trellis Bay and the nearby cays. Conditions can be choppy when trade winds funnel through the cut between Tortola and Beef Island.",
    latitude: 18.4510,
    longitude: -64.5215,
    island: "Tortola",
    depth: "12-20ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 8,
    amenities: [],
    images: [],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: false,
      warning: null
    },
    moorings: []
  },
  {
    name: "Paraquita Bay, Tortola",
    description: "Paraquita Bay is a mangrove-fringed harbor on the south coast of Tortola between Road Town and Fat Hogs Bay. The bay hosts a boatyard and several local fishing operations. It offers good hurricane protection due to its enclosed nature and mangrove surroundings, though depths are limited.",
    latitude: 18.4115,
    longitude: -64.5660,
    island: "Tortola",
    depth: "6-12ft",
    holding: "mud",
    protection: "all_weather",
    capacity: 10,
    amenities: [],
    images: [],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: true,
      warning: "Mangrove wetland area. Anchor only in the channel to avoid damaging mangrove roots and seagrass."
    },
    moorings: []
  },
  {
    name: "Buck Island, Tortola",
    description: "Buck Island is a small uninhabited island off the south coast of Tortola. The anchorage on the lee side offers a peaceful stop with snorkeling along the reef. The island is a nesting site for seabirds. It is best as a day stop in settled conditions, as it offers limited overnight protection.",
    latitude: 18.3720,
    longitude: -64.5340,
    island: "Tortola",
    depth: "15-25ft",
    holding: "sand_rock",
    protection: "fair_weather",
    capacity: 5,
    amenities: ["snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Reef surrounds the island. Anchor only in sandy patches. Seabird nesting area — keep distance from shore."
    },
    moorings: []
  },
  {
    name: "Frenchman's Cay, Tortola",
    description: "Frenchman's Cay is a small island connected to the western tip of Tortola by a bridge, near Soper's Hole. The anchorage on the south side of the cay offers good protection and proximity to the Soper's Hole marina and restaurants. It is a quieter spot than the main harbor while still being within easy dinghy distance of all facilities.",
    latitude: 18.3960,
    longitude: -64.6910,
    island: "Tortola",
    depth: "15-30ft",
    holding: "sand_mud",
    protection: "all_weather",
    capacity: 8,
    amenities: ["restaurant", "bar"],
    images: [],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: false,
      warning: null
    },
    moorings: []
  },

  // ═══════════════════════════════════════
  // VIRGIN GORDA
  // ═══════════════════════════════════════
  {
    name: "Virgin Gorda Yacht Harbour",
    description: "Virgin Gorda Yacht Harbour is a full-service marina located in Spanish Town, the main settlement on Virgin Gorda. The marina offers excellent facilities including fuel, water, power, and a well-stocked chandlery. The famous Baths are a short taxi ride away, and the village offers restaurants, shops, and provisioning. This is an ideal base for exploring the beautiful waters around Virgin Gorda and the nearby islands.",
    latitude: 18.4563,
    longitude: -64.4422,
    island: "Virgin Gorda",
    depth: "12-20ft",
    holding: "sand_mud",
    protection: "all_weather",
    capacity: 45,
    amenities: ["restaurant", "bar", "dinghy_dock", "fuel", "water", "ice", "wifi", "showers", "laundry", "provisions", "trash", "customs"],
    images: [
      "/images/anchorages/virgin-gorda-yacht-harbour-1.jpg",
      "/images/anchorages/virgin-gorda-yacht-harbour-2.jpg",
      "/images/anchorages/the-baths-vg.jpg"
    ],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: true,
      warning: "Seagrass beds present in the approach and anchorage area. Please follow marked channels and use mooring balls."
    },
    moorings: [
      { name: "VG-01", maxLength: 80, maxWeight: 80000, pricePerNight: 50, notes: "Marina mooring" },
      { name: "VG-02", maxLength: 80, maxWeight: 80000, pricePerNight: 50, notes: "Marina mooring" },
      { name: "VG-03", maxLength: 65, maxWeight: 55000, pricePerNight: 45, notes: "Outer mooring field" },
      { name: "VG-04", maxLength: 65, maxWeight: 55000, pricePerNight: 45, notes: "Outer mooring field" },
      { name: "VG-05", maxLength: 55, maxWeight: 45000, pricePerNight: 40, notes: "Near dinghy dock" },
      { name: "VG-06", maxLength: 55, maxWeight: 45000, pricePerNight: 40, notes: "Near dinghy dock" },
      { name: "VG-07", maxLength: 50, maxWeight: 40000, pricePerNight: 35, notes: "Eastern side" },
      { name: "VG-08", maxLength: 50, maxWeight: 40000, pricePerNight: 35, notes: "Eastern side" }
    ]
  },
  {
    name: "The Baths, Virgin Gorda",
    description: "The Baths are Virgin Gorda's most iconic attraction, featuring massive granite boulders creating a labyrinth of grottoes, pools, and tunnels along the beach. This is a BVI National Park and one of the most visited sites in the territory. The anchorage here is a day-use mooring area with no overnight stays permitted. Swells can make the moorings uncomfortable, and dinghy landings are sometimes rough.",
    latitude: 18.4312,
    longitude: -64.4460,
    island: "Virgin Gorda",
    depth: "15-30ft",
    holding: "sand_rock",
    protection: "fair_weather",
    capacity: 12,
    amenities: ["snorkeling", "beach"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "BVI NATIONAL PARK — Coral reef habitat. Use mooring balls only; anchoring prohibited. Day use only."
    },
    moorings: []
  },
  {
    name: "Leverick Bay, Virgin Gorda",
    description: "Leverick Bay is a popular anchorage on the west side of Virgin Gorda's North Sound. The Leverick Bay Resort & Marina offers a restaurant, bar, pool, dive shop, and small provisions store. The bay provides good protection and is a convenient base for exploring North Sound, Mosquito Island, and Prickly Pear. A ferry service connects to Spanish Town.",
    latitude: 18.4995,
    longitude: -64.3877,
    island: "Virgin Gorda",
    depth: "12-25ft",
    holding: "sand",
    protection: "all_weather",
    capacity: 25,
    amenities: ["restaurant", "bar", "dinghy_dock", "fuel", "water", "ice", "wifi", "showers", "provisions"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: true,
      warning: "Mixed reef and seagrass habitat in the area. Use mooring balls where available."
    },
    moorings: []
  },
  {
    name: "Gun Creek, Virgin Gorda",
    description: "Gun Creek is a small settlement on the west side of North Sound, Virgin Gorda. It serves as a ferry landing for North Sound access and has a few local restaurants and shops. The anchorage is shallow and best suited for smaller vessels. It provides a local, non-touristy feel compared to the resorts on the opposite shore.",
    latitude: 18.4990,
    longitude: -64.3985,
    island: "Virgin Gorda",
    depth: "8-15ft",
    holding: "sand_mud",
    protection: "fair_weather",
    capacity: 10,
    amenities: ["restaurant", "provisions"],
    images: [],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: true,
      warning: "Seagrass beds in the shallows. Navigate carefully to avoid grounding."
    },
    moorings: []
  },
  {
    name: "North Sound, Virgin Gorda",
    description: "North Sound is a large, nearly enclosed body of water on the northeast end of Virgin Gorda, protected by Mosquito Island, Prickly Pear, and the reef system. It offers superb all-weather protection and is home to several resorts and marinas including Bitter End Yacht Club, Saba Rock, and Leverick Bay. The sound is a world-class sailing and watersports destination.",
    latitude: 18.5050,
    longitude: -64.3800,
    island: "Virgin Gorda",
    depth: "10-30ft",
    holding: "sand",
    protection: "all_weather",
    capacity: 60,
    amenities: ["restaurant", "bar", "dinghy_dock", "fuel", "water", "wifi", "showers"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: true,
      warning: "Extensive reef and seagrass throughout North Sound. Navigate using marked channels. Anchor only in designated sandy areas."
    },
    moorings: []
  },
  {
    name: "Savannah Bay, Virgin Gorda",
    description: "Savannah Bay is a beautiful, largely undeveloped beach on the windward side of Virgin Gorda between Spanish Town and the Baths. The beach features long stretches of white sand with few visitors. The anchorage is exposed to easterly swells and best suited for calm conditions. It is a peaceful alternative to the busier beaches on the island.",
    latitude: 18.4660,
    longitude: -64.4214,
    island: "Virgin Gorda",
    depth: "15-25ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 6,
    amenities: ["beach"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Reef formations at the edges of the bay. Anchor in the sandy center."
    },
    moorings: []
  },
  {
    name: "Pond Bay, Virgin Gorda",
    description: "Pond Bay is a secluded beach on the west side of Virgin Gorda, south of the main settlement. The bay features calm, clear water and a sandy beach. It is a quiet day anchorage that sees relatively few visitors, making it ideal for those seeking solitude. Protection is limited in northerly or westerly swells.",
    latitude: 18.4694,
    longitude: -64.4156,
    island: "Virgin Gorda",
    depth: "12-20ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 6,
    amenities: ["beach", "snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Reef along the southern edge. Anchor in sand."
    },
    moorings: []
  },
  {
    name: "Mountain Point, Virgin Gorda",
    description: "Mountain Point is a popular dive and snorkel site on the western tip of Virgin Gorda near the entrance to North Sound. The rocky point features dramatic underwater pinnacles and walls with abundant marine life. It is primarily a day stop; the exposed position makes it unsuitable for overnight anchoring in most conditions.",
    latitude: 18.4997,
    longitude: -64.4114,
    island: "Virgin Gorda",
    depth: "20-50ft",
    holding: "rocky",
    protection: "fair_weather",
    capacity: 4,
    amenities: ["snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Rocky reef habitat. Use mooring balls if available; do not anchor on coral."
    },
    moorings: []
  },
  {
    name: "Bitter End, Virgin Gorda",
    description: "Bitter End Yacht Club is a legendary sailing resort on the eastern shore of North Sound, Virgin Gorda. The resort offers moorings, a restaurant, bar, watersports center, and the famous Bitter End sailing school. The location provides excellent protection within North Sound and is a favorite stop for both charter and private yachts. The resort was extensively rebuilt after Hurricane Irma.",
    latitude: 18.4988,
    longitude: -64.3596,
    island: "Virgin Gorda",
    depth: "10-20ft",
    holding: "sand",
    protection: "all_weather",
    capacity: 30,
    amenities: ["restaurant", "bar", "dinghy_dock", "water", "ice", "wifi", "showers"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: true,
      warning: "Reef and seagrass in the surrounding waters. Use resort moorings."
    },
    moorings: []
  },
  {
    name: "Biras Creek, Virgin Gorda",
    description: "Biras Creek is an exclusive resort tucked into the northeastern corner of North Sound, Virgin Gorda. The resort is accessible only by boat and offers a secluded, upscale experience with fine dining and pristine surroundings. The anchorage in the creek provides excellent protection, and the resort welcomes visiting yachts for dinner reservations.",
    latitude: 18.4929,
    longitude: -64.3568,
    island: "Virgin Gorda",
    depth: "10-18ft",
    holding: "mud",
    protection: "all_weather",
    capacity: 12,
    amenities: ["restaurant", "bar", "dinghy_dock"],
    images: [],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: true,
      warning: "Seagrass beds in the creek. Navigate carefully in the narrow channel."
    },
    moorings: []
  },
  {
    name: "Saba Rock, Virgin Gorda",
    description: "Saba Rock is a tiny island in the middle of North Sound that has been transformed into a boutique resort and restaurant. The island is famous for its nightly tarpon feeding and sunset bar. It is a popular stop for dinner and drinks, accessible by dinghy from anywhere in North Sound. The resort was rebuilt after Hurricane Irma and offers a handful of rooms.",
    latitude: 18.5030,
    longitude: -64.3589,
    island: "Virgin Gorda",
    depth: "8-15ft",
    holding: "sand",
    protection: "all_weather",
    capacity: 6,
    amenities: ["restaurant", "bar", "dinghy_dock"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Reef surrounding the islet. Approach via the marked channel only."
    },
    moorings: []
  },
  {
    name: "Oil Nut Bay, Virgin Gorda",
    description: "Oil Nut Bay is a luxury resort development on the eastern tip of Virgin Gorda, overlooking the open Atlantic. The resort features a marina, restaurant, and exclusive residences. The anchorage is exposed to easterly swells and best visited in calm conditions. It offers dramatic views of the surrounding islands and reefs.",
    latitude: 18.5000,
    longitude: -64.3452,
    island: "Virgin Gorda",
    depth: "12-25ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 10,
    amenities: ["restaurant", "bar", "dinghy_dock", "fuel"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Reef in the approach. Navigate with care."
    },
    moorings: []
  },
  {
    name: "Berchers Bay, Virgin Gorda",
    description: "Berchers Bay is a small bay on the northwest coast of Virgin Gorda, between Spanish Town and North Sound. It offers a quiet anchorage away from the busier harbors. The bay has limited facilities but provides decent protection from easterly trade winds and good snorkeling along the rocky shoreline.",
    latitude: 18.4923,
    longitude: -64.3529,
    island: "Virgin Gorda",
    depth: "15-25ft",
    holding: "sand_rock",
    protection: "fair_weather",
    capacity: 6,
    amenities: ["snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Rocky reef habitat along the shore. Anchor in sand."
    },
    moorings: []
  },
  {
    name: "Valley Trunk Bay, Virgin Gorda",
    description: "Valley Trunk Bay is a small, scenic bay on the southwest coast of Virgin Gorda, south of Spanish Town. The beach is relatively undeveloped and offers calm, clear water for swimming. The anchorage is suitable for day visits in settled conditions. Access ashore may involve a rocky dinghy landing.",
    latitude: 18.4333,
    longitude: -64.4333,
    island: "Virgin Gorda",
    depth: "15-25ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 4,
    amenities: ["beach", "snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Reef at the edges of the bay. Anchor in the sandy center."
    },
    moorings: []
  },

  // ═══════════════════════════════════════
  // JOST VAN DYKE
  // ═══════════════════════════════════════
  {
    name: "Great Harbour, Jost Van Dyke",
    description: "Great Harbour is the main settlement on Jost Van Dyke and home to the legendary Foxy's Bar, one of the most famous beach bars in the Caribbean. This charming harbor offers a true taste of Caribbean culture with its laid-back atmosphere, local restaurants, and friendly community. The bay provides good protection and is a favorite spot for New Year's Eve celebrations. Customs and immigration are available here for check-in.",
    latitude: 18.4418,
    longitude: -64.7515,
    island: "Jost Van Dyke",
    depth: "15-30ft",
    holding: "sand_mud",
    protection: "fair_weather",
    capacity: 40,
    amenities: ["restaurant", "bar", "dinghy_dock", "provisions", "ice", "wifi", "customs"],
    images: [
      "/images/anchorages/great-harbour-jvd-1.jpg",
      "/images/anchorages/great-harbour-jvd-2.jpg",
      "/images/anchorages/foxys-bar.jpg"
    ],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: true,
      warning: "Seagrass beds present in the shallower areas. Please anchor in sandy patches to protect this important marine habitat."
    },
    moorings: [
      { name: "GH-01", maxLength: 55, maxWeight: 45000, pricePerNight: 30, notes: "Near Foxy's" },
      { name: "GH-02", maxLength: 55, maxWeight: 45000, pricePerNight: 30, notes: "Near Foxy's" },
      { name: "GH-03", maxLength: 50, maxWeight: 40000, pricePerNight: 30, notes: "Central harbor" },
      { name: "GH-04", maxLength: 50, maxWeight: 40000, pricePerNight: 30, notes: "Central harbor" },
      { name: "GH-05", maxLength: 45, maxWeight: 35000, pricePerNight: 25, notes: "Eastern side" },
      { name: "GH-06", maxLength: 45, maxWeight: 35000, pricePerNight: 25, notes: "Eastern side" }
    ]
  },
  {
    name: "White Bay, Jost Van Dyke",
    description: "White Bay is arguably the most beautiful beach in the BVI, featuring a stunning crescent of powder-white sand and crystal-clear turquoise water. This iconic destination is home to the famous Soggy Dollar Bar, birthplace of the Painkiller cocktail. The bay can be rolly in northerly swells, but the spectacular beach and lively atmosphere make it worth the visit. Swimming ashore (hence 'Soggy Dollar') or dinghy landing are both options.",
    latitude: 18.4415,
    longitude: -64.7603,
    island: "Jost Van Dyke",
    depth: "20-35ft",
    holding: "sand",
    protection: "ne_swell",
    capacity: 25,
    amenities: ["restaurant", "bar", "beach", "snorkeling"],
    images: [
      "/images/anchorages/white-bay-jvd-1.jpg",
      "/images/anchorages/white-bay-jvd-2.jpg",
      "/images/anchorages/soggy-dollar-bar.jpg"
    ],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Coral formations present on both ends of the bay. Use mooring balls when available and anchor only in the sandy center of the bay."
    },
    moorings: [
      { name: "WB-01", maxLength: 50, maxWeight: 40000, pricePerNight: 35, notes: "Near Soggy Dollar" },
      { name: "WB-02", maxLength: 50, maxWeight: 40000, pricePerNight: 35, notes: "Near Soggy Dollar" },
      { name: "WB-03", maxLength: 45, maxWeight: 35000, pricePerNight: 30, notes: "Central bay" },
      { name: "WB-04", maxLength: 45, maxWeight: 35000, pricePerNight: 30, notes: "Central bay" },
      { name: "WB-05", maxLength: 40, maxWeight: 30000, pricePerNight: 25, notes: "Eastern end" }
    ]
  },
  {
    name: "Little Harbour, Jost Van Dyke",
    description: "Little Harbour is a quiet cove on the eastern end of Jost Van Dyke, home to Sidney's Peace and Love bar and restaurant — a local institution known for its lobster barbecues. The harbor is small and intimate, offering a more relaxed atmosphere than Great Harbour or White Bay. Harris' Place also serves food and drinks on the beach.",
    latitude: 18.4393,
    longitude: -64.7299,
    island: "Jost Van Dyke",
    depth: "15-25ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 15,
    amenities: ["restaurant", "bar", "beach"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Reef at the mouth of the harbour. Enter carefully and anchor in sand."
    },
    moorings: []
  },
  {
    name: "Diamond Cay, Jost Van Dyke",
    description: "Diamond Cay is a small islet off the eastern tip of Jost Van Dyke, designated as a BVI National Park for its seabird nesting habitat. The anchorage in the lee of the cay offers protection from trade winds and is a popular overnight spot for those exploring the less-visited eastern side of JVD. Snorkeling around the cay is excellent.",
    latitude: 18.4502,
    longitude: -64.7238,
    island: "Jost Van Dyke",
    depth: "15-25ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 8,
    amenities: ["snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "BVI NATIONAL PARK — Seabird nesting area. Do not go ashore on the cay. Reef habitat around the island."
    },
    moorings: []
  },
  {
    name: "Sandy Cay",
    description: "Sandy Cay is a pristine uninhabited island between Jost Van Dyke and Tortola, gifted to the BVI National Parks Trust by Laurance Rockefeller. The tiny island features a white sand beach, a nature trail through tropical vegetation, and excellent snorkeling on the surrounding reef. It is a day-use-only destination with no overnight anchoring permitted.",
    latitude: 18.4353,
    longitude: -64.7120,
    island: "Jost Van Dyke",
    depth: "20-35ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 6,
    amenities: ["beach", "snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: true,
      warning: "BVI NATIONAL PARK — Reef and seagrass surround the island. Anchor only in sand. Day use only."
    },
    moorings: []
  },
  {
    name: "Sandy Spit",
    description: "Sandy Spit is an iconic tiny sand bar island near Sandy Cay and Green Cay, often photographed as the quintessential Caribbean desert island. The islet is barely above sea level and features nothing but sand and a few palm trees. It is a popular day stop for beach picnics and photos. Not suitable for overnight anchoring.",
    latitude: 18.4504,
    longitude: -64.7098,
    island: "Jost Van Dyke",
    depth: "15-25ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 4,
    amenities: ["beach", "snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Reef surrounding the islet. Anchor in sand only. Day use only."
    },
    moorings: []
  },

  // ═══════════════════════════════════════
  // PETER ISLAND
  // ═══════════════════════════════════════
  {
    name: "Great Harbour, Peter Island",
    description: "Great Harbour is the main anchorage at Peter Island, on the northwest side facing the Sir Francis Drake Channel. The harbour was home to the Peter Island Resort and Spa, one of the most upscale resorts in the BVI. The harbour offers good protection from trade winds and has a beautiful beach. The resort was damaged by Hurricane Irma and has been undergoing redevelopment.",
    latitude: 18.3575,
    longitude: -64.5857,
    island: "Peter Island",
    depth: "15-30ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 20,
    amenities: ["beach", "snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: true,
      warning: "Reef and seagrass habitat in the bay. Use mooring balls when available."
    },
    moorings: []
  },
  {
    name: "Deadman's Bay, Peter Island",
    description: "Deadman's Bay is a stunning white sand beach on the north side of Peter Island, easily one of the most beautiful beaches in the BVI. The crescent-shaped bay offers good protection from southerly winds. The beach is part of the Peter Island Resort property but is accessible to visiting boaters. Snorkeling is good along the rocky points at both ends.",
    latitude: 18.3573,
    longitude: -64.5707,
    island: "Peter Island",
    depth: "15-25ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 12,
    amenities: ["beach", "snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Coral reef at both ends of the bay. Anchor in the sandy center."
    },
    moorings: []
  },
  {
    name: "Little Harbour, Peter Island",
    description: "Little Harbour is a secluded anchorage on the southwest corner of Peter Island. The narrow entrance opens into a well-protected harbour surrounded by steep hills. It offers excellent protection in most conditions and is a favorite overnight anchorage for those seeking peace and quiet away from the busier bays.",
    latitude: 18.3542,
    longitude: -64.6028,
    island: "Peter Island",
    depth: "15-25ft",
    holding: "sand_mud",
    protection: "all_weather",
    capacity: 8,
    amenities: ["snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Reef at the harbour entrance. Navigate carefully through the channel."
    },
    moorings: []
  },
  {
    name: "Sprat Bay, Peter Island",
    description: "Sprat Bay is a small bay on the north side of Peter Island, adjacent to the resort dock area. The bay is shallow and best suited for smaller vessels. It provides access to the Peter Island ferry dock and resort facilities. The anchorage can experience wind funneling effects from the surrounding hills.",
    latitude: 18.3576,
    longitude: -64.5767,
    island: "Peter Island",
    depth: "10-18ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 6,
    amenities: ["dinghy_dock"],
    images: [],
    sensitiveHabitat: {
      hasReef: false,
      hasSeagrass: true,
      warning: "Seagrass beds in the shallow areas. Navigate with caution."
    },
    moorings: []
  },

  // ═══════════════════════════════════════
  // COOPER ISLAND
  // ═══════════════════════════════════════
  {
    name: "Cooper Island",
    description: "Cooper Island Beach Club offers an eco-friendly Caribbean escape with a focus on sustainability. The intimate resort features a farm-to-table restaurant, rum bar, and the only microbrewery in the BVI. The island has excellent snorkeling right off the beach, with healthy coral formations and abundant fish life. Solar power and rainwater collection make this one of the most environmentally conscious destinations in the islands.",
    latitude: 18.3853,
    longitude: -64.5137,
    island: "Cooper Island",
    depth: "20-35ft",
    holding: "sand",
    protection: "ne_swell",
    capacity: 20,
    amenities: ["restaurant", "bar", "dinghy_dock", "snorkeling", "wifi", "showers", "trash"],
    images: [
      "/images/anchorages/cooper-island-1.jpg",
      "/images/anchorages/cooper-island-2.jpg",
      "/images/anchorages/cooper-island-beach-club.jpg"
    ],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: true,
      warning: "Both coral reef and seagrass habitats surround Cooper Island. Mooring balls are mandatory. The reef on the south side of the anchorage is a protected area - please maintain distance."
    },
    moorings: [
      { name: "CI-01", maxLength: 55, maxWeight: 45000, pricePerNight: 40, notes: "Beach Club mooring" },
      { name: "CI-02", maxLength: 55, maxWeight: 45000, pricePerNight: 40, notes: "Beach Club mooring" },
      { name: "CI-03", maxLength: 50, maxWeight: 40000, pricePerNight: 35, notes: "Central anchorage" },
      { name: "CI-04", maxLength: 50, maxWeight: 40000, pricePerNight: 35, notes: "Central anchorage" },
      { name: "CI-05", maxLength: 45, maxWeight: 35000, pricePerNight: 30, notes: "Northern mooring" },
      { name: "CI-06", maxLength: 45, maxWeight: 35000, pricePerNight: 30, notes: "Northern mooring" }
    ]
  },
  {
    name: "Cistern Point, Cooper Island",
    description: "Cistern Point is the southern tip of Cooper Island, offering a small anchorage on the leeward side. The area is known for excellent dive and snorkel sites with dramatic coral walls and diverse marine life. It is primarily a day stop, as overnight protection is limited compared to Manchioneel Bay on the north side.",
    latitude: 18.3830,
    longitude: -64.5110,
    island: "Cooper Island",
    depth: "20-40ft",
    holding: "sand_rock",
    protection: "fair_weather",
    capacity: 4,
    amenities: ["snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Sensitive coral reef. Use mooring balls if available. Do not anchor on reef."
    },
    moorings: []
  },

  // ═══════════════════════════════════════
  // SALT ISLAND
  // ═══════════════════════════════════════
  {
    name: "Salt Island Anchorage",
    description: "Salt Island is a small, sparsely inhabited island famous for the wreck of the RMS Rhone, a Royal Mail steamer that sank during a hurricane in 1867. The wreck site is the BVI's most popular dive attraction and a designated BVI National Park. The anchorage on the northwest side offers mooring balls and access to both the Rhone dive site and the island's historic salt ponds.",
    latitude: 18.3703,
    longitude: -64.5342,
    island: "Salt Island",
    depth: "20-35ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 10,
    amenities: ["snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "BVI NATIONAL PARK — RMS Rhone wreck site. Reef habitat throughout. Use mooring balls; anchoring restricted."
    },
    moorings: []
  },

  // ═══════════════════════════════════════
  // ANEGADA
  // ═══════════════════════════════════════
  {
    name: "Anegada Settlement",
    description: "Anegada is the BVI's only coral atoll, featuring miles of pristine white sand beaches and a unique flat landscape unlike any other island in the chain. Setting Point, near the main settlement, offers the best anchorage with access to the famous lobster restaurants like the Lobster Trap and Anegada Reef Hotel. The island is known for its flamingo colony, iguanas, and exceptional fishing. Navigation requires careful attention to the reef-strewn approaches.",
    latitude: 18.7232,
    longitude: -64.3844,
    island: "Anegada",
    depth: "10-18ft",
    holding: "sand",
    protection: "se_swell",
    capacity: 25,
    amenities: ["restaurant", "bar", "beach", "dinghy_dock", "fuel", "ice", "provisions", "taxi"],
    images: [
      "/images/anchorages/anegada-1.jpg",
      "/images/anchorages/anegada-2.jpg",
      "/images/anchorages/anegada-flamingos.jpg"
    ],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: true,
      warning: "Anegada is surrounded by the Horseshoe Reef, one of the largest barrier reefs in the Caribbean. Navigation requires extreme caution. Use marked channels only. Anchor only in designated sandy areas at Setting Point."
    },
    moorings: [
      { name: "AN-01", maxLength: 55, maxWeight: 45000, pricePerNight: 35, notes: "Setting Point" },
      { name: "AN-02", maxLength: 55, maxWeight: 45000, pricePerNight: 35, notes: "Setting Point" },
      { name: "AN-03", maxLength: 50, maxWeight: 40000, pricePerNight: 30, notes: "Near Anegada Reef Hotel" },
      { name: "AN-04", maxLength: 50, maxWeight: 40000, pricePerNight: 30, notes: "Near Anegada Reef Hotel" },
      { name: "AN-05", maxLength: 45, maxWeight: 35000, pricePerNight: 25, notes: "Western anchorage" },
      { name: "AN-06", maxLength: 45, maxWeight: 35000, pricePerNight: 25, notes: "Western anchorage" }
    ]
  },
  {
    name: "Pomato Point, Anegada",
    description: "Pomato Point is an anchorage on the south side of Anegada, near the Pomato Point Restaurant. The area offers a more sheltered alternative to Setting Point in certain wind conditions. The Pomato Point Restaurant is known for its seafood. The approach requires careful navigation to avoid the surrounding reef system.",
    latitude: 18.7287,
    longitude: -64.4046,
    island: "Anegada",
    depth: "8-15ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 8,
    amenities: ["restaurant"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: true,
      warning: "Extensive reef system surrounds Anegada. Navigate with extreme caution using GPS and marked channels only."
    },
    moorings: []
  },
  {
    name: "Loblolly Bay, Anegada",
    description: "Loblolly Bay is a stunning beach on the north shore of Anegada, featuring crystal-clear water, white sand, and excellent reef snorkeling directly off the beach. The Big Bamboo restaurant operates on the beach. This is a day-use anchorage only, as the north shore is exposed to Atlantic swells and not suitable for overnight stays. Access by boat requires navigating carefully through the reef.",
    latitude: 18.7485,
    longitude: -64.3430,
    island: "Anegada",
    depth: "10-20ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 4,
    amenities: ["restaurant", "beach", "snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: true,
      warning: "Pristine reef directly off the beach. Do not anchor on reef. Extreme caution required for boat approach from the north."
    },
    moorings: []
  },
  {
    name: "Cow Wreck Bay, Anegada",
    description: "Cow Wreck Bay is a remote beach on the north shore of Anegada, named after the bones of cattle that washed ashore from a shipwreck. The Cow Wreck Bar and Grill serves food and drinks on the beach. The bay features excellent beachcombing and calm, shallow water. Like Loblolly Bay, it is a day-use destination when approaching by boat, as the north shore exposure makes it unsuitable for overnight anchoring.",
    latitude: 18.7454,
    longitude: -64.4017,
    island: "Anegada",
    depth: "8-15ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 4,
    amenities: ["restaurant", "bar", "beach"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: true,
      warning: "Reef and seagrass throughout. Anchor in sand patches only. Day use only from water approach."
    },
    moorings: []
  },

  // ═══════════════════════════════════════
  // OTHER CAYS & ISLANDS
  // ═══════════════════════════════════════
  {
    name: "Lee Bay, Great Camanoe",
    description: "Lee Bay is a sheltered anchorage on the western side of Great Camanoe island, across the channel from Tortola's Beef Island. The bay offers protection from the prevailing easterly trade winds and is a peaceful overnight stop. The surrounding waters have good snorkeling along the rocky coastline. Great Camanoe is largely undeveloped and uninhabited.",
    latitude: 18.4712,
    longitude: -64.5339,
    island: "Great Camanoe",
    depth: "15-25ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 8,
    amenities: ["snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Rocky reef along the shoreline. Anchor in sand."
    },
    moorings: []
  },
  {
    name: "Marina Cay",
    description: "Marina Cay is a tiny island off the east end of Tortola, once made famous by Robb White's book 'Two on the Isle'. The island features a small resort with a restaurant, bar, and gift shop. Pusser's operates the restaurant and there is a dinghy dock for visitors. The surrounding waters offer good snorkeling, and the island provides a charming, intimate setting.",
    latitude: 18.4535,
    longitude: -64.5210,
    island: "Other Cays",
    depth: "12-20ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 15,
    amenities: ["restaurant", "bar", "dinghy_dock", "snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: true,
      warning: "Reef and seagrass around the island. Use mooring balls where available."
    },
    moorings: []
  },
  {
    name: "Scrub Island",
    description: "Scrub Island Resort, Spa and Marina is a luxury destination off the east end of Tortola. The resort features a full-service marina with modern facilities, multiple restaurants, a spa, and private beaches. The marina can accommodate vessels up to 160 feet. It is one of the newer and more upscale developments in the BVI.",
    latitude: 18.4685,
    longitude: -64.5070,
    island: "Other Cays",
    depth: "12-25ft",
    holding: "sand",
    protection: "all_weather",
    capacity: 20,
    amenities: ["restaurant", "bar", "dinghy_dock", "fuel", "water", "ice", "wifi", "showers", "laundry", "trash"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Reef in the surrounding waters. Follow marked channels into the marina."
    },
    moorings: []
  },
  {
    name: "Monkey Point, Guana Island",
    description: "Monkey Point is an anchorage on the southern tip of Guana Island, a private island resort and nature preserve. The point offers good snorkeling along the rocky coastline. Guana Island is home to diverse wildlife and maintains trails for resort guests. Visiting yachts can anchor off the south side in settled conditions but may not go ashore without resort reservations.",
    latitude: 18.4641,
    longitude: -64.5720,
    island: "Guana Island",
    depth: "15-30ft",
    holding: "sand_rock",
    protection: "fair_weather",
    capacity: 6,
    amenities: ["snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Coral reef habitat along the rocky shoreline. Anchor in sand only."
    },
    moorings: []
  },
  {
    name: "White Bay, Guana Island",
    description: "White Bay on Guana Island features a beautiful white sand beach on the north side of the island. The bay is accessible to visiting boats in calm conditions, though going ashore requires a resort reservation. The beach is surrounded by undeveloped tropical hillsides, and the snorkeling along the reef at either end of the bay is excellent.",
    latitude: 18.4726,
    longitude: -64.5763,
    island: "Guana Island",
    depth: "15-25ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 6,
    amenities: ["beach", "snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Reef at both ends of the bay. Anchor in the sandy center."
    },
    moorings: []
  },
  {
    name: "The Dogs",
    description: "The Dogs are a group of small uninhabited islands (Great Dog, George Dog, West Dog, and Seal Dog) between Tortola and Virgin Gorda. These rocky islets are a popular snorkel and dive destination with dramatic underwater terrain featuring walls, tunnels, and abundant marine life. There is no shore access, and anchoring is limited to the leeward sides of the islands in settled conditions. Day use only.",
    latitude: 18.4750,
    longitude: -64.4500,
    island: "Other Cays",
    depth: "20-40ft",
    holding: "rocky",
    protection: "fair_weather",
    capacity: 6,
    amenities: ["snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "PROTECTED DIVE SITE — Rocky reef and coral habitat. Use mooring balls if available. No anchoring on reef. Day use only."
    },
    moorings: []
  },
  {
    name: "Mosquito Island",
    description: "Mosquito Island (also known as Moskito Island) is a private island in North Sound owned by Sir Richard Branson. The island was previously the site of Drake's Anchorage resort. The anchorage on the west side offers protection within North Sound. While the island is privately owned, boats can anchor in the surrounding waters and access nearby Prickly Pear by dinghy.",
    latitude: 18.5020,
    longitude: -64.3870,
    island: "Other Cays",
    depth: "10-20ft",
    holding: "sand",
    protection: "all_weather",
    capacity: 10,
    amenities: [],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: true,
      warning: "Reef and seagrass around the island. Anchor in sand only."
    },
    moorings: []
  },
  {
    name: "Prickly Pear Island",
    description: "Prickly Pear is a small island at the northeastern end of North Sound, accessible by dinghy from anchorages in North Sound. The island features the Sand Box bar and restaurant on a beautiful beach, and Hog Heaven restaurant on the hilltop with panoramic views. The surrounding waters have excellent snorkeling, and the BVI National Parks Trust maintains the island's trails.",
    latitude: 18.5047,
    longitude: -64.3718,
    island: "Other Cays",
    depth: "10-18ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 8,
    amenities: ["restaurant", "bar", "beach", "snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: true,
      warning: "BVI NATIONAL PARK — Reef and seagrass habitat. Anchor in sand only."
    },
    moorings: []
  },
  {
    name: "Eustatia Island",
    description: "Eustatia Island is a small private island at the northeastern edge of North Sound, near Necker Island. The island is mostly undeveloped and offers anchorage in the lee. The surrounding reef provides excellent snorkeling opportunities. Access to the island itself is restricted as it is privately owned.",
    latitude: 18.5095,
    longitude: -64.3615,
    island: "Other Cays",
    depth: "12-20ft",
    holding: "sand_rock",
    protection: "fair_weather",
    capacity: 4,
    amenities: ["snorkeling"],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: false,
      warning: "Reef surrounding the island. Navigate and anchor with care."
    },
    moorings: []
  },
  {
    name: "Necker Island",
    description: "Necker Island is Sir Richard Branson's famous private island resort in the northeastern BVI. The island is available for exclusive hire and is not open to the general public. The surrounding waters are part of a protected marine area with excellent reef and seagrass habitats. Boats may anchor in the vicinity but may not land on the island without an invitation.",
    latitude: 18.5215,
    longitude: -64.3565,
    island: "Other Cays",
    depth: "12-25ft",
    holding: "sand",
    protection: "fair_weather",
    capacity: 4,
    amenities: [],
    images: [],
    sensitiveHabitat: {
      hasReef: true,
      hasSeagrass: true,
      warning: "Protected marine area around the island. Do not anchor on reef or seagrass. No shore access without invitation."
    },
    moorings: []
  }
];
