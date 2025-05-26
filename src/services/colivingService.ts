
import { db } from '@/lib/firebase'; // db is Firestore instance
import { collection, getDocs, doc, getDoc, type DocumentData, type QueryDocumentSnapshot, query, Timestamp } from 'firebase/firestore';
import type { ColivingSpace } from '@/types';

// Helper function to map Firestore document to ColivingSpace
const mapDocToColivingSpace = (document: QueryDocumentSnapshot<DocumentData> | DocumentData): ColivingSpace => {
  const rawData = document.data();
  
  // Ensure rawData is not undefined before proceeding
  if (!rawData) {
    console.error("Document data is undefined for document ID:", document.id);
    // Return a minimal, valid ColivingSpace object or throw an error
    return {
      id: document.id,
      name: 'Error: Missing Data',
      address: 'N/A',
      logoUrl: 'https://placehold.co/600x400/E0E0E0/757575.png',
      description: 'Data for this coliving space could not be loaded.',
      country: 'Unknown',
      city: 'Unknown',
      monthlyPrice: 0,
      dataAiHint: "placeholder image error",
    } as ColivingSpace; // Cast to satisfy the type, some fields are missing
  }

  // Make a shallow copy to safely attempt modifications if necessary, though direct assignment is also fine.
  const data = { ...rawData };

  let createdAtStr: string | undefined = undefined;
  if (data.created_at) {
    if (typeof data.created_at.toDate === 'function') { // Check for Firestore Timestamp's toDate method
      createdAtStr = data.created_at.toDate().toISOString();
    } else if (typeof data.created_at === 'string') {
      createdAtStr = data.created_at; // Already a string
    } else if (typeof data.created_at === 'object' && typeof data.created_at.seconds === 'number' && typeof data.created_at.nanoseconds === 'number') {
      // Handle plain object representation of a Timestamp
      createdAtStr = new Date(data.created_at.seconds * 1000 + data.created_at.nanoseconds / 1000000).toISOString();
    }
  }

  let updatedAtStr: string | undefined = undefined;
  if (data.updated_at) {
    if (typeof data.updated_at.toDate === 'function') {
      updatedAtStr = data.updated_at.toDate().toISOString();
    } else if (typeof data.updated_at === 'string') {
      updatedAtStr = data.updated_at;
    } else if (typeof data.updated_at === 'object' && typeof data.updated_at.seconds === 'number' && typeof data.updated_at.nanoseconds === 'number') {
      updatedAtStr = new Date(data.updated_at.seconds * 1000 + data.updated_at.nanoseconds / 1000000).toISOString();
    }
  }

  let hasCoworking = false;
  if (typeof data.coworking_access === 'string') {
    const access = data.coworking_access.toLowerCase();
    hasCoworking = access.includes('yes') || access.includes('available') || access.includes('24/7');
  } else if (typeof data.coworking_access === 'boolean') {
    hasCoworking = data.coworking_access;
  }

  const amenitiesArray: string[] = Array.isArray(data.amenities) ? data.amenities : [];
  const hasPrivateBathroom = amenitiesArray.some((amenity: string) => 
    typeof amenity === 'string' && amenity.toLowerCase().includes('private bathroom')
  );

  return {
    id: document.id,
    name: data.name || 'Unnamed Space',
    address: data.location || 'Address not specified', 
    logoUrl: data.cover_image || 'https://placehold.co/600x400/E0E0E0/757575.png',
    description: data.description || 'No description available.',
    videoUrl: data.youtube_video_link,
    whatsappLink: data.contact?.whatsapp,
    websiteUrl: data.website,
    tags: data.tags || [],
    dataAiHint: data.dataAiHint || `${data.city || ''} ${data.country || ''}`.trim().toLowerCase().substring(0,50) || "building exterior",

    country: data.country || 'Unknown Country',
    city: data.city || 'Unknown City',
    region: data.region,
    coordinates: data.coordinates,
    average_budget: data.average_budget,
    budget_range: data.budget_range,
    gallery: data.gallery || [],
    coworking_access: data.coworking_access,
    amenities: amenitiesArray,
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
    
    created_at: createdAtStr,
    updated_at: updatedAtStr,
    
    status: data.status,

    monthlyPrice: data.budget_range?.min || 0,
    hasPrivateBathroom: hasPrivateBathroom,
    hasCoworking: hasCoworking,
  };
};

export async function getAllColivingSpaces(): Promise<ColivingSpace[]> {
  try {
    const colivingsCollectionRef = collection(db, 'colivings');
    const querySnapshot = await getDocs(query(colivingsCollectionRef)); // Added query for potential future ordering/filtering
    
    const spaces: ColivingSpace[] = [];
    querySnapshot.forEach((document) => {
      spaces.push(mapDocToColivingSpace(document));
    });
    
    if (spaces.length === 0) {
      console.warn("No coliving spaces found in Firestore collection 'colivings'. Ensure your .env file is correctly set up and the collection has data.");
    }
    return spaces;

  } catch (error) {
    console.error("Error fetching coliving spaces from Firestore:", error);
    // It's better to return an empty array than to crash if Firebase isn't set up during development.
    // Production builds should ideally fail if Firebase is essential and misconfigured.
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
  return {
    id: document.id,
    code: data.code || '',
    name: data.name || 'Unnamed Country',
    cover_image: data.cover_image || 'https://placehold.co/600x400/E0E0E0/757575.png',
    flag: data.flag || '🏳️',
    continent: data.continent,
    currency: data.currency,
    timezone: data.timezone,
    popular_cities: data.popular_cities || [],
    coliving_count: data.coliving_count || 0,
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
      console.warn("No countries found in Firestore collection 'countries'. Ensure your .env file is correctly set up and the collection has data.");
    }
    return countries.sort((a, b) => a.name.localeCompare(b.name)); 
  } catch (error) {
    console.error("Error fetching countries from Firestore:", error);
    return [];
  }
}
  