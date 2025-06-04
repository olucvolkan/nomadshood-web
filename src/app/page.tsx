
import type { ColivingSpace, CountryWithCommunities, NomadVideo } from '@/types';
import { getAllColivingSpaces, getAllCountriesFromDB } from '@/services/colivingService';
import { getNomadsHoodPodcastVideosFromFirestore } from '@/services/videoService';
import { getFirebaseStorageDownloadUrl } from '@/services/storageService'; // Import the new service
import { HomePageClientContent } from '@/components/HomePageClientContent';

// This map defines which image file in Firebase Storage corresponds to which country name.
// Ensure country names here (lowercase) match the 'name' field (converted to lowercase) from your Firestore 'countries' collection.
const destinationImageFileMap: { [key: string]: string } = {
  'colombia': 'colombia.jpg',
  'costa rica': 'costa_rica.jpg',
  'indonesia': 'indonesia.jpg',
  'spain': 'madrid.jpg', // Assuming madrid.jpg is for Spain
  'mexico': 'mexico.jpg',
  'portugal': 'porto.jpg', // Assuming porto.jpg is for Portugal
  'usa': 'usa.jpg'
  // Add more mappings as needed
};

export default async function HomePage() {
  const allSpaces: ColivingSpace[] = await getAllColivingSpaces();
  let countriesData: CountryWithCommunities[] = await getAllCountriesFromDB();
  const nomadsHoodPodcastVideos: NomadVideo[] = await getNomadsHoodPodcastVideosFromFirestore();

  // Fetch Firebase Storage download URLs for mapped country images
  const countriesWithImageUrls = await Promise.all(
    countriesData.map(async (country) => {
      const countryNameLower = country.name.toLowerCase();
      const mappedImageFile = destinationImageFileMap[countryNameLower];

      if (mappedImageFile) {
        const imagePath = `explore-top-destinations/${mappedImageFile}`;
        const downloadUrl = await getFirebaseStorageDownloadUrl(imagePath);
        if (downloadUrl) {
          return { ...country, firebaseCoverImageUrl: downloadUrl };
        }
      }
      return country; // Return original country if no mapping or URL fetch fails
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
