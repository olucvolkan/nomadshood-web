import { db } from '@/lib/firebase';
import type { CategorizedNearbyPlaceGroup, ColivingReviewData, ColivingSpace, Community, CountryWithCommunities, FirestoreNearbyPlacesDoc, NearbyPlace, ReviewItem } from '@/types';
import { collection, doc, limit as firestoreLimit, getDoc, getDocs, query, Timestamp, where, type DocumentData, type QueryDocumentSnapshot } from 'firebase/firestore';

const parseCoordinate = (value: any): number | undefined => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const mapDocToColivingSpace = (document: QueryDocumentSnapshot<DocumentData> | DocumentData): ColivingSpace => {
  const rawData = document.data();

  if (!rawData) {
    console.error("Document data is undefined for document ID:", document.id);
    return {
      id: document.id,
      name: 'Error: Missing Data',
      address: 'Data Unavailable',
      logoUrl: 'https://placehold.co/80x80/E0E0E0/757575.png',
      mainImageUrl: 'https://placehold.co/600x400/E0E0E0/757575.png',
      // description: 'Data for this coliving space could not be loaded.', // Removed
      country: 'Unknown',
      city: 'Unknown',
      monthlyPrice: 0,
      dataAiHint: "placeholder image error",
      tags: [],
      amenities: [],
      room_types: [],
      hasPrivateBathroom: false,
      hasCoworking: false,
    } as ColivingSpace;
  }

  const data = { ...rawData }; 

  const formatDate = (timestampField: any): string | undefined => {
    if (!timestampField) return undefined;
    if (timestampField instanceof Timestamp) {
      return timestampField.toDate().toISOString();
    } else if (typeof timestampField === 'string') {
      try {
        return new Date(timestampField).toISOString();
      } catch (e) {
        return undefined;
      }
    } else if (typeof timestampField === 'object' && typeof timestampField.seconds === 'number') {
      return new Date(timestampField.seconds * 1000 + (timestampField.nanoseconds || 0) / 1000000).toISOString();
    }
    return undefined;
  };

  const isAbsoluteImageUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') {
      return false;
    }
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return false;
      }
      const path = parsedUrl.pathname.toLowerCase();
      if (!path.endsWith('.jpg') && !path.endsWith('.jpeg') && !path.endsWith('.png') && !path.endsWith('.gif') && !path.endsWith('.webp')) {
        return path.length > 1; 
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  let finalMainImageUrl: string | undefined = undefined;

  if (Array.isArray(data.gallery) && data.gallery.length > 0 && typeof data.gallery[0] === 'string' && isAbsoluteImageUrl(data.gallery[0])) {
    finalMainImageUrl = data.gallery[0];
  }

  if (!finalMainImageUrl && data.cover_image && typeof data.cover_image === 'string' && isAbsoluteImageUrl(data.cover_image)) {
    finalMainImageUrl = data.cover_image;
  }
  
  if (!finalMainImageUrl) {
    finalMainImageUrl = `https://placehold.co/600x400/E0E0E0/757575.png`;
  }
  
  const amenitiesArray: string[] = Array.isArray(data.amenities) ? data.amenities.filter((a: any) => typeof a === 'string') : [];

  let hasCoworkingDerived = false;
  if (typeof data.coworking_access === 'string') {
    const access = data.coworking_access.toLowerCase();
    hasCoworkingDerived = access.includes('yes') || access.includes('available') || access.includes('24/7');
  } else if (typeof data.coworking_access === 'boolean') {
    hasCoworkingDerived = data.coworking_access;
  }
  if (!hasCoworkingDerived) {
    hasCoworkingDerived = amenitiesArray.some((amenity: string) =>
      amenity.toLowerCase().includes('coworking') || amenity.toLowerCase().includes('co-working')
    );
  }

  const hasPrivateBathroomDerived = amenitiesArray.some((amenity: string) =>
    amenity.toLowerCase().includes('private bathroom')
  );
  
  let displayAddress = 'Location not specified';
  if (data.location && typeof data.location === 'string' && data.location.trim() !== '') {
    displayAddress = data.location;
  } else if (data.address && typeof data.address === 'string' && data.address.trim() !== '') {
    displayAddress = data.address;
  } else if (data.city && data.country) {
    displayAddress = `${data.city}, ${data.country}`;
  }
  
  let processedCoordinates: { latitude?: number; longitude?: number } | undefined = undefined;
  if (data.lat !== undefined || data.lng !== undefined) {
     processedCoordinates = {
      latitude: parseCoordinate(data.lat),
      longitude: parseCoordinate(data.lng),
    };
  } else if (data.coordinates && (data.coordinates.latitude !== undefined || data.coordinates.longitude !== undefined)) { 
    processedCoordinates = {
      latitude: parseCoordinate(data.coordinates.latitude),
      longitude: parseCoordinate(data.coordinates.longitude),
    };
  }


  return {
    id: document.id,
    name: data.name || 'Unnamed Space',
    brand: data.brand,
    status: data.status,
    country: data.country || 'Unknown Country',
    city: data.city || 'Unknown City',
    address: displayAddress,
    coordinates: processedCoordinates, 
    // description: data.description || 'No description available.', // Removed
    amenities: amenitiesArray,
    currency: data.currency || data.budget_range?.currency,
    min_price: typeof data.min_price === 'number' ? data.min_price : undefined,
    monthlyPrice: typeof data.min_price === 'number' ? data.min_price : (data.budget_range?.min || 0),
    budget_range: data.budget_range,
    website: data.website,
    websiteUrl: data.website,
    phone: data.phone,
    email: data.email,
    logo: data.logo, 
    logoUrl: data.logo ?? `https://placehold.co/80x80/E0E0E0/757575.png`,
    cover_image: data.cover_image, 
    mainImageUrl: finalMainImageUrl, // Still needed for ImageSlider fallback if gallery is empty
    gallery: Array.isArray(data.gallery) ? data.gallery.filter((g: any) => typeof g === 'string' && g.trim() !== '') : [],
    rating: typeof data.rating === 'number' ? data.rating : undefined,
    reviews_count: typeof data.reviews_count === 'number' ? data.reviews_count : undefined,
    flag_url: data.flag_url,
    flag_code: data.flag_code,
    country_code: data.country_code,
    region: data.region,
    coworking_access: data.coworking_access,
    room_types: Array.isArray(data.room_types) ? data.room_types : [],
    vibe: data.vibe,
    tags: Array.isArray(data.tags) ? data.tags.filter((t: any) => typeof t === 'string') : [],
    youtube_video_link: data.youtube_video_link,
    videoUrl: data.youtube_video_link,
    contact: data.contact || { email: data.email, phone: data.phone, whatsapp: data.whatsappLink },
    whatsappLink: data.contact?.whatsapp || data.whatsapp, 
    capacity: typeof data.capacity === 'number' ? data.capacity : undefined,
    minimum_stay: data.minimum_stay,
    check_in: data.check_in,
    languages: Array.isArray(data.languages) ? data.languages.filter((l: any) => typeof l === 'string') : [],
    age_range: data.age_range,
    wifi_speed: data.wifi_speed,
    climate: data.climate,
    timezone: data.timezone,
    nearby_attractions: Array.isArray(data.nearby_attractions) ? data.nearby_attractions.filter((na: any) => typeof na === 'string') : [],
    transportation: data.transportation,
    created_at: formatDate(data.created_at),
    updated_at: formatDate(data.updated_at),
    hasCoworking: hasCoworkingDerived,
    hasPrivateBathroom: hasPrivateBathroomDerived,
    dataAiHint: data.dataAiHint || (data.city && data.country ? `${data.city.toLowerCase()} ${data.country.toLowerCase()}`.trim().substring(0,50) : "building office")
  };
};

