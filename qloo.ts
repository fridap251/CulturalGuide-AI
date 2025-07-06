export interface QlooTasteProfile {
  userId: string;
  demographics: {
    age: number;
    location: string;
    gender?: string;
  };
  behaviorPatterns: {
    musicListening: {
      genres: string[];
      artists: string[];
      listeningHabits: string[];
      platforms: string[];
    };
    diningPreferences: {
      cuisines: string[];
      restaurantTypes: string[];
      dietaryRestrictions: string[];
      spendingHabits: string[];
    };
    entertainmentChoices: {
      movieGenres: string[];
      tvShows: string[];
      books: string[];
      hobbies: string[];
    };
    shoppingBehavior: {
      brands: string[];
      categories: string[];
      pricePoints: string[];
      shoppingChannels: string[];
    };
    socialMedia: {
      platforms: string[];
      engagementTypes: string[];
      contentPreferences: string[];
    };
  };
  tasteGraph: {
    primaryInterests: string[];
    secondaryInterests: string[];
    affinityScores: { [key: string]: number };
    culturalPreferences: string[];
  };
  travelBehavior?: {
    previousDestinations: string[];
    accommodationPreferences: string[];
    activityTypes: string[];
    budgetRange: string;
    travelFrequency: string;
  };
}

export interface BehaviorInsight {
  category: string;
  behavior: string;
  travelConnection: string;
  confidence: number;
  examples: string[];
}

export interface TasteConnection {
  from: string;
  to: string;
  strength: number;
  reasoning: string;
}