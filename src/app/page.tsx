
import type { ColivingSpace, CountryData, NomadVideo } from '@/types';
import { mockCountrySpecificCommunityLinks } from '@/lib/mock-community-links';
import { getAllColivingSpaces, getAllCountriesFromDB } from '@/services/colivingService';
import { HomePageClientContent } from '@/components/HomePageClientContent';
import { getDiscoveryVideos, getCommunityFavoritesVideos, getFreshAndTrendingVideos } from '@/services/videoService';


// This was the old mock data for YouTube videos, replaced by Firestore fetching
// const mockYouTubeVideos: HomePageYouTubeVideo[] = [ ... ];

export default async function HomePage() {
  const allSpaces: ColivingSpace[] = await getAllColivingSpaces();
  const allCountries: CountryData[] = await getAllCountriesFromDB();

  // Fetch video data
  const discoveryVideos: NomadVideo[] = await getDiscoveryVideos();
  const communityFavoritesVideos: NomadVideo[] = await getCommunityFavoritesVideos();
  const freshTrendingVideos: NomadVideo[] = await getFreshAndTrendingVideos();

  return (
    <HomePageClientContent
      allSpaces={allSpaces}
      allCountries={allCountries}
      // youTubeVideos={mockYouTubeVideos} // Old prop, remove or adapt if needed
      discoveryVideos={discoveryVideos}
      communityFavoritesVideos={communityFavoritesVideos}
      freshTrendingVideos={freshTrendingVideos}
      countryCommunityLinks={mockCountrySpecificCommunityLinks}
    />
  );
}