export async function getAllColivingSpaces(): Promise<ColivingSpace[]> {
  try {
    const colivingsCollectionRef = collection(db, 'colivings');
    const querySnapshot = await getDocs(query(colivingsCollectionRef));

    const spaces: ColivingSpace[] = [];
    querySnapshot.forEach((document) => {
      spaces.push(mapDocToColivingSpace(document));
    });

    return spaces;

  } catch (error) {
    console.error("Error fetching coliving spaces from Firestore:", error);
    return [];
  }
}

export async function getColivingSpaceById(id: string): Promise<ColivingSpace | null> {
  try {
    if (!id) {
      console.error("Error: No ID provided to getColivingSpaceById");
      return null;
    }
    const docRef = doc(db, 'colivings', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return mapDocToColivingSpace(docSnap);
    } else {
      console.warn(`No coliving space found with id: ${id} in Firestore.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching coliving space with id ${id} from Firestore:`, error);
    return null;
  }
}

const mapDocToCountryWithCommunities = (docSnap: QueryDocumentSnapshot<DocumentData>): CountryWithCommunities => {
  const data = docSnap.data();
  if (!data || typeof data.name !== 'string' || typeof data.code !== 'string') {
    console.error(`Country document ID ${docSnap.id} is missing required fields (name, code) or data is undefined.`);
    return {
      id: docSnap.id,
      name: 'Error: Invalid Country Data',
      code: '',
      communities: [],
      flagImageUrl: 'https://placehold.co/64x42/E0E0E0/757575.png', // Added for consistency
    };
  }

  let flagImageUrl: string | undefined = undefined;
  if (data.code && typeof data.code === 'string' && data.code.trim() !== '') {
    const flagPath = `/flags/${data.code.trim().toLowerCase()}.png`;
    flagImageUrl = flagPath;
  }


  const communitiesArray: Community[] = Array.isArray(data.communities)
    ? data.communities.map((communityData: any, index: number): Community => {
        if (!communityData || typeof communityData.name !== 'string' || typeof communityData.platform !== 'string' || typeof communityData.groupLink !== 'string') {
          console.warn(`Community object at index ${index} for country ${data.name} (ID: ${docSnap.id}) is missing required fields (name, platform, groupLink).`);
          return { 
            id: communityData.id || `community_${docSnap.id}_${index}_error`,
            name: 'Error: Invalid Community Data',
            platform: 'Unknown',
            groupLink: '#',
          };
        }
        return {
          id: communityData.id || `community_${docSnap.id}_${index}`,
          name: communityData.name,
          platform: communityData.platform,
          city: typeof communityData.city === 'string' ? communityData.city : undefined,
          groupLink: communityData.groupLink,
          memberCount: typeof communityData.memberCount === 'number' ? communityData.memberCount : undefined,
          membersText: typeof communityData.membersText === 'string' ? communityData.membersText : undefined,
          tags: Array.isArray(communityData.tags) ? communityData.tags.filter((t: any) => typeof t === 'string') : [],
          requirementToJoin: typeof communityData.requirementToJoin === 'string' ? communityData.requirementToJoin : undefined,
          flag: typeof communityData.flag === 'string' ? communityData.flag : data.flag, 
        };
      })
    : [];

  if (data.communities !== undefined && !Array.isArray(data.communities)) {
      console.warn(`'communities' field for country ${data.name} (ID: ${docSnap.id}) is not an array. Defaulting to empty array. Received:`, data.communities);
  }


  return {
    id: docSnap.id,
    code: data.code,
    name: data.name,
    cover_image: typeof data.cover_image === 'string' ? data.cover_image : undefined,
    flag: typeof data.flag === 'string' ? data.flag : '🏳️',
    flagImageUrl: flagImageUrl,
    continent: typeof data.continent === 'string' ? data.continent : undefined,
    currency: typeof data.currency === 'string' ? data.currency : undefined,
    timezone: typeof data.timezone === 'string' ? data.timezone : undefined,
    popular_cities: Array.isArray(data.popular_cities) ? data.popular_cities.filter((pc: any) => typeof pc === 'string') : [],
    coliving_count: typeof data.coliving_count === 'number' ? data.coliving_count : undefined,
    source: typeof data.source === 'string' ? data.source : undefined,
    community_count: typeof data.community_count === 'number' ? data.community_count : (Array.isArray(data.communities) ? data.communities.length : 0),
    community_members: typeof data.community_members === 'number' ? data.community_members : undefined,
    community_cities: Array.isArray(data.community_cities) ? data.community_cities.filter((cc: any) => typeof cc === 'string') : [],
    community_platforms: Array.isArray(data.community_platforms) ? data.community_platforms.filter((cp: any) => typeof cp === 'string') : [],
    communities: communitiesArray,
  };
};


export async function getAllCountriesFromDB(): Promise<CountryWithCommunities[]> {
  try {
    const countriesCollectionRef = collection(db, 'countries'); 
    const q = query(countriesCollectionRef);
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn("getAllCountriesFromDB: Firestore query for 'countries' collection returned an empty snapshot. Collection might be empty or not exist.");
      return [];
    }
    
    const countries: CountryWithCommunities[] = [];
    querySnapshot.forEach((document) => {
      countries.push(mapDocToCountryWithCommunities(document)); 
    });
    
    const validCountries = countries.filter(country => country.name !== 'Error: Invalid Country Data');
    
    if (validCountries.length !== countries.length) {
        console.warn("getAllCountriesFromDB: Some country documents were invalid and filtered out.");
    }

    return validCountries.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching countries (with communities) from Firestore 'countries' collection:", error);
    return [];
  }
}

