
import type { ColivingSpace, CountryWithCommunities, NomadVideo } from '@/types';
import { getAllColivingSpaces } from '@/services/colivingService'; // getAllCountriesFromDB removed
import { getNomadsHoodPodcastVideosFromFirestore } from '@/services/videoService';
// getFirebaseStorageDownloadUrl might still be used if other image logic exists elsewhere, 
// but its direct use here for popular destinations is removed.
// import { getFirebaseStorageDownloadUrl } from '@/services/storageService'; 
import { HomePageClientContent } from '@/components/HomePageClientContent';
import popularDestinationsData from '@/data/popular_destinations.json'; // Import the new JSON data

export default async function HomePage() {
  const allSpaces: ColivingSpace[] = await getAllColivingSpaces();
  const nomadsHoodPodcastVideos: NomadVideo[] = await getNomadsHoodPodcastVideosFromFirestore();

  // Prepare countries data from popular_destinations.json
  // This data will be used for both "Popular Destinations" and "Connect with Nomad Communities" sections as per original structure
  const processedPopularDestinations: CountryWithCommunities[] = popularDestinationsData.destinations.map(dest => ({
    // Ensure the structure matches the CountryWithCommunities type definition.
    id: dest.country.toLowerCase().replace(/\s+/g, '-'), // Example: 'costa-rica'
    name: dest.country,
    coliving_count: dest.coliving_count, // Assumed to be part of CountryWithCommunities or handled by component
    country_flag: dest.country_flag,     // Assumed to be part of CountryWithCommunities or handled by component
    
    // country_image_link from JSON is a full URL.
    // Assign to firebaseCoverImageUrl, assuming it's for any remote URLs.
    firebaseCoverImageUrl: dest.country_image_link, 
    cover_image: undefined, // Explicitly set to undefined as firebaseCoverImageUrl is used for the remote URL

    // Default or placeholder values for other potential fields in CountryWithCommunities:
    communities: [], // Assuming an empty array or that this field is optional
    dataAiHint: `Beautiful view of ${dest.country}`, // Generic AI hint
    // Add any other fields required by CountryWithCommunities with default/derived values as necessary
  }));
  
  return (
    <HomePageClientContent
      allSpaces={allSpaces}
      allCountries={processedPopularDestinations} // Used for "Popular Destinations"
      nomadsHoodPodcastVideos={nomadsHoodPodcastVideos}
      countriesWithCommunities={processedPopularDestinations} // Also updated for "Connect with Nomad Communities"
    />
  );
}
