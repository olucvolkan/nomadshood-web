
export interface ColivingSpace {
  id: string;
  name: string;
  address: string; // Full address string from Firestore's 'location'
  logoUrl: string; // Mapped from Firestore's 'cover_image' for the coliving space
  description: string;
  videoUrl?: string; // Mapped from 'youtube_video_link'
  slackLink?: string; // Optional, as it's not in the new JSON
  whatsappLink?: string; // Mapped from 'contact.whatsapp'
  websiteUrl?: string; // Mapped from 'website'
  tags?: string[];
  dataAiHint?: string;

  // Fields from your new JSON structure
  country: string;
  city: string;
  region?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  average_budget?: string; // e.g., "€1000+/month"
  budget_range?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  // cover_image is mapped to logoUrl
  gallery?: string[];
  coworking_access?: string; // Will be parsed to hasCoworking
  amenities?: string[];
  room_types?: Array<{
    type?: string;
    price?: number;
    currency?: string;
  }>;
  vibe?: string;
  contact?: {
    email?: string;
    phone?: string;
    // whatsapp is mapped to whatsappLink
  };
  capacity?: number;
  minimum_stay?: string;
  check_in?: string;
  languages?: string[];
  age_range?: string;
  rating?: number;
  reviews_count?: number;
  wifi_speed?: string;
  climate?: string;
  timezone?: string;
  nearby_attractions?: string[];
  transportation?: {
    airport_distance?: string;
    public_transport?: string;
    bike_rental?: boolean;
  };
  created_at?: string; // Consider converting to Date objects if needed
  updated_at?: string; // Consider converting to Date objects if needed
  status?: string;

  // Derived/mapped fields for easier component use
  monthlyPrice: number; // Derived from budget_range.min
  hasPrivateBathroom?: boolean; // This field is not in your new JSON, so it will be false/undefined
  hasCoworking?: boolean; // Derived from coworking_access
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

// New type for data from "countries" Firestore collection
export interface CountryData {
  id: string; // Firestore document ID
  code: string;
  name: string;
  cover_image: string;
  flag: string; // Emoji
  continent?: string;
  currency?: string;
  timezone?: string;
  popular_cities?: string[];
  coliving_count?: number; // Denormalized count from your Firestore data
}
