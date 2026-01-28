// BVI Dive Sites Data
// Add this to your project in src/lib/constants/dive-sites.ts

export interface DiveSite {
  id: string;
  name: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  depthRange: {
    min: number;
    max: number;
  };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  history: string;
  highlights: string[];
  isArtReef: boolean;
  artReefInfo?: {
    donation: string;
    donationUrl: string;
    organization: string;
  };
  marineLife?: string[];
  bestFor?: string[];
}

export const BVI_DIVE_SITES: DiveSite[] = [
  // ==========================================
  // BVI ART REEF SITES (Beyond The Reef)
  // ==========================================
  {
    id: 'sharkplaneo',
    name: 'Sharkplaneo',
    location: 'Virgin Gorda',
    coordinates: {
      lat: 18.28779,  // Verified by Beyond The Reef
      lng: -64.27288  // Verified by Beyond The Reef
    },
    depthRange: {
      min: 35,
      max: 45
    },
    difficulty: 'intermediate',
    history: 'Part of the BVI Art Reef created by Beyond The Reef. This unique attraction features a purposely sunk airplane transformed into an underwater art installation, designed to create an artificial reef habitat for marine life while providing a unique diving experience.',
    highlights: [
      'Unique airplane wreck',
      'Artificial reef habitat',
      'Growing coral colonies',
      'Abundant fish life',
      'Underwater art installation'
    ],
    isArtReef: true,
    artReefInfo: {
      donation: 'A $5 donation per diver is required and goes directly towards teaching local kids to swim.',
      donationUrl: 'https://1beyondthereef.com',
      organization: 'Beyond The Reef'
    },
    marineLife: ['Reef fish', 'Barracuda', 'Tarpon', 'Coral formations'],
    bestFor: ['Underwater photography', 'Unique wreck experience', 'Marine life observation']
  },
  {
    id: 'willy-t-wreck',
    name: 'Willy T Wreck',
    location: 'Key Bay, Peter Island',
    coordinates: {
      lat: 18.3461,  // Verified: 18°20.768'N
      lng: -64.5989  // Verified: 64°35.933'W
    },
    depthRange: {
      min: 40,
      max: 60
    },
    difficulty: 'intermediate',
    history: 'Part of the BVI Art Reef created by Beyond The Reef. The Willy T was a legendary floating bar and restaurant that served as a social hub for sailors in the BVI for decades. After being damaged, it was purposely sunk to create an artificial reef and unique dive site, preserving its legacy beneath the waves.',
    highlights: [
      'Former famous floating bar',
      'Intact structure to explore',
      'Rapidly developing coral growth',
      'Rich marine ecosystem forming',
      'Unique piece of BVI history'
    ],
    isArtReef: true,
    artReefInfo: {
      donation: 'A $5 donation per diver is required and goes directly towards teaching local kids to swim.',
      donationUrl: 'https://1beyondthereef.com',
      organization: 'Beyond The Reef'
    },
    marineLife: ['Sergeant majors', 'Snappers', 'Juvenile fish', 'Moray eels'],
    bestFor: ['Wreck diving', 'Marine life', 'Historical interest']
  },
  {
    id: 'kodiak-queen',
    name: 'Kodiak Queen (BVI Art Reef)',
    location: 'Mountain Point, Virgin Gorda',
    coordinates: {
      lat: 18.4979,  // Verified: 18°29.871'N
      lng: -64.4142  // Verified: 64°24.852'W
    },
    depthRange: {
      min: 45,
      max: 75
    },
    difficulty: 'advanced',
    history: 'Part of the BVI Art Reef created by Beyond The Reef. The Kodiak Queen is a historic US Navy fuel barge (YO-44) that survived the attack on Pearl Harbor on December 7, 1941. In 2017, it was transformed into the worlds largest underwater art installation through a collaboration between Virgin Unite, artists, engineers and the community. 80-foot kraken sculpture emerging from the vessel. The kraken sculpture was damaged in a storm, but the vessel remains a great dive site.',
    highlights: [
      'Pearl Harbor survivor vessel',
      '80-foot kraken sculpture (storm damaged)',
      'Worlds largest underwater art installation',
      'Historic WWII significance',
      'Incredible photo opportunities',
      'Thriving artificial reef ecosystem'
    ],
    isArtReef: true,
    artReefInfo: {
      donation: 'A $5 donation per diver is required and goes directly towards teaching local kids to swim.',
      donationUrl: 'https://1beyondthereef.com',
      organization: 'Beyond The Reef'
    },
    marineLife: ['Large pelagics', 'Reef fish', 'Rays', 'Barracuda', 'Nurse sharks'],
    bestFor: ['Advanced wreck diving', 'Underwater photography', 'Art appreciation', 'History buffs']
  },

  // ==========================================
  // CLASSIC BVI DIVE SITES
  // ==========================================
  {
    id: 'rhone',
    name: 'Wreck of the RMS Rhone',
    location: 'Salt Island',
    coordinates: {
      lat: 18.4067,  // Verified: 18°24.4'N
      lng: -64.5317  // Verified: 64°31.9'W
    },
    depthRange: {
      min: 30,
      max: 80
    },
    difficulty: 'intermediate',
    history: 'The RMS Rhone was a Royal Mail Ship that tragically sank during a devastating hurricane on October 29, 1867, claiming over 120 lives. Today, it is considered one of the Caribbeans most famous and best-preserved wrecks. The site gained worldwide fame after being featured in the 1977 film "The Deep" starring Jacqueline Bisset and Nick Nolte. The wreck is now a protected marine park.',
    highlights: [
      'Intact bow section',
      'Original propeller still visible',
      'Ships mast and crow\'s nest',
      'Featured in the movie "The Deep"',
      'Protected marine park',
      'Over 150 years of history'
    ],
    isArtReef: false,
    marineLife: ['Barracuda', 'Spotted eagle rays', 'Turtles', 'Colorful sponges', 'Moray eels'],
    bestFor: ['Wreck diving', 'History enthusiasts', 'Underwater photography', 'Advanced divers']
  },
  {
    id: 'the-indians',
    name: 'The Indians',
    location: 'Pelican Island, near Norman Island',
    coordinates: {
      lat: 18.3322,  // Verified: N18°19.930'
      lng: -64.6297  // Verified: W64°37.781'
    },
    depthRange: {
      min: 20,
      max: 50
    },
    difficulty: 'beginner',
    history: 'Named for the four dramatic rock formations that rise from the sea and resemble Native American headdresses when viewed from the water. These volcanic pinnacles have been a landmark for sailors for centuries and are now one of the most popular dive and snorkel sites in the BVI.',
    highlights: [
      'Four dramatic rock pinnacles',
      'Swim-through caves and archways',
      'Vibrant coral gardens',
      'Excellent visibility',
      'Great for snorkeling and diving',
      'Protected mooring area'
    ],
    isArtReef: false,
    marineLife: ['Angelfish', 'Parrotfish', 'Lobster', 'Octopus', 'Nurse sharks', 'Turtles'],
    bestFor: ['Beginners', 'Snorkeling', 'Underwater photography', 'Family diving']
  },
  {
    id: 'wreck-alley',
    name: 'Wreck Alley',
    location: 'Cooper Island',
    coordinates: {
      lat: 18.3693,  // Verified: N18°22.158' (Marie L waypoint)
      lng: -64.5107  // Verified: W64°30.642'
    },
    depthRange: {
      min: 50,
      max: 90
    },
    difficulty: 'advanced',
    history: 'Wreck Alley is home to multiple vessels that were intentionally sunk to create an artificial reef complex. The site includes the remains of several boats at varying depths, making it possible to explore multiple wrecks in a single dive. This underwater graveyard has become a thriving ecosystem.',
    highlights: [
      'Multiple wrecks in one location',
      'Variety of depths available',
      'Diverse marine habitats',
      'Excellent for multi-level diving',
      'Developing coral ecosystems'
    ],
    isArtReef: false,
    marineLife: ['Reef sharks', 'Grouper', 'Jacks', 'Stingrays', 'Moray eels'],
    bestFor: ['Experienced wreck divers', 'Multi-level diving', 'Marine life observation']
  },
  {
    id: 'the-chimney',
    name: 'The Chimney',
    location: 'Northwest of Great Dog Island',
    coordinates: {
      lat: 18.4850,  // Northwest of Great Dog (18.483), 15 min from Spanish Town
      lng: -64.4650  // On NW side of Great Dog Island
    },
    depthRange: {
      min: 15,
      max: 45
    },
    difficulty: 'intermediate',
    history: 'A dramatic underwater rock formation featuring a natural chimney-like structure that divers can swim through. The volcanic origins of the BVI created this unique geological feature, which has become encrusted with colorful sponges and corals over millennia.',
    highlights: [
      'Unique swim-through chimney formation',
      'Dramatic volcanic rock structure',
      'Colorful encrusting sponges',
      'Excellent light effects',
      'Photogenic site'
    ],
    isArtReef: false,
    marineLife: ['Glassy sweepers', 'Copper sweepers', 'Lobster', 'Crabs', 'Tarpon'],
    bestFor: ['Unique geological features', 'Photography', 'Intermediate divers']
  },
  {
    id: 'blonde-rock',
    name: 'Blonde Rock',
    location: 'Between Dead Chest Island & Salt Island',
    coordinates: {
      lat: 18.3800,  // NEEDS VERIFICATION - approximate, in Salt Island Passage
      lng: -64.5250  // NEEDS VERIFICATION - between Dead Chest & Salt Island
    },
    depthRange: {
      min: 15,
      max: 60
    },
    difficulty: 'intermediate',
    history: 'A submerged pinnacle that rises from deep water to within 15 feet of the surface. Named for the blonde-colored fire coral that covers much of its surface. This site offers dramatic topography and is known for attracting larger pelagic species due to its position in open water.',
    highlights: [
      'Dramatic underwater pinnacle',
      'Fire coral formations',
      'Attracts pelagic species',
      'Excellent visibility',
      'Varied depth options'
    ],
    isArtReef: false,
    marineLife: ['Eagle rays', 'Reef sharks', 'Horse-eye jacks', 'Barracuda', 'Turtles'],
    bestFor: ['Pelagic encounters', 'Experienced divers', 'Drift diving']
  },
  {
    id: 'santa-monica-rock',
    name: 'Santa Monica Rock',
    location: 'Norman Island',
    coordinates: {
      lat: 18.2995,  // Verified: N18°17.972'
      lng: -64.6349  // Verified: W64°38.093'
    },
    depthRange: {
      min: 50,
      max: 80
    },
    difficulty: 'advanced',
    history: 'A deep dive site featuring a massive underwater boulder covered in colorful sponges and black coral. The site is known for its pristine condition due to its depth and remote location, offering an unspoiled glimpse of Caribbean reef life.',
    highlights: [
      'Pristine deep reef',
      'Black coral formations',
      'Giant barrel sponges',
      'Less visited site',
      'Vibrant colors at depth'
    ],
    isArtReef: false,
    marineLife: ['Black coral', 'Barrel sponges', 'Spotted drums', 'Seahorses', 'Frogfish'],
    bestFor: ['Deep diving', 'Experienced divers', 'Macro photography']
  },
  {
    id: 'the-caves',
    name: 'The Caves',
    location: 'Norman Island',
    coordinates: {
      lat: 18.315769,  // Verified
      lng: -64.623893  // Verified
    },
    depthRange: {
      min: 10,
      max: 40
    },
    difficulty: 'beginner',
    history: 'These sea caves at the base of Norman Island\'s cliffs are rumored to have inspired Robert Louis Stevenson\'s "Treasure Island." Pirates allegedly used these caves to hide their loot, and the sense of adventure remains today as snorkelers and divers explore their depths.',
    highlights: [
      'Rumored Treasure Island inspiration',
      'Pirate history and legends',
      'Explore multiple caves',
      'Excellent snorkeling',
      'Bioluminescent at night'
    ],
    isArtReef: false,
    marineLife: ['Glassy sweepers', 'Silversides', 'Tarpon', 'Lobster', 'Squirrelfish'],
    bestFor: ['Beginners', 'Snorkeling', 'Night diving', 'Families', 'History buffs']
  },
  {
    id: 'alice-in-wonderland',
    name: 'Alice in Wonderland',
    location: 'Ginger Island',
    coordinates: {
      lat: 18.3924,  // Verified: N18°23.541' (Alice's Back Door waypoint nearby)
      lng: -64.4916  // Verified: W64°29.496'
    },
    depthRange: {
      min: 15,
      max: 60
    },
    difficulty: 'beginner',
    history: 'Named for its whimsical underwater landscape featuring giant mushroom-shaped coral formations that evoke the fantastical world of Lewis Carroll\'s famous story. The site showcases impressive examples of mountainous star coral that have grown over centuries.',
    highlights: [
      'Giant mushroom-shaped corals',
      'Whimsical underwater landscape',
      'Healthy coral formations',
      'Easy navigation',
      'Great for all skill levels'
    ],
    isArtReef: false,
    marineLife: ['Damselfish', 'Chromis', 'Parrotfish', 'Trumpetfish', 'Peacock flounder'],
    bestFor: ['Beginners', 'Underwater photography', 'Coral observation', 'Relaxed diving']
  },
  {
    id: 'painted-walls',
    name: 'Painted Walls',
    location: 'Dead Chest Island',
    coordinates: {
      lat: 18.363065,  // Verified
      lng: -64.560117  // Verified
    },
    depthRange: {
      min: 20,
      max: 50
    },
    difficulty: 'intermediate',
    history: 'Named for the kaleidoscope of colors that adorn its underwater rock walls. Centuries of coral, sponge, and tunicate growth have created a living canvas of purples, oranges, yellows, and reds. Dead Chest Island itself is famous from the pirate shanty "Fifteen men on a dead man\'s chest."',
    highlights: [
      'Vibrant multi-colored walls',
      'Diverse sponge species',
      'Pirate history connection',
      'Excellent macro life',
      'Stunning photography'
    ],
    isArtReef: false,
    marineLife: ['Nudibranchs', 'Flamingo tongues', 'Arrow crabs', 'Decorator crabs', 'Juvenile fish'],
    bestFor: ['Macro photography', 'Color enthusiasts', 'Wall diving', 'Intermediate divers']
  },
  {
    id: 'vanishing-reef',
    name: 'Vanishing Reef',
    location: 'Ginger Island',
    coordinates: {
      lat: 18.377965,  // Verified
      lng: -64.519856  // Verified
    },
    depthRange: {
      min: 25,
      max: 45
    },
    difficulty: 'intermediate',
    history: 'A pristine coral garden that appears to vanish into the blue as it slopes into deeper water. This site showcases some of the healthiest hard coral formations in the BVI, with extensive elkhorn and staghorn coral colonies that have survived bleaching events.',
    highlights: [
      'Pristine coral gardens',
      'Healthy elkhorn coral',
      'Staghorn coral colonies',
      'Gradual slope for easy diving',
      'Crystal clear visibility'
    ],
    isArtReef: false,
    marineLife: ['Coral banded shrimp', 'Christmas tree worms', 'Cleaning stations', 'Butterflyfish', 'Angelfish'],
    bestFor: ['Coral enthusiasts', 'Relaxed diving', 'Marine biology observation']
  },
  {
    id: 'rainbow-canyons',
    name: 'Rainbow Canyons',
    location: 'Between The Indians & Pelican Island',
    coordinates: {
      lat: 18.3310,  // Near The Indians, slightly south toward Norman Island
      lng: -64.6270  // Between The Indians and Pelican Island
    },
    depthRange: {
      min: 30,
      max: 60
    },
    difficulty: 'intermediate',
    history: 'Located between The Indians and Pelican Island, this site features a series of underwater canyons and channels carved into the reef structure, creating swim-throughs decorated with colorful sponges and corals. The canyon walls catch the light creating rainbow-like effects throughout the dive.',
    highlights: [
      'Dramatic canyon formations',
      'Multiple swim-throughs',
      'Rainbow light effects',
      'Sandy bottom channels',
      'Varied topography'
    ],
    isArtReef: false,
    marineLife: ['Southern stingrays', 'Garden eels', 'Spotted eagle rays', 'Goatfish', 'Lizardfish'],
    bestFor: ['Swim-throughs', 'Underwater photography', 'Topography lovers', 'Ray encounters']
  },
  {
    id: 'angelfish-reef',
    name: 'Angelfish Reef',
    location: 'Norman Island',
    coordinates: {
      lat: 18.3094,  // Verified: N18°18.566'
      lng: -64.6289  // Verified: W64°37.731'
    },
    depthRange: {
      min: 20,
      max: 50
    },
    difficulty: 'beginner',
    history: 'Named for the abundant angelfish populations that call this reef home. The site features healthy coral formations and is known as one of the best places in the BVI to observe queen angelfish, French angelfish, and gray angelfish in their natural habitat.',
    highlights: [
      'Abundant angelfish populations',
      'Multiple angelfish species',
      'Healthy reef structure',
      'Easy diving conditions',
      'Great fish observation'
    ],
    isArtReef: false,
    marineLife: ['Queen angelfish', 'French angelfish', 'Gray angelfish', 'Rock beauties', 'Blue tangs', 'Doctorfish'],
    bestFor: ['Fish identification', 'Beginners', 'Relaxed diving', 'Photography']
  }
];

// Icon configuration for dive sites
export const DIVE_SITE_ICON = {
  // Use a dive flag icon (red with white diagonal stripe)
  iconUrl: '/icons/dive-flag.svg', // You'll need to add this SVG to your public folder
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
};

// Helper function to get Art Reef sites only
export const getArtReefSites = () => {
  return BVI_DIVE_SITES.filter(site => site.isArtReef);
};

// Helper function to get sites by difficulty
export const getSitesByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
  return BVI_DIVE_SITES.filter(site => site.difficulty === difficulty);
};

// Helper function to get sites within a depth range
export const getSitesByDepth = (maxDepth: number) => {
  return BVI_DIVE_SITES.filter(site => site.depthRange.min <= maxDepth);
};
