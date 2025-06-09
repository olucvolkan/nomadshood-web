import { getAllColivingSpaces, getAllCountriesFromDB } from '@/services/colivingService'; // Add getAllCountriesFromDB
import { getNomadsHoodPodcastVideosFromFirestore } from '@/services/videoService';
import type { ColivingSpace, CountryWithCommunities, NomadVideo } from '@/types';
import type { Metadata } from 'next';
// getFirebaseStorageDownloadUrl might still be used if other image logic exists elsewhere, 
// but its direct use here for popular destinations is removed.
// import { getFirebaseStorageDownloadUrl } from '@/services/storageService'; 
import { HomePageClientContent } from '@/components/HomePageClientContent';
import { JsonLd } from '@/components/JsonLd';
import popularDestinationsData from '@/data/popular_destinations.json'; // Import the new JSON data

export const metadata: Metadata = {
  title: 'Home',
  description: 'Discover the best coliving spaces worldwide. Connect with digital nomad communities, watch authentic travel stories, and find your perfect home away from home.',
  openGraph: {
    title: 'NomadsHood - Your Gateway to Global Coliving',
    description: 'Discover the best coliving spaces worldwide. Connect with digital nomad communities, watch authentic travel stories, and find your perfect home away from home.',
    images: ['/og-home.jpg'],
  },
  twitter: {
    title: 'NomadsHood - Your Gateway to Global Coliving',
    description: 'Discover the best coliving spaces worldwide. Connect with digital nomad communities, watch authentic travel stories, and find your perfect home away from home.',
  },
  alternates: {
    canonical: '/'
  }
};

// Country name to country code mapping
const countryNameToCode: Record<string, string> = {
  'Spain': 'es',
  'Portugal': 'pt',
  'Mexico': 'mx',
  'Costa Rica': 'cr',
  'United States': 'us',
  'Indonesia': 'id',
  'Colombia': 'co',
  'Thailand': 'th',
  'Brazil': 'br',
};

export default async function HomePage() {
  const allSpaces: ColivingSpace[] = await getAllColivingSpaces();
  const nomadsHoodPodcastVideos: NomadVideo[] = await getNomadsHoodPodcastVideosFromFirestore();

  // Fetch countries with communities from Firestore
  const countriesWithCommunities: CountryWithCommunities[] = await getAllCountriesFromDB();

  // Prepare countries data from popular_destinations.json (only for Popular Destinations section)
  const processedPopularDestinations: CountryWithCommunities[] = popularDestinationsData.destinations.map(dest => {
    const countryCode = countryNameToCode[dest.country] || 'xx'; // fallback to 'xx' if not found
    
    return {
    // Ensure the structure matches the CountryWithCommunities type definition.
    id: dest.country.toLowerCase().replace(/\s+/g, '-'), // Example: 'costa-rica'
      code: countryCode, // Add the country code
    name: dest.country,
    coliving_count: dest.coliving_count, // Assumed to be part of CountryWithCommunities or handled by component
      flag: dest.country_flag,     // Keep emoji flag as fallback
      flagImageUrl: `/flags/${countryCode}.png`, // Use local flag image
    
    // country_image_link from JSON is a full URL.
    // Assign to firebaseCoverImageUrl, assuming it's for any remote URLs.
    firebaseCoverImageUrl: dest.country_image_link, 
    cover_image: undefined, // Explicitly set to undefined as firebaseCoverImageUrl is used for the remote URL

    // Default or placeholder values for other potential fields in CountryWithCommunities:
    communities: [], // Assuming an empty array or that this field is optional
    dataAiHint: `Beautiful view of ${dest.country}`, // Generic AI hint
    // Add any other fields required by CountryWithCommunities with default/derived values as necessary
    };
  });

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "NomadsHood",
    "description": "Discover the best coliving spaces worldwide. Connect with digital nomad communities, watch authentic travel stories, and find your perfect home away from home.",
    "url": "https://nomadshood.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://nomadshood.com/coliving?country={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "NomadsHood",
      "url": "https://nomadshood.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://nomadshood.com/logo.png"
      }
    }
  };
  
  return (
    <>
      <JsonLd data={structuredData} />
    <HomePageClientContent
      allSpaces={allSpaces}
        allCountries={processedPopularDestinations} // Used for "Popular Destinations" (from JSON)
      nomadsHoodPodcastVideos={nomadsHoodPodcastVideos}
        countriesWithCommunities={countriesWithCommunities} // Now uses Firestore data with actual communities
    />
    </>
  );
}
