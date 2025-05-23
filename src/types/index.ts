
export interface ColivingSpace {
  id: string;
  name: string;
  address: string;
  logoUrl: string; // Can be used as a primary image too
  description: string;
  videoUrl?: string;
  slackLink?: string;
  whatsappLink?: string;
  tags?: string[]; // e.g., ["beach", "coworking", "community events", "quiet", "social"]
  dataAiHint?: string; // For placeholder image generation for logo/main image
  // websiteUrl?: string; // Future: Add a website URL

  // Updated fields for filtering
  monthlyPrice: number; // Approximate monthly price in a common currency (e.g., EUR or USD)
  hasPrivateBathroom?: boolean;
  hasCoworking?: boolean;
}

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

// --- Types for Trip Planner ---
export interface TripPlanInput {
  location: string;
  budget: 'low' | 'medium' | 'high';
  interests: string;
  duration: string;
  workingHours: string;
  leisureTime: string;
  workingStyle: 'intense_focus' | 'social_networking' | 'balanced';
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