const mapDocToColivingReviewData = (doc: QueryDocumentSnapshot<DocumentData>): ColivingReviewData => {
  const data = doc.data();

  const reviewsArray: ReviewItem[] = (data.reviews && Array.isArray(data.reviews))
    ? data.reviews.map((reviewItem: any, index: number): ReviewItem => ({
        id: reviewItem.id || `${doc.id}_review_${index}`,
        coliving_id: reviewItem.coliving_id || data.coliving_id,
        coliving_name: reviewItem.coliving_name || data.coliving_name,
        author_name: reviewItem.author_name || 'Anonymous',
        author_url: reviewItem.author_url,
        profile_photo_url: reviewItem.profile_photo_url || 'https://placehold.co/48x48.png',
        rating: typeof reviewItem.rating === 'number' ? reviewItem.rating : 0,
        relative_time_description: reviewItem.relative_time_description || 'sometime ago',
        time: typeof reviewItem.time === 'number' ? reviewItem.time : 0,
        text: typeof reviewItem.text === 'string' ? reviewItem.text : (reviewItem.text === null ? null : 'No review text provided.'),
        language: reviewItem.language,
        translated: reviewItem.translated,
        original_language: reviewItem.original_language,
        review_length: reviewItem.review_length,
        is_recent: reviewItem.is_recent,
        sentiment_score: reviewItem.sentiment_score,
      }))
    : [];

  return {
    id: doc.id, 
    coliving_id: data.coliving_id,
    coliving_name: data.coliving_name,
    coliving_city: data.coliving_city,
    coliving_country: data.coliving_country,
    coliving_website: data.coliving_website,
    google_place_id: data.google_place_id,
    google_name: data.google_name,
    google_address: data.google_address,
    google_rating: typeof data.google_rating === 'number' ? data.google_rating : undefined,
    google_total_ratings: typeof data.google_total_ratings === 'number' ? data.google_total_ratings : undefined,
    google_website: data.google_website,
    google_phone: data.google_phone,
    total_reviews: typeof data.total_reviews === 'number' ? data.total_reviews : reviewsArray.length,
    recent_reviews_count: data.recent_reviews_count,
    average_sentiment: data.average_sentiment,
    reviews: reviewsArray,
    crawled_at: data.crawled_at instanceof Timestamp ? data.crawled_at.toDate().toISOString() : data.crawled_at,
    api_status: data.api_status,
  };
};

