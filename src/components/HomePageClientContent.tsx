'use client';

import { SpainGuideTeaser } from '@/components/SpainGuideTeaser';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { ColivingSpace, CountryWithCommunities, NomadVideo } from '@/types';
import { Compass, ExternalLink, MapPin, MessageSquare, Podcast, Send, Star, Users, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

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
  spainColivings: ColivingSpace[]; // Only Spain colivings
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
  spainColivings,
  nomadsHoodPodcastVideos,
  countriesWithCommunities
}: HomePageClientContentProps) {
  const featuredSpaces = useMemo(() => {
    const sortedSpaces = [...allSpaces].sort((a, b) => {
      if ((b.rating ?? 0) !== (a.rating ?? 0)) {
        return (b.rating ?? 0) - (a.rating ?? 0);
      }
      return (b.reviews_count ?? 0) - (a.reviews_count ?? 0);
    });
    return sortedSpaces.length > 0 ? sortedSpaces.slice(0, 3) : [];
  }, [allSpaces]);


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
        
        <div className="relative z-10 px-6 py-12 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-6xl text-center">
            {/* Stronger Banner */}
            <div className="mb-6 flex justify-center">
              <div className="relative rounded-full px-6 py-3 text-sm leading-6 text-orange-700 ring-2 ring-orange-300 bg-white/80 backdrop-blur-sm shadow-lg">
                📘 Get Your Free Nomad Starter Guide{' '}
                <span className="font-semibold text-orange-600">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Download Now <span aria-hidden="true">&rarr;</span>
                </span>
              </div>
            </div>
            
            {/* Brand Title */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="block bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                NomadsHood
              </span>
        </h1>
            
            {/* Shortened, Sharp Subtitle */}
            <p className="mt-4 text-lg leading-7 text-gray-600 max-w-4xl mx-auto sm:text-xl">
              Explore 200+ verified colivings across 50+ countries — with real stories from digital nomads.
            </p>
            
            {/* Compact Stats with Emojis */}
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏠</span>
                <div>
                  <div className="text-2xl font-bold text-orange-600">200+</div>
                  <div className="text-xs text-gray-600">Coliving Spaces</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌍</span>
                <div>
                  <div className="text-2xl font-bold text-orange-600">50+</div>
                  <div className="text-xs text-gray-600">Countries</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧑‍💻</span>
                <div>
                  <div className="text-2xl font-bold text-orange-600">1000+</div>
                  <div className="text-xs text-gray-600">Nomads Connected</div>
                </div>
              </div>
            </div>
            
            {/* Refined CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200 px-6 py-3 text-base font-semibold" asChild>
                <Link href="/coliving">
                  🔍 Explore Coliving Spaces
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50 px-6 py-3 text-base font-semibold backdrop-blur-sm bg-white/70" asChild>
                <Link href="https://www.youtube.com/@nomadshood" target="_blank" rel="noopener noreferrer">
                  📽️ Watch Nomad Stories
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 px-6 py-3 text-base font-semibold backdrop-blur-sm bg-white/70" asChild>
                <Link href="https://coff.ee/volkanoluc" target="_blank" rel="noopener noreferrer">
                  ☕ Support NomadsHood
                </Link>
              </Button>
            </div>

            {/* Spain Guide Teaser */}
            <div className="max-w-4xl mx-auto">
              <SpainGuideTeaser />
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




      <section className="py-10">
        <div className="text-center mb-10">
          <MapPin className="h-12 w-12 text-orange-500 mx-auto mb-2" />
          <h2 className="text-3xl font-semibold">Spain Colivings</h2>
          <p className="text-lg text-foreground/70 mt-2">Discover the best coliving spaces in Spain.</p>
        </div>
        {spainColivings && spainColivings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {spainColivings.map((coliving) => (
              <Link
                key={coliving.id}
                href={`/colivings/${coliving.country?.toLowerCase()}/${coliving.id}`}
                className="block group"
              >
                <Card className="relative overflow-hidden rounded-lg shadow-lg h-80 hover:shadow-xl transition-shadow">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={coliving.mainImageUrl || 'https://placehold.co/600x400.png'}
                      alt={coliving.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2">{coliving.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      {coliving.city}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      {coliving.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{coliving.rating}</span>
                        </div>
                      )}
                      {coliving.monthlyPrice && (
                        <span className="text-sm font-semibold text-orange-600">
                          €{coliving.monthlyPrice}/mo
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No Spain colivings available yet. Check back soon!</p>
          </div>
        )}
      </section>


      <section className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Coming Soon</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're working on exciting new features to enhance your digital nomad experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* TripPlanner */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="absolute top-4 right-4">
              <Badge className="bg-blue-500 text-white font-medium">Coming Soon</Badge>
            </div>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-3 w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center">
                <Compass className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">TripPlanner</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Plan your perfect digital nomad journey with AI-powered itinerary recommendations.
              </p>
              <Button disabled variant="outline" className="border-blue-300 text-blue-700 cursor-not-allowed opacity-60 w-full">
                <Compass className="mr-2 h-4 w-4" />
                Plan Your Trip
              </Button>
            </CardContent>
          </Card>

          {/* Coliving Booking System */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="absolute top-4 right-4">
              <Badge className="bg-green-500 text-white font-medium">Coming Soon</Badge>
            </div>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-3 w-16 h-16 rounded-full bg-green-200 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Booking System</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Book your coliving spaces directly through our platform with exclusive deals.
              </p>
              <Button disabled variant="outline" className="border-green-300 text-green-700 cursor-not-allowed opacity-60 w-full">
                <Star className="mr-2 h-4 w-4" />
                Book Now
              </Button>
            </CardContent>
          </Card>

          {/* Feedback Form */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-3 w-16 h-16 rounded-full bg-purple-200 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Share Your Ideas</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Help us improve! Share your suggestions and feedback to shape our platform.
              </p>
              <Button asChild variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50 w-full">
                <Link href="https://forms.gle/your-google-form-link" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Give Feedback
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

    </div>
  );
}
