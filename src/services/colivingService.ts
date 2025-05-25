
import { db } from '@/lib/firebase'; // db is Firestore instance
import { collection, getDocs, doc, getDoc, type DocumentData, type QueryDocumentSnapshot, query, where } from 'firebase/firestore';
import type { ColivingSpace, CountryData } from '@/types';

// Helper function to map Firestore document to ColivingSpace
const mapDocToColivingSpace = (document: QueryDocumentSnapshot<DocumentData> | DocumentData): ColivingSpace => {
  const data = document.data();
  
  // Basic check for essential data
  if (!data) {
    console.error("Document data is undefined for document ID:", document.id);
    // Return a minimal valid ColivingSpace or throw an error
    return {
      id: document.id,
      name: 'Error: Missing Data',
      address: 'N/A',
      logoUrl: 'https://placehold.co/100x100.png',
      description: 'Data for this coliving space could not be loaded.',
      country: 'Unknown',
      city: 'Unknown',
      monthlyPrice: 0,
    } as ColivingSpace;
  }

  let hasCoworking = false;
  if (typeof data.coworking_access === 'string') {
    hasCoworking = data.coworking_access.toLowerCase().includes('yes');
  } else if (typeof data.coworking_access === 'boolean') {
    hasCoworking = data.coworking_access;
  }

  return {
    id: document.id,
    name: data.name || 'Unnamed Space',
    address: data.location || 'Address not specified', // Map 'location' to 'address'
    logoUrl: data.cover_image || 'https://placehold.co/600x400.png', // Map 'cover_image' to 'logoUrl'
    description: data.description || 'No description available.',
    videoUrl: data.youtube_video_link,
    slackLink: data.slackLink, // Not in new JSON, will be undefined
    whatsappLink: data.contact?.whatsapp,
    websiteUrl: data.website,
    tags: data.tags || [],
    dataAiHint: data.dataAiHint || `${data.city || ''} ${data.country || ''}`.trim(),

    country: data.country || 'Unknown Country',
    city: data.city || 'Unknown City',
    region: data.region,
    coordinates: data.coordinates,
    average_budget: data.average_budget,
    budget_range: data.budget_range,
    gallery: data.gallery || [],
    coworking_access: data.coworking_access,
    amenities: data.amenities || [],
    room_types: data.room_types || [],
    vibe: data.vibe,
    contact: data.contact,
    capacity: data.capacity,
    minimum_stay: data.minimum_stay,
    check_in: data.check_in,
    languages: data.languages || [],
    age_range: data.age_range,
    rating: data.rating,
    reviews_count: data.reviews_count,
    wifi_speed: data.wifi_speed,
    climate: data.climate,
    timezone: data.timezone,
    nearby_attractions: data.nearby_attractions || [],
    transportation: data.transportation,
    created_at: data.created_at,
    updated_at: data.updated_at,
    status: data.status,

    // Derived fields
    monthlyPrice: data.budget_range?.min || 0,
    hasPrivateBathroom: data.hasPrivateBathroom || false, // Not in new JSON structure, defaults to false
    hasCoworking: hasCoworking,
  } as ColivingSpace;
};

export async function getAllColivingSpaces(): Promise<ColivingSpace[]> {
  try {
    const colivingsCollectionRef = collection(db, 'colivings');
    const querySnapshot = await getDocs(colivingsCollectionRef);
    
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
    return []; // Return empty array on error
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

// New function to get all countries from "countries" collection
const mapDocToCountryData = (document: QueryDocumentSnapshot<DocumentData> | DocumentData): CountryData => {
  const data = document.data();
  return {
    id: document.id,
    code: data?.code || '',
    name: data?.name || 'Unnamed Country',
    cover_image: data?.cover_image || 'https://placehold.co/600x400.png',
    flag: data?.flag || '🏳️',
    continent: data?.continent,
    currency: data?.currency,
    timezone: data?.timezone,
    popular_cities: data?.popular_cities || [],
    coliving_count: data?.coliving_count || 0,
  } as CountryData;
};

export async function getAllCountriesFromDB(): Promise<CountryData[]> {
  try {
    const countriesCollectionRef = collection(db, 'countries');
    const q = query(countriesCollectionRef); // Add orderBy if you want a specific order, e.g., orderBy("name")
    const querySnapshot = await getDocs(q);
    
    const countries: CountryData[] = [];
    querySnapshot.forEach((document) => {
      countries.push(mapDocToCountryData(document));
    });
    
    if (countries.length === 0) {
      console.warn("No countries found in Firestore collection 'countries'.");
    }
    return countries.sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
  } catch (error) {
    console.error("Error fetching countries from Firestore:", error);
    return [];
  }
}
