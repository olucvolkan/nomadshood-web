
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { List, Users, MapPin, Globe, Star, MessageSquare, Send, Youtube, Compass, Podcast, ExternalLink, Facebook, Slack } from 'lucide-react';
import type { ColivingSpace, CountryWithCommunities, Community, NomadVideo } from '@/types';
import { ColivingCard } from '@/components/ColivingCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';

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
  const sliderItemClasses = isSlider ? "w-72 flex-shrink-0" : "sm:w-auto"; // Adjusted width for slider items

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

interface HomePageClientContentProps {
  allSpaces: ColivingSpace[];
  allCountries: CountryWithCommunities[]; 
  nomadsHoodPodcastVideos: NomadVideo[];
  countriesWithCommunities: CountryWithCommunities[]; 
}

// Reddit Icon SVG component
const RedditIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.018 0A12 12 0 000 12a12 12 0 0012.018 12 12 12 0 0011.982-12A12 12 0 0012.018 0zm6.34 12.595c0 .59-.48 1.07-1.07 1.07-.002 0-.003 0-.005-.002a1.067 1.067 0 01-1.065-1.068c0-.59.48-1.07 1.07-1.07.59 0 1.07.48 1.07 1.07zM7.715 11.525c.59 0 1.07.48 1.07 1.07 0 .002 0 .003-.002.005a1.067 1.067 0 01-1.068 1.065c-.59 0-1.07-.48-1.07-1.07 0-.59.48-1.07 1.07-1.07zm4.292 5.283c-1.586 0-3.02-.812-3.904-2.088l-.014-.022c-.077-.122-.042-.28.08-.356a.268.268 0 01.357-.08l.017.01c.715.995 1.926 1.62 3.27 1.62s2.555-.625 3.27-1.62l.017-.01a.268.268 0 01.357.08c.122.076.157.234.08.356l-.014.022c-.884 1.276-2.318 2.088-3.904 2.088zm1.08-4.122c-.48-.463-1.176-.81-1.974-.81-.787 0-1.46.335-1.947.787l-.027.023c-.124.1-.15.28-.048.404.064.077.15.116.237.116.054 0 .108-.015.156-.047l.027-.023c.35-.315.837-.52 1.41-.52.583 0 1.08.216 1.436.54l.025.023c.048.032.102.047.157.047.085 0 .17-.04.235-.115.102-.123.076-.303-.048-.404zm3.27-3.286c-.152.14-.343.21-.53.21-.2 0-.39-.078-.538-.23l-1.36-1.473c0-.002-.002-.003-.005-.005-.6-.63-1.49-1.038-2.488-1.038s-1.89.41-2.49 1.04l-.004.004-1.358 1.476c-.148.15-.34.228-.54.228-.187 0-.377-.07-.53-.21-.293-.28-.306-.75-.03-1.043l1.36-1.47c.83-.9 1.997-1.494 3.298-1.494s2.468.593 3.297 1.492l1.36 1.473c.277.293.265.763-.03 1.043z"/>
  </svg>
);


