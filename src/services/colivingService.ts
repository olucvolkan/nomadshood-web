
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

  const isValidHttpUrl = (string: string): boolean => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;  
    }
  }

  // 1. Construct finalLogoUrl (for cards, smaller image)
  let finalLogoUrl: string;
  if (data.logo && typeof data.logo === 'string' && isValidHttpUrl(data.logo)) {
    finalLogoUrl = data.logo;
  } else {
    if (data.logo && typeof data.logo === 'string') { // Log if it was a string but not a valid URL
        console.warn(`Document ID ${document.id}: 'logo' field ('${data.logo}') is not a valid absolute URL. Using placeholder for logoUrl.`);
    }
    finalLogoUrl = `https://placehold.co/80x80/E0E0E0/757575.png`;
  }

  // 2. Construct finalMainImageUrl (for detail page, larger image)
  let finalMainImageUrl: string | undefined = undefined;

  // Try gallery first
  if (Array.isArray(data.gallery) && data.gallery.length > 0 && typeof data.gallery[0] === 'string' && isValidHttpUrl(data.gallery[0])) {
    finalMainImageUrl = data.gallery[0];
  }

  // Try cover_image if gallery didn't provide a URL
  if (!finalMainImageUrl && data.cover_image && typeof data.cover_image === 'string' && isValidHttpUrl(data.cover_image)) {
    finalMainImageUrl = data.cover_image;
  }
  
  // Fallback to finalLogoUrl if it's not the small placeholder and is a valid URL
  if (!finalMainImageUrl && finalLogoUrl !== `https://placehold.co/80x80/E0E0E0/757575.png` && isValidHttpUrl(finalLogoUrl)) {
      finalMainImageUrl = finalLogoUrl;
  }

  // Final fallback to large placeholder if no valid main image found
  if (!finalMainImageUrl || !isValidHttpUrl(finalMainImageUrl)) {
    if (finalMainImageUrl) { // Log if it was set but then deemed invalid
        console.warn(`Document ID ${document.id}: 'finalMainImageUrl' ('${finalMainImageUrl}') was not a valid absolute URL. Using large placeholder.`);
    }
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
  } else if (data.address && typeof data.address === 'string' && data.address.trim() !== '') { // Fallback to direct address field if location is missing
    displayAddress = data.address;
  } else if (data.city && data.country) {
    displayAddress = `${data.city}, ${data.country}`;
  }


  return {
    id: document.id,
    name: data.name || 'Unnamed Space',
    brand: data.brand,
    status: data.status,
    country: data.country || 'Unknown Country',
    city: data.city || 'Unknown City',
    address: displayAddress,
    lat: typeof data.lat === 'number' ? data.lat : (data.coordinates?.latitude),
    lng: typeof data.lng === 'number' ? data.lng : (data.coordinates?.longitude),
    coordinates: data.coordinates, // Keep original object if present
    description: data.description || 'No description available.',
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
    logoUrl: finalLogoUrl,
    cover_image: data.cover_image, 
    mainImageUrl: finalMainImageUrl,
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
    contact: data.contact || { email: data.email, phone: data.phone, whatsapp: data.whatsappLink }, // Ensure contact object exists
    whatsappLink: data.contact?.whatsapp || data.whatsapp, // Prioritize contact.whatsapp
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
      // For single document, docSnap itself is the DocumentData, not QueryDocumentSnapshot
      // So we directly pass it to mapDocToColivingSpace
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


const mapDocToCountryData = (document: QueryDocumentSnapshot<DocumentData> | DocumentData): CountryData => {
  const data = document.data() as Partial<CountryData> & { code?: string; name?: string; cover_image?: string; flag?: string; coliving_count?: number; };
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
     console.warn("Firebase Storage Bucket (NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) is not set in .env. Cannot construct flag image URLs for countries. Ensure this variable is set and your server is restarted.");
  }


  return {
    id: document.id,
    code: data.code || '',
    name: data.name || 'Unnamed Country',
    cover_image: data.cover_image || 'https://placehold.co/600x400/E0E0E0/757575.png',
    flag: data.flag || '🏳️',
    flagImageUrl: flagImageUrl,
    continent: data.continent || '',
    currency: data.currency || '',
    timezone: data.timezone || '',
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
