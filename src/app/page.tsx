
import type { ColivingSpace, CountryWithCommunities, NomadVideo } from '@/types';
import { getAllColivingSpaces, getAllCountriesFromDB } from '@/services/colivingService';
import { getNomadsHoodPodcastVideosFromFirestore } from '@/services/videoService';
import { getFirebaseStorageDownloadUrl } from '@/services/storageService';
import { HomePageClientContent } from '@/components/HomePageClientContent';

// This map defines image sources for countries.
// Values can be:
// 1. A simple filename (e.g., "colombia.jpg") - Assumed to be in Firebase Storage under 'explore-top-destinations/'.
// 2. A full path starting with '/' (e.g., "/popular_destination/spain.jpg") - Assumed to be a local public file.
const destinationImageFileMap: { [key: string]: string } = {
  'colombia': 'colombia.jpg',
  'costa rica': 'costa_rica.jpg',
  'indonesia': 'indonesia.jpg',
  'spain': '/popular_destination/spain.jpg', // Updated to use local public image for Spain
  'mexico': 'mexico.jpg',
  'portugal': 'porto.jpg',
  'usa': 'usa.jpg'
  // Add more mappings as needed
};

export default async function HomePage() {
  const allSpaces: ColivingSpace[] = await getAllColivingSpaces();
  let countriesData: CountryWithCommunities[] = await getAllCountriesFromDB();
  const nomadsHoodPodcastVideos: NomadVideo[] = await getNomadsHoodPodcastVideosFromFirestore();

  // Fetch image URLs for mapped country images
  const countriesWithImageUrls = await Promise.all(
    countriesData.map(async (country) => {
      const countryNameLower = country.name.toLowerCase();
      const mappedImageSource = destinationImageFileMap[countryNameLower];
      let updatedCountry = { ...country };

      if (mappedImageSource) {
        if (mappedImageSource.startsWith('/')) {
          // It's a local public file, assign to cover_image
          // next/image will handle paths starting with '/' as relative to the public directory
          updatedCountry.cover_image = mappedImageSource;
          // Optionally, update dataAiHint if specific to the local image
          if (countryNameLower === 'spain') {
            updatedCountry.dataAiHint = 'madrid cityscape gran via';
          }
        } else {
          // It's a Firebase Storage file, fetch download URL
          const imagePath = `explore-top-destinations/${mappedImageSource}`;
          const downloadUrl = await getFirebaseStorageDownloadUrl(imagePath);
          if (downloadUrl) {
            updatedCountry.firebaseCoverImageUrl = downloadUrl;
          }
          // Retain existing dataAiHint logic or set a default if needed
          // For Firebase images, the hint is usually generated in HomePageClientContent or based on country name
        }
      }
      return updatedCountry;
    })
  );
  
  return (
    <HomePageClientContent
      allSpaces={allSpaces}
      allCountries={countriesWithImageUrls} // Used for "Popular Destinations"
      nomadsHoodPodcastVideos={nomadsHoodPodcastVideos}
      countriesWithCommunities={countriesWithImageUrls} // Used for "Connect with Nomad Communities"
    />
  );
}
