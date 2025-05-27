
import { db } from '@/lib/firebase'; // db is Firestore instance
import { collection, getDocs, doc, getDoc, type DocumentData, type QueryDocumentSnapshot, query, Timestamp } from 'firebase/firestore';
import type { ColivingSpace, CountryData } from '@/types';

// Helper function to map Firestore document to ColivingSpace
const mapDocToColivingSpace = (document: QueryDocumentSnapshot<DocumentData> | DocumentData): ColivingSpace => {
  const rawData = document.data();
  
  if (!rawData) {
    console.error("Document data is undefined for document ID:", document.id);
    return {
      id: document.id,
      name: 'Error: Missing Data',
      address: 'N/A', // Mapped from location
      logoUrl: 'https://placehold.co/600x400/E0E0E0/757575.png', // Mapped from cover_image
      description: 'Data for this coliving space could not be loaded.',
      country: 'Unknown',
      city: 'Unknown',
      monthlyPrice: 0, // Derived from budget_range.min
      dataAiHint: "placeholder image error",
    } as ColivingSpace;
  }

  const data = { ...rawData };

  // Date conversions
  const formatDate = (timestampField: any): string | undefined => {
    if (!timestampField) return undefined;
    if (typeof timestampField.toDate === 'function') { // Firestore Timestamp
      return timestampField.toDate().toISOString();
    } else if (typeof timestampField === 'string') { // ISO string
      return timestampField;
    } else if (typeof timestampField === 'object' && typeof timestampField.seconds === 'number') { // Plain object timestamp
      return new Date(timestampField.seconds * 1000 + (timestampField.nanoseconds || 0) / 1000000).toISOString();
    }
    return undefined;
  };

  let hasCoworking = false;
  if (typeof data.coworking_access === 'string') {
    const access = data.coworking_access.toLowerCase();
    hasCoworking = access.includes('yes') || access.includes('available') || access.includes('24/7');
  } else if (typeof data.coworking_access === 'boolean') {
    hasCoworking = data.coworking_access;
  }

  const amenitiesArray: string[] = Array.isArray(data.amenities) ? data.amenities.filter((a: any) => typeof a === 'string') : [];
  const hasPrivateBathroom = amenitiesArray.some((amenity: string) => 
    amenity.toLowerCase().includes('private bathroom')
  );

  return {
    id: document.id,
    name: data.name || 'Unnamed Space',
    address: data.location || 'Address not specified', 
    logoUrl: data.cover_image || 'https://placehold.co/300x200/E0E0E0/757575.png', // Smaller default for cards
    description: data.description || 'No description available.',
    videoUrl: data.youtube_video_link,
    whatsappLink: data.contact?.whatsapp,
    websiteUrl: data.website,
    tags: Array.isArray(data.tags) ? data.tags.filter((t: any) => typeof t === 'string') : [],
    dataAiHint: data.dataAiHint || `${data.city || ''} ${data.country || ''}`.trim().toLowerCase().substring(0,50) || "building exterior",

    country: data.country || 'Unknown Country',
    city: data.city || 'Unknown City',
    region: data.region,
    coordinates: data.coordinates,
    average_budget: data.average_budget,
    budget_range: data.budget_range,
    gallery: Array.isArray(data.gallery) ? data.gallery.filter((g: any) => typeof g === 'string') : [],
    coworking_access: data.coworking_access,
    amenities: amenitiesArray,
    room_types: Array.isArray(data.room_types) ? data.room_types : [],
    vibe: data.vibe,
    contact: data.contact,
    capacity: data.capacity,
    minimum_stay: data.minimum_stay,
    check_in: data.check_in,
    languages: Array.isArray(data.languages) ? data.languages.filter((l: any) => typeof l === 'string') : [],
    age_range: data.age_range,
    rating: typeof data.rating === 'number' ? data.rating : undefined,
    reviews_count: typeof data.reviews_count === 'number' ? data.reviews_count : undefined,
    wifi_speed: data.wifi_speed,
    climate: data.climate,
    timezone: data.timezone,
    nearby_attractions: Array.isArray(data.nearby_attractions) ? data.nearby_attractions.filter((na: any) => typeof na === 'string') : [],
    transportation: data.transportation,
    
    created_at: formatDate(data.created_at),
    updated_at: formatDate(data.updated_at),
    
    status: data.status,

    monthlyPrice: data.budget_range?.min || 0,
    hasPrivateBathroom: hasPrivateBathroom,
    hasCoworking: hasCoworking,
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
    
    if (spaces.length === 0) {
      console.warn("No coliving spaces found in Firestore collection 'colivings'.");
    }
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

// Fetches from 'countries' collection
const mapDocToCountryData = (document: QueryDocumentSnapshot<DocumentData> | DocumentData): CountryData => {
  const data = document.data();
  if (!data) {
    return {
      id: document.id,
      name: 'Error: Missing Data',
      code: '',
      cover_image: 'https://placehold.co/600x400/E0E0E0/757575.png',
      flag: '🏳️',
      coliving_count: 0,
    };
  }

  let flagImageUrl: string | undefined = undefined;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (data.code && storageBucket) {
    // Assumes flags are named like '[lowercase_country_code].png' in a 'flags/' folder
    const flagPath = `flags%2F${data.code.toLowerCase()}.png`;
    flagImageUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${flagPath}?alt=media`;
  } else if (!storageBucket) {
    console.warn("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set in .env. Cannot construct flag image URLs.");
  }


  return {
    id: document.id,
    code: data.code || '',
    name: data.name || 'Unnamed Country',
    cover_image: data.cover_image || 'https://placehold.co/600x400/E0E0E0/757575.png',
    flag: data.flag || '🏳️', // Emoji flag as fallback
    flagImageUrl: flagImageUrl, // URL from Firebase Storage
    continent: data.continent,
    currency: data.currency,
    timezone: data.timezone,
    popular_cities: Array.isArray(data.popular_cities) ? data.popular_cities.filter((pc: any) => typeof pc === 'string') : [],
    coliving_count: typeof data.coliving_count === 'number' ? data.coliving_count : 0,
  };
};

export async function getAllCountriesFromDB(): Promise<CountryData[]> {
  try {
    const countriesCollectionRef = collection(db, 'countries');
    const q = query(countriesCollectionRef); 
    const querySnapshot = await getDocs(q);
    
    const countries: CountryData[] = [];
    querySnapshot.forEach((document) => {
      countries.push(mapDocToCountryData(document));
    });
    
    if (countries.length === 0) {
      console.warn("No countries found in Firestore collection 'countries'. Ensure this collection exists and has data.");
    }
    return countries.sort((a, b) => a.name.localeCompare(b.name)); 
  } catch (error) {
    console.error("Error fetching countries from Firestore:", error);
    return [];
  }
}
  
```