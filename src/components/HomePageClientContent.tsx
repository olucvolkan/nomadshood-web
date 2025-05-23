
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { List, Lightbulb, Users, MapPin, Video, Globe, Star, MessageSquare, Send, Youtube, Film } from 'lucide-react';
import type { ColivingSpace, CommunityLink, CountrySpecificCommunityLinks } from '@/types';
import { ColivingCard } from '@/components/ColivingCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CountryDisplayData {
  name: string;
  count: number;
  imageUrl: string;
  dataAiHint: string;
}

export interface HomePageYouTubeVideo { // Exporting if needed by parent, or keep local
  id: string;
  title: string;
  thumbnailUrl: string;
  youtubeUrl: string;
  dataAiHint: string;
}

interface HomePageClientContentProps {
  allSpaces: ColivingSpace[];
  youTubeVideos: HomePageYouTubeVideo[];
  countryCommunityLinks: CountrySpecificCommunityLinks[];
}

export function HomePageClientContent({ 
  allSpaces, 
  youTubeVideos, 
  countryCommunityLinks 
}: HomePageClientContentProps) {
  const [selectedCountryForCommunities, setSelectedCountryForCommunities] = useState<string | null>(null);
  const [displayedCommunityLinks, setDisplayedCommunityLinks] = useState<CommunityLink[]>([]);

  const countryCounts: { [country: string]: number } = useMemo(() => {
    const counts: { [country: string]: number } = {};
    allSpaces.forEach(space => {
      const addressParts = space.address.split(', ');
      const country = addressParts[addressParts.length - 1];
      if (country) {
        counts[country] = (counts[country] || 0) + 1;
      }
    });
    return counts;
  }, [allSpaces]);

  const countriesData: CountryDisplayData[] = useMemo(() => {
    // Define specific image hints for certain countries if desired
    const countrySpecificImageHints: { [key: string]: string } = {
      "Indonesia": "bali tropical",
      "Portugal": "lisbon tram",
      "USA": "new york city",
      "Japan": "tokyo street",
      "South Africa": "cape town mountain",
      "Colombia": "medellin valley",
    };
    return Object.entries(countryCounts)
    .map(([countryName, count]) => ({
      name: countryName,
      count: count,
      imageUrl: `https://placehold.co/600x400.png`,
      dataAiHint: countrySpecificImageHints[countryName] || `flag ${countryName.toLowerCase().split(" ").slice(0,1).join("")}`,
    }))
    .sort((a, b) => b.count - a.count);
  } , [countryCounts]);
  
  const featuredSpaces = useMemo(() => allSpaces.slice(0, 3), [allSpaces]);

  const uniqueCountriesForSelector = useMemo(() => {
    const countries = new Set<string>();
    allSpaces.forEach(space => {
      const addressParts = space.address.split(', ');
      const country = addressParts[addressParts.length - 1];
      if (country) {
        countries.add(country);
      }
    });
    countryCommunityLinks.forEach(countryLinkData => {
      if (countryLinkData.countryName) {
        countries.add(countryLinkData.countryName);
      }
    });
    return Array.from(countries).sort();
  }, [allSpaces, countryCommunityLinks]);

  const handleCountryChangeForCommunities = (countryName: string) => {
    setSelectedCountryForCommunities(countryName);
    if (countryName) {
      const countryLinksData = countryCommunityLinks.find(
        (item: CountrySpecificCommunityLinks) => item.countryName.toLowerCase() === countryName.toLowerCase()
      );
      setDisplayedCommunityLinks(countryLinksData ? countryLinksData.links : []);
    } else {
      setDisplayedCommunityLinks([]);
    }
  };

  const getPlatformIcon = (platform: CommunityLink['platform']) => {
    switch (platform) {
      case 'WhatsApp':
        return <MessageSquare className="mr-2 h-5 w-5" />;
      case 'Slack':
        return <Users className="mr-2 h-5 w-5" />;
      case 'Telegram':
        return <Send className="mr-2 h-5 w-5" />;
      default:
        return <Globe className="mr-2 h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-16">
      <section className="text-center py-10 bg-gradient-to-r from-primary/10 via-background to-accent/10 rounded-xl shadow-sm">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary">
          Welcome to NomadsHood
        </h1>
        <p className="mt-4 text-xl text-foreground/80 max-w-2xl mx-auto">
          Discover your next home away from home. Explore coliving spaces, watch community videos, and connect with fellow digital nomads.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Button size="lg" asChild>
            <Link href="/coliving">
              <List className="mr-2 h-5 w-5" /> Explore Directory
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/recommender">
              <Lightbulb className="mr-2 h-5 w-5" /> AI Recommender
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <MapPin className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Extensive Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Browse a curated list of coliving spaces worldwide. Find addresses, amenities, and essential details.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Video className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Video Showcases</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get a real feel for coliving life with videos from residents and community managers.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Users className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Community Links</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Connect with local nomad communities through Slack, WhatsApp, and other group links.
            </CardDescription>
          </CardContent>
        </Card>
      </section>
      
      <section className="py-10">
        <div className="text-center mb-10">
          <Film className="h-12 w-12 text-primary mx-auto mb-2" />
          <h2 className="text-3xl font-semibold">From the NomadsHood Channel</h2>
          <p className="text-lg text-foreground/70 mt-2">Watch our latest videos, tips, and community showcases.</p>
        </div>
        <div className="flex overflow-x-auto space-x-6 pb-4 -mb-4 pl-4">
          {youTubeVideos.map((video) => (
            <Card key={video.id} className="min-w-[300px] max-w-[300px] flex-shrink-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                <Image
                  src={video.thumbnailUrl}
                  alt={video.title}
                  fill
                  style={{objectFit: 'cover'}}
                  data-ai-hint={video.dataAiHint}
                />
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg line-clamp-2 h-[3.25rem]">{video.title}</CardTitle>
              </CardHeader>
              <CardFooter className="p-4 pt-0">
                <Button asChild variant="outline" className="w-full">
                  <Link href={video.youtubeUrl} target="_blank" rel="noopener noreferrer">
                    <Youtube className="mr-2 h-5 w-5 text-red-600" />
                    Watch on YouTube
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        {youTubeVideos.length === 0 && (
          <p className="text-center text-muted-foreground">No videos available at the moment. Check back soon!</p>
        )}
      </section>

      <section className="py-10">
        <div className="text-center mb-10">
          <Star className="h-12 w-12 text-primary mx-auto mb-2" />
          <h2 className="text-3xl font-semibold">Featured Coliving Spaces</h2>
          <p className="text-lg text-foreground/70 mt-2">Handpicked selections for your next adventure.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredSpaces.map((space) => (
            <ColivingCard key={space.id} space={space} showViewDetailsButton={true} />
          ))}
        </div>
         {featuredSpaces.length === 0 && allSpaces.length > 0 && (
          <p className="text-center text-muted-foreground">Loading featured spaces...</p>
        )}
        {allSpaces.length === 0 && (
           <p className="text-center text-muted-foreground">No coliving spaces available yet. Add some to your Firebase database to see them here!</p>
        )}
      </section>

      <section className="py-10">
        <div className="text-center mb-10">
          <Globe className="h-12 w-12 text-primary mx-auto mb-2" />
          <h2 className="text-3xl font-semibold">Explore Destinations</h2>
          <p className="text-lg text-foreground/70 mt-2">Discover coliving hotspots around the world.</p>
        </div>
        {countriesData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {countriesData.map((country) => (
              <Link key={country.name} href={`/coliving?country=${encodeURIComponent(country.name)}`} className="block group rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                <Card className="h-full transition-all duration-300 ease-in-out group-hover:shadow-xl group-focus-within:shadow-xl group-hover:border-primary/50 group-focus-within:border-primary/50 border border-transparent">
                  <div className="relative h-48 w-full">
                    <Image
                      src={country.imageUrl}
                      alt={`View of ${country.name}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={country.dataAiHint}
                    />
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-xl">{country.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">
                      {country.count} coliving space{country.count !== 1 ? 's' : ''} available
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No destination data available yet. Once coliving spaces are added to Firebase, countries will appear here.</p>
        )}
      </section>

      <section className="py-10 text-center">
        <Users className="h-12 w-12 text-primary mx-auto mb-2" />
        <h2 className="text-3xl font-semibold">Connect with Nomad Communities</h2>
        <p className="mt-2 mb-6 text-lg text-foreground/70 max-w-xl mx-auto">
          Select a country to find local Slack, WhatsApp, or Telegram groups for digital nomads.
        </p>

        <div className="max-w-md mx-auto mb-8">
          <Select
            onValueChange={handleCountryChangeForCommunities}
            value={selectedCountryForCommunities || undefined}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a country..." />
            </SelectTrigger>
            <SelectContent>
              {uniqueCountriesForSelector.map(country => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCountryForCommunities && displayedCommunityLinks.length > 0 && (
          <div className="flex justify-center items-center flex-wrap gap-4">
            {displayedCommunityLinks.map((link, index) => (
              <Button key={index} variant="outline" size="lg" asChild>
                <Link href={link.url} target="_blank" rel="noopener noreferrer">
                  {getPlatformIcon(link.platform)}
                  {link.name}
                </Link>
              </Button>
            ))}
          </div>
        )}
        {selectedCountryForCommunities && displayedCommunityLinks.length === 0 && (
          <p className="text-muted-foreground mt-4">
            No specific community links found for {selectedCountryForCommunities}. Try another country or check back later!
          </p>
        )}
        {!selectedCountryForCommunities && (
          <p className="text-muted-foreground mt-4">
            Please select a country above to view relevant community channels.
          </p>
        )}
      </section>
    </div>
  );
}
