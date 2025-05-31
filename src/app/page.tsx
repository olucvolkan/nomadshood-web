
import type { ColivingSpace, CountryData, NomadVideo } from '@/types';
import { mockCountrySpecificCommunityLinks } from '@/lib/mock-community-links';
import { getAllColivingSpaces, getAllCountriesFromDB } from '@/services/colivingService';
import { getNomadsHoodPodcastVideosFromFirestore } from '@/services/videoService';
import { HomePageClientContent } from '@/components/HomePageClientContent';


export default async function HomePage() {
  const allSpaces: ColivingSpace[] = await getAllColivingSpaces();
  const allCountries: CountryData[] = await getAllCountriesFromDB();
  const nomadsHoodPodcastVideos: NomadVideo[] = await getNomadsHoodPodcastVideosFromFirestore();

  return (
    <HomePageClientContent
      allSpaces={allSpaces}
      allCountries={allCountries}
      nomadsHoodPodcastVideos={nomadsHoodPodcastVideos}
      countryCommunityLinks={mockCountrySpecificCommunityLinks}
    />
  );
}