export async function getColivingReviewsByColivingId(colivingId: string): Promise<ColivingReviewData | null> {
  if (!colivingId) {
    console.error("getColivingReviewsByColivingId: colivingId is required.");
    return null;
  }
  try {
    const reviewsCollectionRef = collection(db, 'coliving_reviews');
    const q = query(reviewsCollectionRef, where('coliving_id', '==', colivingId), firestoreLimit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`No review data found in 'coliving_reviews' for coliving_id: ${colivingId}`);
      return null;
    }
    const reviewDoc = querySnapshot.docs[0];
    return mapDocToColivingReviewData(reviewDoc);

  } catch (error) {
    console.error(`Error fetching reviews for coliving_id ${colivingId} from Firestore:`, error);
    return null;
  }
}

// --- Nearby Places Service ---
// Fetches a single document from 'coliving_nearby_places' where doc ID is colivingId
// and processes its categorized places.
// Returns an array of objects, each representing a category with its places.
export async function getNearbyPlaces(colivingId: string): Promise<CategorizedNearbyPlaceGroup[]> {
  if (!colivingId) {
    console.error("getNearbyPlaces: colivingId is required.");
    return [];
  }
  try {
    const docRef = doc(db, 'coliving_nearby_places', colivingId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.warn(`No nearby places document found in 'coliving_nearby_places' for coliving_id: ${colivingId}`);
      return [];
    }
    
    const docData = docSnap.data() as FirestoreNearbyPlacesDoc;
    const categorizedPlaces: CategorizedNearbyPlaceGroup[] = [];

    if (docData.nearby_places && typeof docData.nearby_places === 'object') {
      for (const categoryKey in docData.nearby_places) {
        const categoryPlacesData = docData.nearby_places[categoryKey];
        if (Array.isArray(categoryPlacesData) && categoryPlacesData.length > 0) {
          const places: NearbyPlace[] = categoryPlacesData.map(place => {
            let locationLink;
            if (place.coordinates?.lat && place.coordinates?.lng) {
                locationLink = `https://www.google.com/maps?q=${place.coordinates.lat},${place.coordinates.lng}`;
            }
            
            const defaultDataAiHint = `${categoryKey.toLowerCase()} ${place.name?.toLowerCase() || 'place'}`.trim().substring(0, 50);

            return {
              id: place.place_id,
              coliving_id: colivingId,
              name: place.name || 'Unnamed Place',
              type: categoryKey, 
              googleTypes: place.types || [],
              distance_meters: typeof place.distance_meters === 'number' ? place.distance_meters : undefined,
              distance_walking_time: typeof place.distance_walking_time === 'number' ? place.distance_walking_time : null,
              rating: place.rating,
              user_ratings_total: place.user_ratings_total,
              price_level: place.price_level,
              address_vicinity: place.vicinity,
              coordinates: place.coordinates,
              business_status: place.business_status,
              locationLink: locationLink,
              dataAiHint: defaultDataAiHint,
            };
          }).sort((a, b) => (a.distance_meters ?? Infinity) - (b.distance_meters ?? Infinity)); // Sort places within category

          // Create a user-friendly display name for the category
          let categoryDisplayName = categoryKey.replace(/_/g, ' ');
          categoryDisplayName = categoryDisplayName.charAt(0).toUpperCase() + categoryDisplayName.slice(1);
          if (!categoryDisplayName.toLowerCase().endsWith('s') && categoryDisplayName.toLowerCase() !== 'food' && categoryDisplayName.toLowerCase() !== 'nightlife' && categoryDisplayName.toLowerCase() !== 'shopping') {
             categoryDisplayName += 's';
          }


          categorizedPlaces.push({
            categoryKey: categoryKey,
            categoryDisplayName: categoryDisplayName,
            places: places,
          });
        }
      }
    }
    // Sort categories by a predefined order or alphabetically if needed
    // For now, using the order they appear in the Firestore document
    return categorizedPlaces;
  } catch (error) {
    console.error(`Error fetching or processing nearby places for coliving_id ${colivingId} from Firestore:`, error);
    return [];
  }
}
