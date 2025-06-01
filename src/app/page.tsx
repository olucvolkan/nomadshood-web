
import type { ColivingSpace, CountryWithCommunities, NomadVideo } from '@/types';
import { getAllColivingSpaces, getAllCountriesFromDB } from '@/services/colivingService';
import { getNomadsHoodPodcastVideosFromFirestore } from '@/services/videoService';
import { HomePageClientContent } from '@/components/HomePageClientContent';

export default async function HomePage() {
  const allSpaces: ColivingSpace[] = await getAllColivingSpaces();
  // getAllCountriesFromDB now returns CountryWithCommunities[]
  const countriesData: CountryWithCommunities[] = await getAllCountriesFromDB();
  const nomadsHoodPodcastVideos: NomadVideo[] = await getNomadsHoodPodcastVideosFromFirestore();
  
  return (
    <HomePageClientContent
      allSpaces={allSpaces}
      allCountries={countriesData} // Used for "Popular Destinations"
      nomadsHoodPodcastVideos={nomadsHoodPodcastVideos}
      countriesWithCommunities={countriesData} // Used for "Connect with Nomad Communities"
    />
  );
}
