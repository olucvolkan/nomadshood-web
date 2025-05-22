export interface ColivingSpace {
  id: string;
  name: string;
  address: string;
  logoUrl: string; // Can be used as a primary image too
  description: string;
  videoUrl?: string;
  slackLink?: string;
  whatsappLink?: string;
  tags?: string[]; // e.g., ["beach", "coworking", "community events"]
  dataAiHint?: string; // For placeholder image generation for logo/main image
  // websiteUrl?: string; // Future: Add a website URL
}

// Old ColivingRecommendation is replaced by TripPlanOutput features
// export interface ColivingRecommendation {
//   name: string;
//   address: string;
//   description: string;
// }

export interface CommunityLink {
  platform: 'Slack' | 'WhatsApp' | 'Telegram' | 'Other';
  name: string;
  url: string;
  dataAiHint?: string;
}

export interface CountrySpecificCommunityLinks {
  countryName: string;
  links: CommunityLink[];
}

// --- New Types for Trip Planner ---
export interface TripPlanInput {
  location: string;
  budget: 'low' | 'medium' | 'high';
  interests: string;
  duration: string;
  workingHours: string;
  leisureTime: string;
}

export interface ColivingSuggestion {
  name: string;
  address: string;
  reason: string;
}

export interface ActivitySuggestion {
  name: string;
  reason?: string; // For cafes/restaurants
  cuisine?: string; // For restaurants
}

export interface DailyItineraryItem {
  day: string; // e.g., "Day 1", "Monday"
  morningActivity: string;
  afternoonActivity: string;
  eveningActivity: string;
}

export interface TripPlanOutput {
  destinationOverview: string;
  colivingSuggestion: ColivingSuggestion;
  dailyItinerary: DailyItineraryItem[];
  cafeSuggestions: ActivitySuggestion[];
  restaurantSuggestions: ActivitySuggestion[];
}
