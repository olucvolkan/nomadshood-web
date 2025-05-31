
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { List, Lightbulb, Users, MapPin, Globe, Star, MessageSquare, Send, Youtube, Compass, Podcast } from 'lucide-react';
import type { ColivingSpace, CommunityLink, CountrySpecificCommunityLinks, CountryData, NomadVideo } from '@/types';
import { ColivingCard } from '@/components/ColivingCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface HomePageClientContentProps {
  allSpaces: ColivingSpace[];
  allCountries: CountryData[];
  nomadsHoodPodcastVideos: NomadVideo[];
  countryCommunityLinks: CountrySpecificCommunityLinks[];
}

// Helper component for rendering a list of videos
const VideoListSection: React.FC<{ title: string; videos: NomadVideo[]; icon?: React.ElementType; isSlider?: boolean }> = ({ title, videos, icon: IconComponent, isSlider = false }) => {
  if (!videos || videos.length === 0) {
    return (
      <div className="py-4">
        <h3 className="text-2xl font-semibold mb-4 flex items-center">
          {IconComponent && <IconComponent className="mr-3 h-7 w-7 text-primary" />}
          {title}
        </h3>
        <p className="text-muted-foreground">
          No videos available for the "{title}" section yet. 
          {title === "NomadsHood Podcast" && " This might be due to missing data in the 'nomadsHood-videos' Firestore collection, incorrect data structure (ensure 'publishedAt' is a Timestamp), or a Firestore query issue (check console for index warnings on 'publishedAt' field)."}
        </p>
      </div>
    );
  }

  const videoCardBaseClasses = "flex flex-col shadow-lg hover:shadow-xl transition-shadow";
  const sliderItemClasses = isSlider ? "w-72 flex-shrink-0" : "sm:w-auto"; // Fixed width for slider items

  return (
    <div className="py-4">
      <h3 className="text-2xl font-semibold mb-6 flex items-center">
        {IconComponent && <IconComponent className="mr-3 h-7 w-7 text-primary" />}
        {title}
      </h3>
      <div className={isSlider ? "flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"}>
        {videos.map((video) => (
          <Card key={video.id} className={`${videoCardBaseClasses} ${sliderItemClasses}`}>
            <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
              <Image
                src={video.thumbnailUrl}
                alt={video.title}
                fill
                style={{ objectFit: 'cover' }}
                data-ai-hint={video.dataAiHint || 'video thumbnail'}
                sizes={isSlider ? "288px" : "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"}
              />
            </div>
            <CardHeader className="p-4 flex-grow">
              <CardTitle className="text-md leading-tight line-clamp-3 h-[4.5em]">{video.title}</CardTitle>
            </CardHeader>
            <CardFooter className="p-4 pt-0">
              <Button asChild variant="outline" className="w-full">
                <Link href={video.youtubeUrl} target="_blank" rel="noopener noreferrer">
                  <Youtube className="mr-2 h-5 w-5 text-red-600" />
                  Watch
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};


export function HomePageClientContent({
  allSpaces,
  allCountries,
  nomadsHoodPodcastVideos,
  countryCommunityLinks
}: HomePageClientContentProps) {
  const [selectedCountryForCommunities, setSelectedCountryForCommunities] = useState<string | null>(null);
  const [displayedCommunityLinks, setDisplayedCommunityLinks] = useState<CommunityLink[]>([]);

  const popularCountriesData: CountryData[] = useMemo(() => {
    return [...allCountries]
      .filter(country => country.name.toLowerCase() !== 'israel')
      .sort((a, b) => {
        const countDiff = (b.coliving_count || 0) - (a.coliving_count || 0);
        if (countDiff !== 0) return countDiff;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 8);
  }, [allCountries]);

  const featuredSpaces = useMemo(() => {
    const sortedSpaces = [...allSpaces].sort((a, b) => {
      if ((b.rating ?? 0) !== (a.rating ?? 0)) {
        return (b.rating ?? 0) - (a.rating ?? 0);
      }
      return (b.reviews_count ?? 0) - (a.reviews_count ?? 0);
    });
    return sortedSpaces.length > 0 ? sortedSpaces.slice(0, 3) : [];
  }, [allSpaces]);

  const uniqueCountriesForSelector = useMemo(() => {
    const countries = new Set<string>();
    allCountries.forEach(country => {
      if (country && country.name) {
        countries.add(country.name);
      }
    });
    countryCommunityLinks.forEach(countryLinkData => {
      if (countryLinkData.countryName) {
        countries.add(countryLinkData.countryName);
      }
    });
    return Array.from(countries).sort();
  }, [allCountries, countryCommunityLinks]);

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
            <Youtube className="h-10 w-10 text-primary mb-2" />
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
          <h2 className="text-3xl font-semibold">NomadsHood Video Hub</h2>
          <p className="text-lg text-foreground/70 mt-2">Curated video content for the aspiring and seasoned digital nomad.</p>
        </div>
        <div className="space-y-12">
          <VideoListSection title="NomadsHood Podcast" videos={nomadsHoodPodcastVideos} icon={Podcast} isSlider={false} />
        </div>
      </section>


      <section className="py-10">
        <div className="text-center mb-10">
          <Compass className="h-12 w-12 text-primary mx-auto mb-2" />
          <h2 className="text-3xl font-semibold">Popular Destinations</h2>
          <p className="text-lg text-foreground/70 mt-2">Discover top countries for digital nomads.</p>
        </div>
        {popularCountriesData.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {popularCountriesData.map((country) => (
              <Link
                key={country.id}
                href={`/coliving?country=${encodeURIComponent(country.name)}`}
                className="block group"
              >
                <Card className="h-full overflow-hidden shadow-md hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col items-center justify-center text-center p-4">

                    {country.flagImageUrl ? (
                      <div className="relative w-16 h-10 mb-3">
                        <Image
                          src={country.flagImageUrl}
                          alt={`${country.name} flag`}
                          fill
                          className="object-contain rounded-sm"
                          data-ai-hint={`flag ${country.name.toLowerCase().replace(/\s+/g, '-')}`}
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div className="text-4xl mb-3">{country.flag || '🏳️'}</div>
                    )}
                    <h3 className="text-md font-semibold text-foreground group-hover:text-primary transition-colors">
                      {country.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {country.coliving_count || 0} coliving space{country.coliving_count !== 1 ? 's' : ''}
                    </p>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No country data available yet. Once coliving spaces and countries are added to Firebase, they will appear here.</p>
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
         {allSpaces.length > 0 && featuredSpaces.length === 0 && (
          <p className="text-center text-muted-foreground">Loading featured spaces...</p>
        )}
        {allSpaces.length === 0 && (
           <p className="text-center text-muted-foreground">No coliving spaces available yet. Add some to your Firebase database to see them here!</p>
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
