'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ColivingSpace, Community, CountryWithCommunities, NomadVideo } from '@/types';
import { Compass, ExternalLink, Facebook, Globe, MapPin, MessageSquare, Podcast, Send, Slack, Star, Users, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

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
  allCountries: CountryWithCommunities[]; // This prop will be used to derive popularCountriesData
  nomadsHoodPodcastVideos: NomadVideo[];
  countriesWithCommunities: CountryWithCommunities[]; // Used for "Connect with Nomad Communities"
}

// Reddit Icon SVG component
const RedditIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.018 0A12 12 0 000 12a12 12 0 0012.018 12 12 12 0 0011.982-12A12 12 0 0012.018 0zm6.34 12.595c0 .59-.48 1.07-1.07 1.07-.002 0-.003 0-.005-.002a1.067 1.067 0 01-1.065-1.068c0-.59.48-1.07 1.07-1.07.59 0 1.07.48 1.07 1.07zM7.715 11.525c.59 0 1.07.48 1.07 1.07 0 .002 0 .003-.002.005a1.067 1.067 0 01-1.068 1.065c-.59 0-1.07-.48-1.07-1.07 0-.59.48-1.07 1.07-1.07zm4.292 5.283c-1.586 0-3.02-.812-3.904-2.088l-.014-.022c-.077-.122-.042-.28.08-.356a.268.268 0 01.357-.08l.017.01c.715.995 1.926 1.62 3.27 1.62s2.555-.625 3.27-1.62l.017-.01a.268.268 0 01.357.08c.122.076.157.234.08.356l-.014.022c-.884 1.276-2.318 2.088-3.904 2.088zm1.08-4.122c-.48-.463-1.176-.81-1.974-.81-.787 0-1.46.335-1.947.787l-.027.023c-.124.1-.15.28-.048.404.064.077.15.116.237.116.054 0 .108-.015.156-.047l.027-.023c.35-.315.837-.52 1.41-.52.583 0 1.08.216 1.436.54l.025.023c.048.032.102.047.157.047.085 0 .17-.04.235-.115.102-.123.076-.303-.048-.404zm3.27-3.286c-.152.14-.343.21-.53.21-.2 0-.39-.078-.538-.23l-1.36-1.473c0-.002-.002-.003-.005-.005-.6-.63-1.49-1.038-2.488-1.038s-1.89.41-2.49 1.04l-.004.004-1.358 1.476c-.148.15-.34.228-.54.228-.187 0-.377-.07-.53-.21-.293-.28-.306-.75-.03-1.043l1.36-1.47c.83-.9 1.997-1.494 3.298-1.494s2.468.593 3.297 1.492l1.36 1.473c.277.293.265.763-.03 1.043z"/>
  </svg>
);


