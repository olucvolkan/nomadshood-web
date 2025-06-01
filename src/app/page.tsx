
import type { ColivingSpace, CountryData, NomadVideo, CountryWithCommunities } from '@/types';
import { getAllColivingSpaces, getAllCountriesFromDB, getAllCountriesWithCommunitiesFromDB } from '@/services/colivingService';
import { getNomadsHoodPodcastVideosFromFirestore } from '@/services/videoService';
import { HomePageClientContent } from '@/components/HomePageClientContent';

export default async function HomePage() {
  const allSpaces: ColivingSpace[] = await getAllColivingSpaces();
  const allCountries: CountryData[] = await getAllCountriesFromDB();
  const nomadsHoodPodcastVideos: NomadVideo[] = await getNomadsHoodPodcastVideosFromFirestore();
  
  // Fetch countries with communities from Firestore
  const countriesForClient: CountryWithCommunities[] = await getAllCountriesWithCommunitiesFromDB();

  return (
    <HomePageClientContent
      allSpaces={allSpaces}
      allCountries={allCountries}
      nomadsHoodPodcastVideos={nomadsHoodPodcastVideos}
      countriesWithCommunities={countriesForClient} 
    />
  );
}
