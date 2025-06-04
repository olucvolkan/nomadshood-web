
export interface ColivingSpace {
  id: string;
  name: string;
  address: string; 
  logoUrl: string; 
  mainImageUrl?: string; 
  // description?: string; // Removed as per user request
  videoUrl?: string; 
  whatsappLink?: string; 
  websiteUrl?: string; 
  tags?: string[];
  dataAiHint?: string;

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
  coworking_access?: string; 
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
  created_at?: string;
  updated_at?: string;
  status?: string;
  brand?: string;
  monthlyPrice: number; 
  hasPrivateBathroom?: boolean; 
  hasCoworking?: boolean; 
}

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
  reason?: string; 
  cuisine?: string; 
}

export interface DailyItineraryItem {
  day: string; 
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

export interface CountryData {
  id: string; 
  code: string; 
  name: string;
  cover_image: string; 
  flag: string; 
  flagImageUrl?: string; 
  continent?: string;
  currency?: string;
  timezone?: string;
  popular_cities?: string[];
  coliving_count?: number;
}

export interface NomadVideo {
  id: string; 
  title: string;
  thumbnailUrl: string; 
  youtubeUrl: string; 
  viewCount: number; 
  likeCount: number; 
  commentCount: number; 
  duration: number; 
  publishedAt: string; 
  destination?: string;
  dataAiHint?: string;
}

export interface Community {
  id?: string; 
  name: string;
  platform: string; 
  city?: string; 
  groupLink: string;
  memberCount?: number;
  membersText?: string; 
  tags?: string[];
  requirementToJoin?: string; 
  flag?: string; 
}

export interface CountryWithCommunities {
  id: string; 
  code: string;
  name: string;
  cover_image?: string; // This is for manually set URLs in Firestore
  firebaseCoverImageUrl?: string; // This will store the SDK-fetched URL
  flag?: string;
  flagImageUrl?: string;
  continent?: string;
  currency?: string;
  timezone?: string;
  popular_cities?: string[];
  coliving_count?: number;
  source?: string; 
  community_count?: number;
  community_members?: number; 
  community_cities?: string[]; 
  community_platforms?: string[]; 
  communities: Community[]; 
}

export interface ReviewItem {
  id: string;
  coliving_id: string;
  coliving_name: string;
  author_name: string;
  author_url?: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  time: number; 
  text: string | null; 
  language?: string;
  translated?: boolean;
  original_language?: string;
  review_length?: number;
  is_recent?: boolean;
  sentiment_score?: number;
}

export interface ColivingReviewData {
  id: string; 
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
  total_reviews?: number; 
  recent_reviews_count?: number;
  average_sentiment?: number;
  reviews: ReviewItem[];
  crawled_at?: string; 
  api_status?: string;
}

// Updated NearbyPlace type based on the new schema
export interface NearbyPlace {
  id: string; // Google Place ID (place_id from schema)
  coliving_id: string; // The ID of the coliving space this place is near to
  name: string; // Name of the place
  type: string; // Category key from schema (e.g., "supermarket", "restaurant")
  googleTypes?: string[]; // Raw Google Places types
  distance_meters?: number; // Raw distance in meters
  distance_walking_time?: number | null; // Walking time in minutes
  rating?: number; // Google rating (0-5)
  user_ratings_total?: number; // Total number of ratings
  price_level?: number | null; // Price level (0-4)
  address_vicinity?: string; // Vicinity or short address
  coordinates?: { lat: number; lng: number };
  business_status?: string; // e.g., "OPERATIONAL"
  // imageUrl removed as per user request
  locationLink?: string; // Google Maps link generated from coordinates
  dataAiHint?: string; // For potential future use or if image placeholders return
}

// Structure for the document in 'coliving_nearby_places' collection
export interface FirestoreNearbyPlacesDoc {
  coliving_id: string;
  coliving_name?: string;
  coliving_city?: string;
  coliving_country?: string;
  coliving_website?: string;
  coliving_location?: {
    google_place_id?: string;
    google_name?: string;
    google_address?: string;
    coordinates?: { lat: number; lng: number };
  };
  nearby_places?: {
    [categoryKey: string]: Array<{ // e.g., "supermarket": [placeObj, placeObj]
      place_id: string;
      name: string;
      category: string; // Should match the categoryKey
      types: string[];
      rating?: number;
      user_ratings_total?: number;
      price_level?: number | null;
      vicinity?: string;
      distance_meters?: number;
      distance_walking_time?: number | null;
      coordinates?: { lat: number; lng: number };
      business_status?: string;
      permanently_closed?: boolean;
    }>;
  };
  summary?: {
    total_places_found?: number;
    categories_with_places?: number;
    closest_supermarket?: number | null;
    walkability_score?: number;
  };
  metadata?: {
    crawled_at?: string;
    uploaded_at?: string;
    source?: string;
  };
}

export interface CategorizedNearbyPlaceGroup {
  categoryKey: string;
  categoryDisplayName: string;
  places: NearbyPlace[];
}
