export interface SportConfig {
  slug: string;
  displayName: string;
  tagline: string;
  description: string;
  benefits: string[];
  heroCtaText: string;
  heroCtaSecondary: string;
  finalCtaHeadline: string;
  finalCtaText: string;
  socialProof: string;
  heroImage: string;
  featureHighlights: {
    icon: string;
    title: string;
    description: string;
  }[];
}

export const sportConfigs: Record<string, SportConfig> = {
  "field-hockey": {
    slug: "field-hockey",
    displayName: "Field Hockey",
    tagline: "Create. Share. Coach Smarter.",
    description: "Build your field hockey drill library, connect with coaches worldwide, and run better training sessions.",
    benefits: [
      "AI transforms sketches into pro diagrams",
      "Join the global coaching community",
      "Build training sessions in minutes",
      "Export PDF for pitch-side use"
    ],
    heroCtaText: "Start Free →",
    heroCtaSecondary: "Explore Drills",
    finalCtaHeadline: "Ready to Level Up?",
    finalCtaText: "Create Free Account",
    socialProof: "Made for field hockey coaches",
    heroImage: "/sports/field-hockey-hero.jpg",
    featureHighlights: [
      {
        icon: "Sparkles",
        title: "AI Magic",
        description: "Photo to pro diagram instantly"
      },
      {
        icon: "Users",
        title: "Community",
        description: "Learn from coaches worldwide"
      },
      {
        icon: "Calendar",
        title: "Sessions",
        description: "Plan complete training days"
      }
    ]
  },
  "football": {
    slug: "football",
    displayName: "Football/Soccer",
    tagline: "Your Playbook. Digitized.",
    description: "Create tactics, organize drills, and share with the coaching community.",
    benefits: [
      "AI-generated pitch diagrams",
      "Organize by skill or position",
      "Build complete training sessions",
      "Print-ready PDF exports"
    ],
    heroCtaText: "Start Free →",
    heroCtaSecondary: "Explore Drills",
    finalCtaHeadline: "Ready to Level Up?",
    finalCtaText: "Create Free Account",
    socialProof: "Trusted by football coaches globally",
    heroImage: "/sports/football-hero.jpg",
    featureHighlights: [
      {
        icon: "Sparkles",
        title: "AI Creation",
        description: "Photo to pro diagram instantly"
      },
      {
        icon: "Target",
        title: "Tactics",
        description: "Plays & drills organized"
      },
      {
        icon: "Users",
        title: "Community",
        description: "Share & discover drills"
      }
    ]
  },
  "basketball": {
    slug: "basketball",
    displayName: "Basketball",
    tagline: "Design Plays. Win Games.",
    description: "Create basketball plays with professional court diagrams and build your playbook.",
    benefits: [
      "AI-generated court diagrams",
      "Organize by offense, defense, transition",
      "Build training sessions",
      "Share with the community"
    ],
    heroCtaText: "Start Free →",
    heroCtaSecondary: "Explore Plays",
    finalCtaHeadline: "Ready to Level Up?",
    finalCtaText: "Create Free Account",
    socialProof: "Join basketball coaches worldwide",
    heroImage: "/sports/basketball-hero.jpg",
    featureHighlights: [
      {
        icon: "Sparkles",
        title: "AI Diagrams",
        description: "Photo to pro play instantly"
      },
      {
        icon: "Target",
        title: "Court View",
        description: "Professional diagrams"
      },
      {
        icon: "Users",
        title: "Community",
        description: "Share & discover plays"
      }
    ]
  },
  "volleyball": {
    slug: "volleyball",
    displayName: "Volleyball",
    tagline: "Every Point Starts Here.",
    description: "Create rotation drills, practice serves, and plan better training sessions.",
    benefits: [
      "AI-generated court diagrams",
      "Rotation & position drills",
      "Full session planning",
      "Community drill library"
    ],
    heroCtaText: "Start Free →",
    heroCtaSecondary: "Explore Drills",
    finalCtaHeadline: "Ready to Level Up?",
    finalCtaText: "Create Free Account",
    socialProof: "Join volleyball coaches worldwide",
    heroImage: "/sports/volleyball-hero.jpg",
    featureHighlights: [
      {
        icon: "Grid3x3",
        title: "Rotations",
        description: "Visual position diagrams"
      },
      {
        icon: "Zap",
        title: "Drills",
        description: "Serve, spike, block"
      },
      {
        icon: "Calendar",
        title: "Sessions",
        description: "Plan practice days"
      }
    ]
  },
  "floorball": {
    slug: "floorball",
    displayName: "Floorball",
    tagline: "Pro Drills. Made Simple.",
    description: "Create floorball drills with AI-generated rink diagrams and connect with coaches globally.",
    benefits: [
      "AI-generated rink diagrams",
      "Organize drills by situation",
      "Training session builder",
      "Global coach community"
    ],
    heroCtaText: "Start Free →",
    heroCtaSecondary: "Explore Drills",
    finalCtaHeadline: "Ready to Level Up?",
    finalCtaText: "Create Free Account",
    socialProof: "Join floorball coaches worldwide",
    heroImage: "/sports/floorball-hero.jpg",
    featureHighlights: [
      {
        icon: "Sparkles",
        title: "AI Diagrams",
        description: "Photo to pro rink view"
      },
      {
        icon: "Layers",
        title: "Organize",
        description: "By skill & situation"
      },
      {
        icon: "Globe",
        title: "Community",
        description: "Connect worldwide"
      }
    ]
  },
  "tennis": {
    slug: "tennis",
    displayName: "Tennis",
    tagline: "Train Better. Play Better.",
    description: "Build tennis drills for every stroke and plan complete training sessions.",
    benefits: [
      "AI-generated court diagrams",
      "Stroke-specific categories",
      "Build training sessions",
      "Save your favorite drills"
    ],
    heroCtaText: "Start Free →",
    heroCtaSecondary: "Explore Drills",
    finalCtaHeadline: "Ready to Level Up?",
    finalCtaText: "Create Free Account",
    socialProof: "Trusted by tennis coaches worldwide",
    heroImage: "/sports/tennis-hero.jpg",
    featureHighlights: [
      {
        icon: "Target",
        title: "Courts",
        description: "Professional diagrams"
      },
      {
        icon: "Activity",
        title: "Strokes",
        description: "Every shot covered"
      },
      {
        icon: "Calendar",
        title: "Sessions",
        description: "Plan practice days"
      }
    ]
  },
  "ice-hockey": {
    slug: "ice-hockey",
    displayName: "Ice Hockey",
    tagline: "Dominate the Ice.",
    description: "Create ice hockey drills with AI-generated rink diagrams and plan winning practices.",
    benefits: [
      "AI-generated rink diagrams",
      "Organize drills by zone",
      "Build complete practice sessions",
      "Connect with coaches globally"
    ],
    heroCtaText: "Start Free →",
    heroCtaSecondary: "Explore Drills",
    finalCtaHeadline: "Ready to Level Up?",
    finalCtaText: "Create Free Account",
    socialProof: "Join ice hockey coaches worldwide",
    heroImage: "/sports/ice-hockey-hero.jpg",
    featureHighlights: [
      {
        icon: "Sparkles",
        title: "AI Diagrams",
        description: "Photo to pro rink view"
      },
      {
        icon: "Target",
        title: "Zones",
        description: "Offense & defense drills"
      },
      {
        icon: "Calendar",
        title: "Sessions",
        description: "Plan practice days"
      }
    ]
  },
  "rugby": {
    slug: "rugby",
    displayName: "Rugby",
    tagline: "Build Winning Teams.",
    description: "Create rugby drills for forwards, backs, and set pieces. Plan better sessions.",
    benefits: [
      "AI-generated pitch diagrams",
      "Position-specific drill categories",
      "Conditioning drill organization",
      "Share with the community"
    ],
    heroCtaText: "Start Free →",
    heroCtaSecondary: "Explore Drills",
    finalCtaHeadline: "Ready to Level Up?",
    finalCtaText: "Create Free Account",
    socialProof: "Join rugby coaches worldwide",
    heroImage: "/sports/rugby-hero.jpg",
    featureHighlights: [
      {
        icon: "Target",
        title: "Pitch Views",
        description: "Pro rugby diagrams"
      },
      {
        icon: "Users",
        title: "Positions",
        description: "Forwards & backs drills"
      },
      {
        icon: "Dumbbell",
        title: "Conditioning",
        description: "Fitness drills"
      }
    ]
  },
  "handball": {
    slug: "handball",
    displayName: "Handball",
    tagline: "Score More. Win More.",
    description: "Design handball tactics and drills for attack, defense, and fast breaks.",
    benefits: [
      "AI-generated court diagrams",
      "Attack & defense drill categories",
      "Fast break drills",
      "Build your drill library"
    ],
    heroCtaText: "Start Free →",
    heroCtaSecondary: "Explore Drills",
    finalCtaHeadline: "Ready to Level Up?",
    finalCtaText: "Create Free Account",
    socialProof: "Join handball coaches worldwide",
    heroImage: "/sports/handball-hero.jpg",
    featureHighlights: [
      {
        icon: "Sparkles",
        title: "AI Diagrams",
        description: "Photo to pro court view"
      },
      {
        icon: "ArrowRightLeft",
        title: "Transitions",
        description: "Fast break drills"
      },
      {
        icon: "BookMarked",
        title: "Library",
        description: "Your drills saved"
      }
    ]
  },
  "fitness": {
    slug: "fitness",
    displayName: "General Conditioning/Fitness",
    tagline: "Train Any Athlete.",
    description: "Create workout diagrams and organize conditioning drills for athletes.",
    benefits: [
      "AI-generated workout diagrams",
      "Organize by training type",
      "Build complete sessions",
      "Share with the community"
    ],
    heroCtaText: "Start Free →",
    heroCtaSecondary: "Explore Workouts",
    finalCtaHeadline: "Ready to Level Up?",
    finalCtaText: "Create Free Account",
    socialProof: "Trusted by fitness coaches worldwide",
    heroImage: "/sports/fitness-hero.jpg",
    featureHighlights: [
      {
        icon: "Dumbbell",
        title: "Workouts",
        description: "Strength & mobility drills"
      },
      {
        icon: "Calendar",
        title: "Sessions",
        description: "Plan training days"
      },
      {
        icon: "Users",
        title: "Community",
        description: "Share & discover"
      }
    ]
  }
};

export const getSportConfig = (slug: string): SportConfig | undefined => {
  return sportConfigs[slug];
};

export const SPORTS = [
  "Field Hockey",
  "Football/Soccer",
  "Basketball",
  "Volleyball",
  "Floorball",
  "Tennis",
  "Ice Hockey",
  "Rugby",
  "Handball",
  "General Conditioning/Fitness"
];
