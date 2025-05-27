
import { db } from '@/lib/firebase'; // db is Firestore instance
import { collection, getDocs, doc, getDoc, type DocumentData, type QueryDocumentSnapshot, query, Timestamp } from 'firebase/firestore';
import type { ColivingSpace } from '@/types';

// Helper function to map Firestore document to ColivingSpace
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
      description: 'Data for this coliving space could not be loaded.',
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

  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  let finalLogoUrl: string;
  let finalMainImageUrl: string;

  // Construct logoUrl from data.logo (filename)
  if (data.logo && typeof data.logo === 'string' && data.logo.trim() !== '' && storageBucket) {
    const logoFilename = data.logo.trim();
    // Ensure logoFilename doesn't start with a slash if it's just a filename
    const fullLogoPath = `coliving-logos/${logoFilename.startsWith('/') ? logoFilename.substring(1) : logoFilename}`;
    finalLogoUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(fullLogoPath)}?alt=media`;
  } else {
    finalLogoUrl = 'https://placehold.co/80x80/E0E0E0/757575.png';
    if (!storageBucket && data.logo && typeof data.logo === 'string' && data.logo.trim() !== '') {
      console.warn(`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set, but Firestore document ${document.id} has a logo filename ('${data.logo}'). Falling back to placeholder for logoUrl.`);
    }
  }

  // Determine mainImageUrl: 1. Gallery[0], 2. Actual Logo URL, 3. Large Placeholder
  if (Array.isArray(data.gallery) && data.gallery.length > 0 && typeof data.gallery[0] === 'string' && data.gallery[0].trim() !== '') {
    finalMainImageUrl = data.gallery[0].trim();
  } else if (finalLogoUrl !== 'https://placehold.co/80x80/E0E0E0/757575.png') {
    finalMainImageUrl = finalLogoUrl; // Use the actual logo if no gallery and logo isn't the placeholder
  } else {
    finalMainImageUrl = 'https://placehold.co/600x400/E0E0E0/757575.png';
  }
  
  const amenitiesArray: string[] = Array.isArray(data.amenities) ? data.amenities.filter((a: any) => typeof a === 'string') : [];
  
  let hasCoworkingDerived = false;
  if (typeof data.coworking_access === 'string') {
    const access = data.coworking_access.toLowerCase();
    hasCoworkingDerived = access.includes('yes') || access.includes('available');
  } else if (typeof data.coworking_access === 'boolean') {
    hasCoworkingDerived = data.coworking_access;
  }
  // Also check amenities for coworking
  if (!hasCoworkingDerived) {
    hasCoworkingDerived = amenitiesArray.some((amenity: string) => 
      amenity.toLowerCase().includes('coworking') || amenity.toLowerCase().includes('co-working')
    );
  }

  const hasPrivateBathroomDerived = amenitiesArray.some((amenity: string) => 
    amenity.toLowerCase().includes('private bathroom')
  );

  return {
    id: document.id,
    name: data.name || 'Unnamed Space',
    brand: data.brand,
    status: data.status,
    country: data.country || 'Unknown Country',
    city: data.city || 'Unknown City',
    address: data.address || (data.city && data.country ? `${data.city}, ${data.country}` : 'Location not specified'),
    lat: data.lat,
    lng: data.lng,
    coordinates: data.coordinates, // Keep original if present, useful for maps
    description: data.description || 'No description available.',
    amenities: amenitiesArray,
    currency: data.currency,
    min_price: typeof data.min_price === 'number' ? data.min_price : undefined,
    monthlyPrice: typeof data.min_price === 'number' ? data.min_price : (data.budget_range?.min || 0), // Prioritize min_price
    budget_range: data.budget_range,
    website: data.website,
    websiteUrl: data.website, // Map website to websiteUrl for component consistency
    phone: data.phone,
    email: data.email,
    logo: data.logo, // Keep the original filename if needed
    logoUrl: finalLogoUrl,
    mainImageUrl: finalMainImageUrl,
    gallery: Array.isArray(data.gallery) ? data.gallery.filter((g: any) => typeof g === 'string' && g.trim() !== '') : [],
    rating: typeof data.rating === 'number' ? data.rating : undefined,
    reviews_count: typeof data.reviews_count === 'number' ? data.reviews_count : undefined,
    flag_url: data.flag_url, // from your new sample
    flag_code: data.flag_code, // from your new sample
    country_code: data.country_code, // from your new sample
    
    // Fields from older structure or derived, ensure defaults or optional
    region: data.region,
    coworking_access: data.coworking_access, // Keep original string for display if needed
    room_types: Array.isArray(data.room_types) ? data.room_types : [],
    vibe: data.vibe,
    tags: Array.isArray(data.tags) ? data.tags.filter((t: any) => typeof t === 'string') : [],
    youtube_video_link: data.youtube_video_link,
    videoUrl: data.youtube_video_link, // Map for consistency
    contact: data.contact || { email: data.email, phone: data.phone, whatsapp: data.whatsappLink }, // Reconstruct contact if individual fields exist
    whatsappLink: data.contact?.whatsapp || data.whatsapp, // Support top-level or nested whatsapp
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
    dataAiHint: data.dataAiHint || (data.city && data.country ? `${data.city} ${data.country}`.trim().toLowerCase().substring(0,50) : "building office")
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
      continent: '',
      currency: '',
      timezone: '',
      popular_cities: [],
    };
  }

  let flagImageUrl: string | undefined = undefined;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (data.code && typeof data.code === 'string' && data.code.trim() !== '' && storageBucket) {
    const flagPath = `flags/${data.code.trim().toLowerCase()}.png`; 
    flagImageUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(flagPath)}?alt=media`;
  } else if (!storageBucket && data.code) {
     console.warn("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set in .env. Cannot construct flag image URLs for countries.");
  }


  return {
    id: document.id,
    code: data.code || '',
    name: data.name || 'Unnamed Country',
    cover_image: data.cover_image || 'https://placehold.co/600x400/E0E0E0/757575.png', // Default placeholder
    flag: data.flag || '🏳️', 
    flagImageUrl: flagImageUrl, 
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
    
    return countries.sort((a, b) => a.name.localeCompare(b.name)); 
  } catch (error) {
    console.error("Error fetching countries from Firestore:", error);
    return [];
  }
}
