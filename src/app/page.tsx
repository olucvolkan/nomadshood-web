
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { List, Lightbulb, Users, MapPin, Video, Globe } from 'lucide-react';
import { mockColivingSpaces } from '@/lib/mock-data';
import type { ColivingSpace } from '@/types';

interface CountryDisplayData {
  name: string;
  count: number;
  imageUrl: string;
  dataAiHint: string;
}

export default function HomePage() {
  const countryCounts: { [country: string]: number } = {};
  mockColivingSpaces.forEach(space => {
    const addressParts = space.address.split(', ');
    const country = addressParts[addressParts.length - 1];
    if (country) {
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    }
  });

  const countrySpecificHints: { [key: string]: string } = {
    "Indonesia": "bali landscape",
    "Portugal": "lisbon cityscape",
    "USA": "colorado mountains",
    "Japan": "tokyo street",
    "South Africa": "capetown coast",
    "Colombia": "medellin valley",
  };

  const countriesData: CountryDisplayData[] = Object.entries(countryCounts)
    .map(([countryName, count]) => ({
      name: countryName,
      count: count,
      imageUrl: `https://placehold.co/600x400.png`,
      dataAiHint: countrySpecificHints[countryName] || countryName.toLowerCase().split(" ").slice(0,2).join(" "),
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending

  return (
    <div className="space-y-12">
      <section className="text-center py-10 bg-gradient-to-r from-primary/10 via-background to-accent/10 rounded-xl shadow-sm">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary">
          Welcome to Nomad Coliving Hub
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
                      alt={`Beautiful view of ${country.name}`}
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
          <p className="text-center text-muted-foreground">No destination data available yet.</p>
        )}
      </section>

      <section className="text-center">
        <Image 
          src="https://placehold.co/800x400.png" 
          alt="Nomads working and collaborating" 
          width={800} 
          height={400}
          className="rounded-lg mx-auto shadow-md"
          data-ai-hint="nomads collaboration" 
        />
        <h2 className="text-3xl font-semibold mt-6">Join the Movement</h2>
        <p className="mt-2 text-lg text-foreground/70 max-w-xl mx-auto">
          Nomad Coliving Hub is more than a directory; it&apos;s your gateway to a global community.
        </p>
      </section>
    </div>
  );
}
