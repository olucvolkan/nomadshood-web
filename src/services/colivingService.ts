
import { db } from '@/lib/firebase'; // db is Firestore instance
import { collection, getDocs, doc, getDoc, type DocumentData, type QueryDocumentSnapshot, query, Timestamp } from 'firebase/firestore';
import type { ColivingSpace, CountryData } from '@/types';

// Helper function to map Firestore document to ColivingSpace
const mapDocToColivingSpace = (document: QueryDocumentSnapshot<DocumentData> | DocumentData): ColivingSpace => {
  const rawData = document.data();
  
  if (!rawData) {
    console.error("Document data is undefined for document ID:", document.id);
    // Return a minimal valid ColivingSpace object to prevent further errors
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
      hasPrivateBathroom: false,
      hasCoworking: false,
    } as ColivingSpace;
  }

  const data = { ...rawData };

  // Date conversions
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

  let hasCoworkingDerived = false;
  if (typeof data.coworking_access === 'string') {
    const access = data.coworking_access.toLowerCase();
    hasCoworkingDerived = access.includes('yes') || access.includes('available') || access.includes('24/7');
  } else if (typeof data.coworking_access === 'boolean') {
    hasCoworkingDerived = data.coworking_access;
  }

  const amenitiesArray: string[] = Array.isArray(data.amenities) ? data.amenities.filter((a: any) => typeof a === 'string') : [];
  const hasPrivateBathroomDerived = amenitiesArray.some((amenity: string) => 
    amenity.toLowerCase().includes('private bathroom')
  );

  // Construct logoUrl (for list/card views)
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  let dynamicLogoUrl = data.cover_image || `https://placehold.co/80x80/E0E0E0/757575.png`; 
  if (!data.cover_image && storageBucket && document.id) {
    // Assumes logo filenames are [document.id].png (or other common extensions) in the 'coliving-logos' folder
    // We'll try .png, .jpg, .jpeg. For a robust solution, store the filename/extension in Firestore.
    const logoPathPng = `coliving-logos%2F${document.id}.png`; 
    // This example primarily uses the cover_image field as the source for logoUrl and mainImageUrl.
    // If you want to specifically use a file from coliving-logos based on ID, you'd adjust here.
    // For simplicity, if cover_image is missing, we use a placeholder.
    // If you have specific logic to check for existence in coliving-logos, it would go here.
    // For now, if data.cover_image is present, it's used. Otherwise, a placeholder.
  } else if (!storageBucket && !data.cover_image) {
    // console.warn("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set and no cover_image provided. Falling back to placeholder for logoUrl for space ID:", document.id);
  }
  
  // For the main image on detail page, prefer cover_image if it exists, else fallback to a larger placeholder if logo was also a placeholder
  let mainImageUrl = data.cover_image || `https://placehold.co/600x400/E0E0E0/757575.png`;

  // Construct display address
  let displayAddress = 'Location not specified';
  if (data.location && typeof data.location === 'string' && data.location.trim() !== '') {
    displayAddress = data.location;
  } else if (data.city && data.country) {
    displayAddress = `${data.city}, ${data.country}`;
  } else if (data.city) {
    displayAddress = data.city;
  } else if (data.country) {
    displayAddress = data.country;
  }

  return {
    id: document.id,
    name: data.name || 'Unnamed Space',
    description: data.description || 'No description available.',
    
    // Use the constructed displayAddress
    address: displayAddress, 
    
    country: data.country || 'Unknown Country',
    city: data.city || 'Unknown City',
    region: data.region,
    coordinates: data.coordinates, // Keep original coordinates object
    
    average_budget: data.average_budget,
    budget_range: data.budget_range,
    
    gallery: Array.isArray(data.gallery) ? data.gallery.filter((g: any) => typeof g === 'string') : [],
    coworking_access: data.coworking_access,
    amenities: amenitiesArray,
    room_types: Array.isArray(data.room_types) ? data.room_types : [],
    vibe: data.vibe,
    tags: Array.isArray(data.tags) ? data.tags.filter((t: any) => typeof t === 'string') : [],
    
    contact: data.contact || {},
    capacity: typeof data.capacity === 'number' ? data.capacity : undefined,
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

    // Derived fields for component consumption
    logoUrl: dynamicLogoUrl, // Primarily from cover_image or placeholder
    mainImageUrl: mainImageUrl, // Primarily from cover_image or larger placeholder
    monthlyPrice: data.budget_range?.min || 0,
    videoUrl: data.youtube_video_link,
    websiteUrl: data.website,
    whatsappLink: data.contact?.whatsapp,
    hasCoworking: hasCoworkingDerived,
    hasPrivateBathroom: hasPrivateBathroomDerived,
    dataAiHint: data.dataAiHint || `${data.city || ''} ${data.country || ''}`.trim().toLowerCase().substring(0,50) || "building exterior",
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

  if (data.code && storageBucket) {
    const flagPath = `flags%2F${data.code.toLowerCase()}.png`; 
    flagImageUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${flagPath}?alt=media`;
  } else if (!storageBucket) {
     // console.warn("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set in .env. Cannot construct flag image URLs for countries.");
  }


  return {
    id: document.id,
    code: data.code || '',
    name: data.name || 'Unnamed Country',
    cover_image: data.cover_image || 'https://placehold.co/600x400/E0E0E0/757575.png',
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
