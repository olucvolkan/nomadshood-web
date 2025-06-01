
import type { ColivingSpace, CountryData, NomadVideo, CountryWithCommunities } from '@/types';
import { getAllColivingSpaces, getAllCountriesFromDB } from '@/services/colivingService';
import { getNomadsHoodPodcastVideosFromFirestore } from '@/services/videoService';
import { HomePageClientContent } from '@/components/HomePageClientContent';
import countryCommunityDataFromFile from '@/data/country-communities.json'; // Corrected import: default import for JSON array

export default async function HomePage() {
  const allSpaces: ColivingSpace[] = await getAllColivingSpaces();
  const allCountries: CountryData[] = await getAllCountriesFromDB();
  const nomadsHoodPodcastVideos: NomadVideo[] = await getNomadsHoodPodcastVideosFromFirestore();

  // The imported JSON is directly the array of CountryWithCommunities
  const countriesForClient: CountryWithCommunities[] = countryCommunityDataFromFile;

  return (
    <HomePageClientContent
      allSpaces={allSpaces}
      allCountries={allCountries}
      nomadsHoodPodcastVideos={nomadsHoodPodcastVideos}
      countriesWithCommunities={countriesForClient} // Pass the correctly imported and typed data
    />
  );
}
