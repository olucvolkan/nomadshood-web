
import type { ColivingSpace, CountryData, NomadVideo } from '@/types';
import { mockCountrySpecificCommunityLinks } from '@/lib/mock-community-links';
import { getAllColivingSpaces, getAllCountriesFromDB } from '@/services/colivingService';
import { HomePageClientContent } from '@/components/HomePageClientContent';
import { getMostWatchedVideosFromJson, getNomadsHoodPodcastVideosFromFirestore } from '@/services/videoService';


export default async function HomePage() {
  const allSpaces: ColivingSpace[] = await getAllColivingSpaces();
  const allCountries: CountryData[] = await getAllCountriesFromDB();

  // Fetch video data
  const mostWatchedVideos: NomadVideo[] = await getMostWatchedVideosFromJson();
  const nomadsHoodPodcastVideos: NomadVideo[] = await getNomadsHoodPodcastVideosFromFirestore();

  return (
    <HomePageClientContent
      allSpaces={allSpaces}
      allCountries={allCountries}
      mostWatchedVideos={mostWatchedVideos}
      nomadsHoodPodcastVideos={nomadsHoodPodcastVideos}
      countryCommunityLinks={mockCountrySpecificCommunityLinks}
    />
  );
}
