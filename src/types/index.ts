
export interface ColivingSpace {
  id: string;
  name: string;
  address: string; // Mapped from Firestore's 'location'
  logoUrl: string; // Mapped from Firestore's 'cover_image' or 'logo'
  mainImageUrl?: string; // Mapped from Firestore's 'gallery[0]' or 'cover_image'
  description: string;
  videoUrl?: string; // Mapped from 'youtube_video_link'
  whatsappLink?: string; // Mapped from 'contact.whatsapp'
  websiteUrl?: string; // Mapped from 'website'
  tags?: string[];
  dataAiHint?: string;

  // Fields directly from your new JSON structure / Firestore
  country: string;
  city: string;
  region?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  average_budget?: string;
  budget_range?: {
    min?: number;
    max?: number;
    currency?: string;
  };
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
  rating?: number; // Expecting a number directly
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
  created_at?: string;
  updated_at?: string;
  status?: string;
  brand?: string;


  // Derived/mapped fields for easier component use
  monthlyPrice: number; // Derived from budget_range.min
  hasPrivateBathroom?: boolean; // Derived from amenities
  hasCoworking?: boolean; // Derived from coworking_access
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

// Type for data from "countries" Firestore collection
export interface CountryData {
  id: string; // Firestore document ID
  code: string; // e.g., "ES", "PT"
  name: string;
  cover_image: string; // URL for a general image of the country
  flag: string; // Emoji flag
  flagImageUrl?: string; // URL for the flag image from Firebase Storage
  continent?: string;
  currency?: string;
  timezone?: string;
  popular_cities?: string[];
  coliving_count?: number;
}

// Standardized NomadVideo type used in the application
export interface NomadVideo {
  id: string; // Mapped from videoId or Firestore document ID
  title: string;
  thumbnailUrl: string; // Derived from thumbnails.high.url or fallbacks
  youtubeUrl: string; // Mapped from url or a direct field in Firestore
  viewCount: number; // Parsed from statistics.viewCount or direct field
  likeCount: number; // Parsed from statistics.likeCount or direct field
  commentCount: number; // Parsed from statistics.commentCount or direct field
  duration: number; // Parsed from statistics.duration (in seconds) or direct field
  publishedAt: string; // ISO string date (from JSON or converted from Firestore Timestamp)
  destination?: string;
  dataAiHint?: string;
}


// Types for Country Communities data from Firestore 'countries' collection
export interface Community {
  id?: string; // Firestore document ID for the community if stored as a subcollection, or array index if embedded
  name: string;
  platform: string; // e.g., "Facebook", "WhatsApp", "Reddit", "Slack", "Telegram"
  city?: string; // Optional: if the community is city-specific within the country
  groupLink: string;
  memberCount?: number;
  membersText?: string; // Could be "11.6k members" or similar
  tags?: string[];
  requirementToJoin?: string; // e.g., "None", "Approval Required"
  flag?: string; // flag is usually at the CountryWithCommunities level but can be in community specific data
}

export interface CountryWithCommunities {
  id: string; // Firestore document ID for the country
  code: string;
  name: string;
  cover_image?: string;
  flag?: string;
  flagImageUrl?: string;
  continent?: string;
  currency?: string;
  timezone?: string;
  popular_cities?: string[];
  coliving_count?: number;
  source?: string; // Where the country data was sourced from, if applicable
  community_count?: number;
  community_members?: number; // Aggregate if available
  community_cities?: string[]; // List of cities with communities in this country
  community_platforms?: string[]; // List of platforms used by communities in this country
  communities: Community[]; // Array of community objects
}

// --- Types for Coliving Reviews ---
export interface ReviewItem {
  id: string;
  coliving_id: string;
  coliving_name: string;
  author_name: string;
  author_url?: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  time: number; // Unix timestamp
  text: string | null; // Text can be null
  language?: string;
  translated?: boolean;
  original_language?: string;
  review_length?: number;
  is_recent?: boolean;
  sentiment_score?: number;
}

export interface ColivingReviewData {
  id: string; // Firestore document ID for this review batch
  coliving_id: string;
  coliving_name?: string;
  coliving_city?: string;
  coliving_country?: string;
  coliving_website?: string;
  google_place_id?: string;
  google_name?: string;
  google_address?: string;
  google_rating?: number;
  google_total_ratings?: number;
  google_website?: string;
  google_phone?: string;
  total_reviews?: number; // Number of reviews in the 'reviews' array below
  recent_reviews_count?: number;
  average_sentiment?: number;
  reviews: ReviewItem[];
  crawled_at?: string; // ISO date string
  api_status?: string;
}

// --- Types for Nearby Places ---
export interface NearbyPlace {
  id: string; // Firestore document ID
  coliving_id: string; // Foreign key to the coliving space
  name: string;
  type: string; // e.g., "Cafe", "Restaurant", "Park", "Gym", "Supermarket", "Metro Station", "Attraction"
  distance?: string; // e.g., "5 min walk", "200m", "1km"
  imageUrl?: string; // URL for an image of the place
  description?: string; // Optional short description
  locationLink?: string; // Optional URL to Google Maps or similar
  dataAiHint?: string; // For image placeholders
}
