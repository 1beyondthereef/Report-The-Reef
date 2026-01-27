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
  {
    name: "The Bight at Norman Island",
    description: "The Bight is a spectacular, well-protected bay on the north side of Norman Island, rumored to be the inspiration for Robert Louis Stevenson's 'Treasure Island'. This popular anchorage offers excellent snorkeling at the famous caves on the western side, where you can explore underwater caverns teeming with marine life. The bay is home to the iconic Willie T floating bar and restaurant, as well as Pirates Bight beach bar and restaurant ashore.",
    latitude: 18.3172,
    longitude: -64.6186,
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
    name: "Great Harbour, Jost Van Dyke",
    description: "Great Harbour is the main settlement on Jost Van Dyke and home to the legendary Foxy's Bar, one of the most famous beach bars in the Caribbean. This charming harbor offers a true taste of Caribbean culture with its laid-back atmosphere, local restaurants, and friendly community. The bay provides good protection and is a favorite spot for New Year's Eve celebrations. Customs and immigration are available here for check-in.",
    latitude: 18.4428,
    longitude: -64.7536,
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
    latitude: 18.4389,
    longitude: -64.7711,
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
    name: "Cane Garden Bay, Tortola",
    description: "Cane Garden Bay is Tortola's most popular beach destination, offering a mile-long stretch of palm-lined white sand beach. This vibrant bay features numerous beach bars, restaurants, and water sports activities. The bay is famous for its sunset views and live music scene, with venues like Myett's and Quito's offering entertainment. The surrounding hills create a dramatic backdrop, and the bay is easily accessible from Road Town.",
    latitude: 18.4283,
    longitude: -64.6489,
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
    name: "Soper's Hole, Tortola",
    description: "Soper's Hole is a picturesque hurricane hole at the western tip of Tortola, offering excellent all-weather protection. The Soper's Hole Wharf & Marina features charming West Indian-style buildings painted in bright colors, housing boutiques, restaurants, and cafes. This is a popular stop for provisioning, with a well-stocked grocery store and marine supplies. The ferry to St. John, USVI departs from here.",
    latitude: 18.3897,
    longitude: -64.7014,
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
    name: "Virgin Gorda Yacht Harbour",
    description: "Virgin Gorda Yacht Harbour is a full-service marina located in Spanish Town, the main settlement on Virgin Gorda. The marina offers excellent facilities including fuel, water, power, and a well-stocked chandlery. The famous Baths are a short taxi ride away, and the village offers restaurants, shops, and provisioning. This is an ideal base for exploring the beautiful waters around Virgin Gorda and the nearby islands.",
    latitude: 18.4456,
    longitude: -64.4319,
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
    name: "The Indians",
    description: "The Indians are a cluster of four dramatic rock pinnacles rising from the sea between Norman Island and Pelican Island. This is one of the BVI's premier snorkeling and diving sites, featuring spectacular underwater scenery with caves, tunnels, and abundant marine life including colorful corals, tropical fish, and occasional sea turtles. This is a daytime-only stop; overnight anchoring is not permitted to protect the marine environment.",
    latitude: 18.3328,
    longitude: -64.5978,
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
  {
    name: "Cooper Island",
    description: "Cooper Island Beach Club offers an eco-friendly Caribbean escape with a focus on sustainability. The intimate resort features a farm-to-table restaurant, rum bar, and the only microbrewery in the BVI. The island has excellent snorkeling right off the beach, with healthy coral formations and abundant fish life. Solar power and rainwater collection make this one of the most environmentally conscious destinations in the islands.",
    latitude: 18.3867,
    longitude: -64.5117,
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
    name: "Anegada Settlement",
    description: "Anegada is the BVI's only coral atoll, featuring miles of pristine white sand beaches and a unique flat landscape unlike any other island in the chain. Setting Point, near the main settlement, offers the best anchorage with access to the famous lobster restaurants like the Lobster Trap and Anegada Reef Hotel. The island is known for its flamingo colony, iguanas, and exceptional fishing. Navigation requires careful attention to the reef-strewn approaches.",
    latitude: 18.7275,
    longitude: -64.3256,
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
  }
];
