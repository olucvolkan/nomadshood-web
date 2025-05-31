
import type { ColivingSpace, CountryData, NomadVideo } from '@/types';
import { mockCountrySpecificCommunityLinks } from '@/lib/mock-community-links';
import { getAllColivingSpaces, getAllCountriesFromDB } from '@/services/colivingService';
import { HomePageClientContent } from '@/components/HomePageClientContent';
import { getDiscoveryVideos, getCommunityFavoritesVideos, getFreshAndTrendingVideos, getNomadsHoodPodcastVideos } from '@/services/videoService';


export default async function HomePage() {
  const allSpaces: ColivingSpace[] = await getAllColivingSpaces();
  const allCountries: CountryData[] = await getAllCountriesFromDB();

  // Fetch video data
  const discoveryVideos: NomadVideo[] = await getDiscoveryVideos();
  const communityFavoritesVideos: NomadVideo[] = await getCommunityFavoritesVideos();
  const freshTrendingVideos: NomadVideo[] = await getFreshAndTrendingVideos();
  const nomadsHoodPodcastVideos: NomadVideo[] = await getNomadsHoodPodcastVideos();

  return (
    <HomePageClientContent
      allSpaces={allSpaces}
      allCountries={allCountries}
      discoveryVideos={discoveryVideos}
      communityFavoritesVideos={communityFavoritesVideos}
      freshTrendingVideos={freshTrendingVideos}
      nomadsHoodPodcastVideos={nomadsHoodPodcastVideos}
      countryCommunityLinks={mockCountrySpecificCommunityLinks}
    />
  );
}
