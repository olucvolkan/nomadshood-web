
// This is now a Server Component

import type { ColivingSpace, CountryData } from '@/types';
import { mockCountrySpecificCommunityLinks } from '@/lib/mock-community-links';
import { getAllColivingSpaces, getAllCountriesFromDB } from '@/services/colivingService';
import { HomePageClientContent, type HomePageYouTubeVideo } from '@/components/HomePageClientContent';


const mockYouTubeVideos: HomePageYouTubeVideo[] = [
  {
    id: '1',
    title: 'Top 5 Digital Nomad Hotspots in 2025',
    thumbnailUrl: 'https://placehold.co/400x225/E0E0E0/757575.png',
    youtubeUrl: 'https://www.youtube.com/watch?v=example1',
    dataAiHint: 'travel global map',
  },
  {
    id: '2',
    title: 'Packing Light: Essential Gear for Nomads',
    thumbnailUrl: 'https://placehold.co/400x225/E0E0E0/757575.png',
    youtubeUrl: 'https://www.youtube.com/watch?v=example2',
    dataAiHint: 'backpack travel gear',
  },
  {
    id: '3',
    title: 'Coliving in Bali: A Deep Dive',
    thumbnailUrl: 'https://placehold.co/400x225/E0E0E0/757575.png',
    youtubeUrl: 'https://www.youtube.com/watch?v=example3',
    dataAiHint: 'bali tropical workspace',
  },
  {
    id: '4',
    title: 'Visa Guide for Aspiring Digital Nomads',
    thumbnailUrl: 'https://placehold.co/400x225/E0E0E0/757575.png',
    youtubeUrl: 'https://www.youtube.com/watch?v=example4',
    dataAiHint: 'passport visa documents',
  },
  {
    id: '5',
    title: 'Community Spotlight: Lisbon Nomads',
    thumbnailUrl: 'https://placehold.co/400x225/E0E0E0/757575.png',
    youtubeUrl: 'https://www.youtube.com/watch?v=example5',
    dataAiHint: 'lisbon group people',
  },
];

export default async function HomePage() {
  const allSpaces: ColivingSpace[] = await getAllColivingSpaces();
  const allCountries: CountryData[] = await getAllCountriesFromDB();

  return (
    <HomePageClientContent
      allSpaces={allSpaces}
      allCountries={allCountries}
      youTubeVideos={mockYouTubeVideos}
      countryCommunityLinks={mockCountrySpecificCommunityLinks}
    />
  );
}

