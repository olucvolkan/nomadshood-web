
// This is now a Server Component

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { List, Lightbulb, Users, MapPin, Video, Globe, Star, MessageSquare, Send, Youtube, Film } from 'lucide-react';
import type { ColivingSpace, CommunityLink, CountrySpecificCommunityLinks } from '@/types';
import { ColivingCard } from '@/components/ColivingCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockCountrySpecificCommunityLinks } from '@/lib/mock-community-links';
import { getAllColivingSpaces } from '@/services/colivingService';
import { HomePageClientContent, type HomePageYouTubeVideo } from '@/components/HomePageClientContent'; // Import the new client component


const mockYouTubeVideos: HomePageYouTubeVideo[] = [
  {
    id: '1',
    title: 'Top 5 Digital Nomad Hotspots in 2025',
    thumbnailUrl: 'https://placehold.co/400x225.png',
    youtubeUrl: 'https://www.youtube.com/watch?v=example1',
    dataAiHint: 'travel global map',
  },
  {
    id: '2',
    title: 'Packing Light: Essential Gear for Nomads',
    thumbnailUrl: 'https://placehold.co/400x225.png',
    youtubeUrl: 'https://www.youtube.com/watch?v=example2',
    dataAiHint: 'backpack travel gear',
  },
  {
    id: '3',
    title: 'Coliving in Bali: A Deep Dive',
    thumbnailUrl: 'https://placehold.co/400x225.png',
    youtubeUrl: 'https://www.youtube.com/watch?v=example3',
    dataAiHint: 'bali tropical workspace',
  },
  {
    id: '4',
    title: 'Visa Guide for Aspiring Digital Nomads',
    thumbnailUrl: 'https://placehold.co/400x225.png',
    youtubeUrl: 'https://www.youtube.com/watch?v=example4',
    dataAiHint: 'passport visa documents',
  },
  {
    id: '5',
    title: 'Community Spotlight: Lisbon Nomads',
    thumbnailUrl: 'https://placehold.co/400x225.png',
    youtubeUrl: 'https://www.youtube.com/watch?v=example5',
    dataAiHint: 'lisbon group people',
  },
];

export default async function HomePage() {
  const allSpaces: ColivingSpace[] = await getAllColivingSpaces();
  
  // Pass fetched data and static data to the client component
  return (
    <HomePageClientContent 
      allSpaces={allSpaces} 
      youTubeVideos={mockYouTubeVideos}
      countryCommunityLinks={mockCountrySpecificCommunityLinks}
    />
  );
}