export function HomePageClientContent({
  allSpaces,
  allCountries, // This prop is now the source for popularCountriesData
  nomadsHoodPodcastVideos,
  countriesWithCommunities
}: HomePageClientContentProps) {
  const [selectedCountryNameForCommunities, setSelectedCountryNameForCommunities] = useState<string | null>(null);

  // Derive popularCountriesData from the allCountries prop
  const popularCountriesData = useMemo(() => {
    if (!allCountries || !Array.isArray(allCountries) || allCountries.length === 0) {
      return [];
    }
    // Sort by coliving_count descending (if available), then by name ascending
    const sortedCountries = [...allCountries].sort((a, b) => {
      const countA = typeof a.coliving_count === 'number' ? a.coliving_count : 0;
      const countB = typeof b.coliving_count === 'number' ? b.coliving_count : 0;
      const countDiff = countB - countA;
      if (countDiff !== 0) return countDiff;
      return a.name.localeCompare(b.name);
    });
    return sortedCountries.slice(0, 9); // Show top 9 popular destinations for 3x3 grid
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
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100 rounded-3xl shadow-2xl">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 px-6 py-20 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl text-center">
            {/* Badge */}
            <div className="mb-8 flex justify-center">
              <div className="relative rounded-full px-4 py-2 text-sm leading-6 text-orange-700 ring-1 ring-orange-200 bg-white/60 backdrop-blur-sm">
                Building the future of nomadic living{' '}
                <span className="font-semibold text-orange-600">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Join our community <span aria-hidden="true">&rarr;</span>
                </span>
              </div>
            </div>
            
            {/* Main Title */}
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              <span className="block">Welcome to</span>
              <span className="block bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                NomadsHood
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto sm:text-xl lg:text-2xl">
              Discover your next home away from home. Explore coliving spaces, watch community videos, and connect with fellow digital nomads around the globe.
            </p>
            
            {/* Stats */}
            <div className="mt-10 flex flex-wrap justify-center gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-orange-600">200+</div>
                <div className="text-sm text-gray-600">Coliving Spaces</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-orange-600">50+</div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-orange-600">1000+</div>
                <div className="text-sm text-gray-600">Nomads Connected</div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200 px-8 py-4 text-lg" asChild>
                <Link href="/coliving">
                  <MapPin className="mr-2 h-5 w-5" /> 
                  Explore Colivings
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50 px-8 py-4 text-lg backdrop-blur-sm bg-white/60" asChild>
                <Link href="https://www.youtube.com/@nomadshood" target="_blank" rel="noopener noreferrer">
                  <Youtube className="mr-2 h-5 w-5" />
                  Watch Stories
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 px-8 py-4 text-lg backdrop-blur-sm bg-white/60" asChild>
                <Link href="https://coff.ee/volkanoluc" target="_blank" rel="noopener noreferrer">
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-.806-1.58C18.895 3.785 18.33 3.516 17.732 3.397L17.066 3.264c-1.043-.208-2.088-.208-3.131 0L13.268 3.397c-.598.119-1.163.388-1.58.806-.383.384-.653.913-.806 1.58l-.132.666c-.208 1.043-.208 2.088 0 3.131l.132.666c.119.598.388 1.163.806 1.58.384.383.913.653 1.58.806l.666.132c1.043.208 2.088.208 3.131 0l.666-.132c.598-.119 1.163-.388 1.58-.806.383-.384.653-.913.806-1.58l-.132-.666c.208-1.043.208-2.088 0-3.131zM6.5 8.5h11v7c0 1.1-.9 2-2 2h-7c-1.1 0-2-.9-2-2v-7z"/>
                  </svg>
                  Buy Me a Coffee
                </Link>
              </Button>
            </div>
            
            {/* Visual Elements */}
            <div className="mt-16 flex justify-center items-center space-x-8 opacity-60">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live community</span>
              </div>
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-orange-500 animate-spin" style={{animationDuration: '8s'}} />
                <span className="text-sm text-gray-500">Global network</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse animation-delay-1000"></div>
                <span className="text-sm text-gray-500">Real experiences</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="grid md:grid-cols-3 gap-8">
        <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-white to-orange-50">
          <CardHeader className="pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Extensive Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-gray-600 text-base leading-relaxed">
              Browse a curated list of coliving spaces worldwide. Find addresses, amenities, and essential details to make your next move with confidence.
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-white to-red-50">
          <CardHeader className="pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Youtube className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Video Showcases</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-gray-600 text-base leading-relaxed">
              Get a real feel for coliving life with authentic videos from residents and community managers sharing their experiences.
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Community Links</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-gray-600 text-base leading-relaxed">
              Connect with local nomad communities through various platforms and build meaningful relationships wherever you go.
            </CardDescription>
          </CardContent>
        </Card>
      </section>

      <section className="py-16 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 rounded-3xl shadow-lg">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Youtube className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-800">NomadsHood Video Hub</h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Dive into authentic stories from the coliving world. Real experiences, real insights, real connections.
          </p>
        </div>

        {nomadsHoodPodcastVideos && nomadsHoodPodcastVideos.length > 0 ? (
          <div className="max-w-6xl mx-auto">
            {/* Featured Video Section */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <Podcast className="h-8 w-8 text-orange-500" />
                <h3 className="text-2xl font-bold text-gray-800">Featured Stories</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-orange-300 to-transparent"></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {nomadsHoodPodcastVideos.slice(0, 2).map((video, index) => (
                  <div key={video.id} className="group">
                    <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white">
                      <div className="relative h-56 overflow-hidden">
                        <Image
                          src={video.thumbnailUrl}
                          alt={video.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                            <Youtube className="h-8 w-8 text-white ml-1" />
                          </div>
                        </div>

                        {/* Episode Badge */}
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-orange-500 text-white font-medium px-3 py-1">
                            Episode {index + 1}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors duration-300">
                          {video.title}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* Video Description */}
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {index === 0 
                              ? "Join us as we explore the vibrant coliving scene in Tenerife, featuring an exclusive tour of Blue Paradise Coliving and insights from the founder about building a thriving nomad community."
                              : "Discover what makes Lisbon a top destination for digital nomads. From co-working spaces to community events, get an insider's look at coliving life in Portugal's capital."
                            }
                          </p>
                          
                          {/* Video Stats */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span>New Episode</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>Community Insights</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="pt-0">
                        <Button asChild className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <Link href={video.youtubeUrl} target="_blank" rel="noopener noreferrer">
                            <Youtube className="mr-2 h-4 w-4" />
                            Watch Episode
                            <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* More Episodes Section */}
            {nomadsHoodPodcastVideos.length > 2 && (
              <div className="text-center">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">More Episodes Coming Soon</h4>
                  <p className="text-gray-600 mb-6">
                    We're constantly creating new content. Subscribe to our YouTube channel to never miss an episode!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" size="lg" className="border-red-300 text-red-600 hover:bg-red-50" asChild>
                      <Link href="https://www.youtube.com/@nomadshood" target="_blank" rel="noopener noreferrer">
                        <Youtube className="mr-2 h-4 w-4" />
                        Subscribe on YouTube
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="border-orange-300 text-orange-600 hover:bg-orange-50" asChild>
                      <Link href="#video-hub">
                        <Podcast className="mr-2 h-4 w-4" />
                        All Episodes
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 border border-gray-200/50 max-w-2xl mx-auto">
              <Youtube className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">Episodes Coming Soon</h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                We're working hard to bring you amazing content about coliving spaces and digital nomad experiences. 
                Our first episodes will feature exclusive interviews and space tours.
              </p>
              <Button size="lg" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" asChild>
                <Link href="https://www.youtube.com/@nomadshood" target="_blank" rel="noopener noreferrer">
                  <Youtube className="mr-2 h-5 w-5" />
                  Subscribe for Updates
                </Link>
              </Button>
            </div>
          </div>
        )}
      </section>

      <section className="py-10">
        <div className="text-center mb-10">
          <Compass className="h-12 w-12 text-primary mx-auto mb-2" />
          <h2 className="text-3xl font-semibold">Popular Destinations</h2>
          <p className="text-lg text-foreground/70 mt-2">Discover top countries for digital nomads.</p>
        </div>
        {popularCountriesData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {popularCountriesData.map((country) => (
              <Link
                key={country.id}
                href={`/coliving?country=${encodeURIComponent(country.name)}`}
                className="block group"
              >
                <Card className="relative overflow-hidden rounded-lg shadow-lg h-64">
                  <Image
                    src={country.firebaseCoverImageUrl || country.cover_image || 'https://placehold.co/600x400.png'}
                    alt={`Explore ${country.name}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={`landscape ${country.name.toLowerCase()}`}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    priority={popularCountriesData.indexOf(country) < 6} // Prioritize loading for first 6 images (2 rows of 3x3 grid)
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
                  
                  {country.flagImageUrl ? (
                    <Image
                      src={country.flagImageUrl}
                      alt={`${country.name} flag`}
                      width={32}
                      height={20}
                      className="absolute top-3 left-3 rounded-sm object-contain"
                       data-ai-hint={`flag ${country.name.toLowerCase()}`}
                    />
                  ) : country.flag ? (
                    <span className="absolute top-3 left-3 text-2xl bg-black/20 p-1 rounded-sm">{country.flag}</span>
                  ) : null}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-xl font-bold tracking-tight">{country.name}</h3>
                    {typeof country.coliving_count === 'number' && (
                      <p className="text-sm mt-1">
                        {country.coliving_count} coliving space{country.coliving_count !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No country data available yet. Once coliving spaces and countries are added to Firebase, they will appear here.</p>
        )}
      </section>


      <section className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-800 mb-6">The NomadsHood Mindset</h2>
          
          {/* Mission Statement Hero */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-lg border border-orange-200/50">
              <p className="text-2xl md:text-3xl font-medium text-gray-700 leading-relaxed mb-8">
                At Nomadshood, we believe travel isn't just about moving — <span className="text-orange-600 font-semibold">it's about meaning.</span>
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
                <div className="text-left">
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    Our mission is to empower digital nomads and slow travelers with high-quality content about coliving spaces around the world, helping them make smarter, more fulfilling travel decisions.
                  </p>
                  <p className="text-xl font-semibold text-orange-700">
                    We're building more than a directory — we're building a global community.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Podcast className="w-4 h-4 text-orange-600" />
                    </div>
                    <p className="text-gray-700">We interview colivers and share their real stories through podcasts and articles.</p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <MapPin className="w-4 h-4 text-orange-600" />
                    </div>
                    <p className="text-gray-700">We spotlight newly opened coliving spaces and what makes them special.</p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Compass className="w-4 h-4 text-orange-600" />
                    </div>
                    <p className="text-gray-700">We're launching TripPlanner to help you map your next adventure with purpose.</p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Youtube className="w-4 h-4 text-orange-600" />
                    </div>
                    <p className="text-gray-700">We create videos and blog posts that capture the real spirit of the digital nomad lifestyle.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl p-6 border border-orange-200">
                <p className="text-lg font-medium text-gray-700 text-center">
                  Through content, connection, and shared experiences, Nomadshood exists to bring like-minded travelers together — <span className="text-orange-600 font-semibold">one meaningful stay at a time.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Podcasts & Interviews - Left large card */}
          <div className="lg:row-span-2">
            <Card className="h-full bg-gradient-to-br from-amber-100 to-orange-200 border-0 shadow-xl overflow-hidden">
              <div className="relative h-64 lg:h-80">
                <Image
                  src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Podcast interview setup"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-gray-800">Podcasts & Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-lg leading-relaxed">
                  We interview colivers and share their stories.
                </p>
                <Button asChild className="mt-4 bg-orange-500 hover:bg-orange-600">
                  <Link href="#video-hub">
                    <Podcast className="mr-2 h-4 w-4" />
                    Listen Now
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* New Coliving Spaces - Right top card */}
          <Card className="bg-gradient-to-br from-orange-100 to-amber-100 border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">New Coliving Spaces</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                We spotlight recently opened spaces.
              </p>
              <div className="flex justify-center items-center space-x-2 mb-4">
                <div className="w-8 h-6 bg-orange-300 rounded"></div>
                <div className="w-12 h-8 bg-orange-400 rounded-lg"></div>
                <div className="w-6 h-10 bg-green-400 rounded-full"></div>
              </div>
              <Button asChild variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                <Link href="/coliving">
                  <Star className="mr-2 h-4 w-4" />
                  Explore New
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* TripPlanner - Right bottom card */}
          <Card className="bg-gradient-to-br from-yellow-100 to-orange-100 border-0 shadow-lg relative">
            <div className="absolute top-4 right-4">
              <Badge className="bg-yellow-500 text-white font-medium">Coming Soon</Badge>
            </div>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center">
                <Compass className="h-6 w-6 text-yellow-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">TripPlanner</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                We help you map your next adventure.
              </p>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-12 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <Button disabled variant="outline" className="border-yellow-300 text-yellow-700 cursor-not-allowed opacity-60">
                <Compass className="mr-2 h-4 w-4" />
                Plan Trip
              </Button>
            </CardContent>
          </Card>
        </div>
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
          <div className="text-center mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="mb-4">
              <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No communities found for {selectedCountryNameForCommunities}
              </h3>
              <p className="text-gray-600 mb-4">
                We're constantly expanding our community database. Communities for this country may be added soon!
              </p>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                In the meantime, try these popular destinations:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Spain', 'Portugal', 'Mexico', 'Thailand', 'Colombia'].filter(country => 
                  country !== selectedCountryNameForCommunities && 
                  uniqueCountriesForSelector.includes(country)
                ).slice(0, 3).map(country => (
                  <Button
                    key={country}
                    variant="outline"
                    size="sm"
                    onClick={() => handleCountryChangeForCommunities(country)}
                    className="text-xs"
                  >
                    {country}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {!selectedCountryNameForCommunities && uniqueCountriesForSelector.length > 0 && (
          <div className="text-center mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Discover Nomad Communities
            </h3>
            <p className="text-gray-600 mb-4">
              Connect with fellow digital nomads in your destination country. Select a country above to find active community groups.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {uniqueCountriesForSelector.slice(0, 5).map(country => (
                <Button
                  key={country}
                  variant="outline"
                  size="sm"
                  onClick={() => handleCountryChangeForCommunities(country)}
                  className="text-xs bg-white hover:bg-blue-50"
                >
                  {country}
                </Button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
