
import { useMemo } from 'react'; // Keep for potential client-side aspects if page evolves
import { ColivingCard } from '@/components/ColivingCard';
// import { mockColivingSpaces } from '@/lib/mock-data'; // Firebase data will be used
import type { ColivingSpace } from '@/types';
import { Info, ArrowLeft, Globe } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { getAllColivingSpaces } from '@/services/colivingService'; // Import Firebase service

interface CountryDisplayData {
  name: string;
  count: number;
  imageUrl: string;
  dataAiHint: string;
}

export default async function ColivingDirectoryPage({
  searchParams,
}: {
  searchParams?: { country?: string };
}) {
  const allSpaces: ColivingSpace[] = await getAllColivingSpaces();
  const selectedCountryName = searchParams?.country ? decodeURIComponent(searchParams.country) : null;

  const countryCounts: { [country: string]: number } = (() => {
    const counts: { [country: string]: number } = {};
    allSpaces.forEach(space => {
      const addressParts = space.address.split(', ');
      const country = addressParts[addressParts.length - 1];
      if (country) {
        counts[country] = (counts[country] || 0) + 1;
      }
    });
    return counts;
  })();

  const countriesData: CountryDisplayData[] = (() => 
    Object.entries(countryCounts)
      .map(([countryName, count]) => ({
        name: countryName,
        count: count,
        imageUrl: `https://placehold.co/600x400.png`, 
        dataAiHint: `flag ${countryName.toLowerCase().split(" ").slice(0,1).join("")}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  )();

  const filteredSpaces = (() => {
    if (!selectedCountryName) {
      return []; 
    }
    return allSpaces.filter(space => {
      const addressParts = space.address.split(', ');
      const countryNameInSpace = addressParts[addressParts.length - 1];
      return countryNameInSpace.toLowerCase() === selectedCountryName.toLowerCase();
    });
  })();

  const pageTitle = selectedCountryName
    ? `${selectedCountryName} Coliving Spaces`
    : 'Explore Coliving Spaces by Country';

  const pageDescription = selectedCountryName
    ? `Discover amazing coliving spaces in ${selectedCountryName}.`
    : 'Select a country to see available coliving spaces.';

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">{pageTitle}</h1>
        <p className="text-lg text-muted-foreground mt-2">
          {pageDescription}
        </p>
      </div>

      {selectedCountryName && (
        <Button variant="outline" asChild className="mb-4">
          <Link href="/coliving">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Countries
          </Link>
        </Button>
      )}

      {!selectedCountryName && countriesData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {countriesData.map((country) => (
            <Link key={country.name} href={`/coliving?country=${encodeURIComponent(country.name)}`} className="block group rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              <Card className="h-full transition-all duration-300 ease-in-out group-hover:shadow-xl group-focus-within:shadow-xl group-hover:border-primary/50 group-focus-within:border-primary/50 border border-transparent">
                <div className="relative h-40 w-full">
                  <Image
                    src={country.imageUrl}
                    alt={`Flag of ${country.name}`}
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
                    {country.count} coliving space{country.count !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
      
      {!selectedCountryName && countriesData.length === 0 && allSpaces.length === 0 && (
         <Alert className="max-w-lg mx-auto">
          <Globe className="h-4 w-4" />
          <AlertTitle>No Countries Available</AlertTitle>
          <AlertDescription>
            It seems there are no coliving spaces listed yet to populate countries. Add some to your Firebase database!
          </AlertDescription>
        </Alert>
      )}
       {!selectedCountryName && countriesData.length === 0 && allSpaces.length > 0 && (
         <Alert className="max-w-lg mx-auto">
          <Globe className="h-4 w-4" />
          <AlertTitle>No Countries Parsed</AlertTitle>
          <AlertDescription>
            Coliving spaces were found, but countries could not be determined from their addresses. Please check address formats.
          </AlertDescription>
        </Alert>
      )}


      {selectedCountryName && filteredSpaces.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpaces.map((space) => (
            <ColivingCard key={space.id} space={space} showViewDetailsButton={true} />
          ))}
        </div>
      )}

      {selectedCountryName && filteredSpaces.length === 0 && (
        <Alert className="max-w-lg mx-auto">
          <Info className="h-4 w-4" />
          <AlertTitle>No Spaces Found</AlertTitle>
          <AlertDescription>
            Sorry, we couldn&apos;t find any coliving spaces for {selectedCountryName}.
            <br />
            <Button variant="link" className="p-0 h-auto mt-2" asChild>
              <Link href="/coliving">View all countries</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
       {allSpaces.length === 0 && selectedCountryName && (
         <Alert className="max-w-lg mx-auto">
          <Info className="h-4 w-4" />
          <AlertTitle>No Spaces in Database</AlertTitle>
          <AlertDescription>
            There are currently no coliving spaces in the database. Please add some to see them listed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