export function HomePageClientContent({
  allSpaces,
  allCountries, 
  nomadsHoodPodcastVideos,
  countriesWithCommunities 
}: HomePageClientContentProps) {
  const [selectedCountryNameForCommunities, setSelectedCountryNameForCommunities] = useState<string | null>(null);

  const popularCountriesData: CountryWithCommunities[] = useMemo(() => {
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
    if (countriesWithCommunities && Array.isArray(countriesWithCommunities)) {
      countriesWithCommunities.forEach(countryData => {
        if (countryData && countryData.name) {
          countries.add(countryData.name);
        }
      });
    } else {
      console.warn("HomePageClientContent: countriesWithCommunities prop is not an array or is undefined.");
    }
    return Array.from(countries).sort();
  }, [countriesWithCommunities]);

  const handleCountryChangeForCommunities = (countryName: string) => {
    setSelectedCountryNameForCommunities(countryName);
  };

  const getPlatformIcon = (platform: Community['platform'] | string) => {
    switch (platform?.toLowerCase()) {
      case 'facebook':
        return <Facebook className="mr-2 h-5 w-5 text-blue-600" />;
      case 'reddit':
        return <RedditIcon className="mr-2 h-5 w-5 text-orange-500" />;
      case 'whatsapp':
        return <MessageSquare className="mr-2 h-5 w-5 text-green-500" />;
      case 'slack':
        return <Slack className="mr-2 h-5 w-5 text-purple-600" />; 
      case 'telegram':
        return <Send className="mr-2 h-5 w-5 text-sky-500" />; 
      default:
        return <Globe className="mr-2 h-5 w-5" />;
    }
  };

  const fullSelectedCountryData = useMemo(() => {
    if (!selectedCountryNameForCommunities || !countriesWithCommunities || !Array.isArray(countriesWithCommunities)) return null;
    return countriesWithCommunities.find(country => country.name === selectedCountryNameForCommunities);
  }, [selectedCountryNameForCommunities, countriesWithCommunities]);


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
              <List className="mr-2 h-5 w-5" /> Explore Colivings
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
              Connect with local nomad communities through various platforms.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {popularCountriesData.map((country) => (
                <Link
                  key={country.id}
                  href={`/coliving?country=${encodeURIComponent(country.name)}`}
                  className="block group"
                >
                  <Card className="h-40 flex flex-col items-center justify-center p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                    {country.flagImageUrl ? (
                      <div className="relative w-24 h-16"> {/* Adjusted size for better flag visibility */}
                        <Image
                          src={country.flagImageUrl}
                          alt={`${country.name} flag`}
                          fill
                          className="object-contain rounded-sm"
                          data-ai-hint={`flag ${country.name.toLowerCase().replace(/\s+/g, '-')}`}
                          sizes="96px" 
                          priority={popularCountriesData.indexOf(country) < 4}
                        />
                      </div>
                    ) : (
                      <div className="text-5xl mb-2">{country.flag || '🏳️'}</div>
                    )}
                    {/* Country name and coliving count have been removed as per user's explicit request */}
                  </Card>
                </Link>
              )
            )}
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
          Select a country to find local community groups for digital nomads.
        </p>

        {uniqueCountriesForSelector.length > 0 ? (
            <div className="max-w-md mx-auto mb-8">
            <Select
                onValueChange={handleCountryChangeForCommunities}
                value={selectedCountryNameForCommunities || ""} 
            >
                <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a country..." />
                </SelectTrigger>
                <SelectContent>
                {uniqueCountriesForSelector.map(countryName => (
                    <SelectItem key={countryName} value={countryName}>{countryName}</SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
        ) : (
             <p className="text-muted-foreground mt-4">
                Loading countries or no community data available in Firestore.
             </p>
        )}


        {fullSelectedCountryData && fullSelectedCountryData.communities && fullSelectedCountryData.communities.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {fullSelectedCountryData.communities.map((community: Community, index: number) => (
              <Card key={community.id || `community-${index}`} className="shadow-md hover:shadow-lg transition-shadow text-left flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <Link href={community.groupLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center">
                      {getPlatformIcon(community.platform)}
                      {community.name}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {community.platform}
                    {community.city && community.city.toLowerCase() !== fullSelectedCountryData.name.toLowerCase() ? ` - ${community.city}` : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  {typeof community.memberCount === 'number' && (
                    <p className="text-sm text-muted-foreground mb-2 flex items-center">
                      <Users className="inline h-4 w-4 mr-1.5" />
                      {community.memberCount > 1000 ? `${(community.memberCount / 1000).toFixed(1)}k` : community.memberCount} members
                    </p>
                  )}
                  {community.tags && community.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {community.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  {community.requirementToJoin && community.requirementToJoin.toLowerCase() !== 'none' && (
                    <p className="text-xs text-muted-foreground">Requirement: {community.requirementToJoin}</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={community.groupLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> Join Group
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {selectedCountryNameForCommunities && (!fullSelectedCountryData || !fullSelectedCountryData.communities || fullSelectedCountryData.communities.length === 0) && (
          <p className="text-muted-foreground mt-4">
            No specific community links found for {selectedCountryNameForCommunities}. Ensure this country has a 'communities' array in Firestore, or try another country.
          </p>
        )}

        {!selectedCountryNameForCommunities && uniqueCountriesForSelector.length > 0 && (
          <p className="text-muted-foreground mt-4">
            Please select a country above to find relevant community channels.
          </p>
        )}
      </section>
    </div>
  );
}
