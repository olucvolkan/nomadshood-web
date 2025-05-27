
import type { ColivingSpace, CountryData } from '@/types';
import { getAllColivingSpaces, getAllCountriesFromDB } from '@/services/colivingService';
import { ColivingCard } from '@/components/ColivingCard';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Building, Wifi } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default async function ColivingDirectoryPage({
  searchParams,
}: {
  searchParams?: { country?: string; city?: string };
}) {
  const selectedCountryName = searchParams?.country ? decodeURIComponent(searchParams.country) : null;
  const selectedCityName = searchParams?.city ? decodeURIComponent(searchParams.city) : null;

  // If no country is selected, show the list of countries from "countries" collection
  if (!selectedCountryName) {
    const allCountries: CountryData[] = await getAllCountriesFromDB();
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">Coliving Directory</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Explore coliving spaces by selecting a country below.
          </p>
        </div>
        {allCountries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allCountries.map((country) => (
              <Link 
                key={country.id} 
                href={`/coliving?country=${encodeURIComponent(country.name)}`}
                className="block group"
              >
                <Card className="h-full overflow-hidden shadow-md hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col">
                  <div className="relative h-40 w-full">
                    <Image
                      src={country.cover_image}
                      alt={`Discover coliving in ${country.name}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      data-ai-hint={`landmark ${country.name.toLowerCase()}`}
                    />
                     {country.flagImageUrl ? (
                        <div className="absolute top-2 right-2 bg-background/70 p-1 rounded-sm backdrop-blur-sm">
                          <Image
                            src={country.flagImageUrl}
                            alt={`${country.name} flag`}
                            width={32} // Adjust size as needed
                            height={20} // Adjust size as needed
                            className="object-contain"
                          />
                        </div>
                      ) : (
                         <div className="absolute top-2 right-2 text-3xl bg-black/30 p-1 rounded-sm">{country.flag}</div>
                      )}
                  </div>
                  <CardHeader className="p-4 flex-grow">
                    <CardTitle className="text-xl group-hover:text-primary">{country.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">
                      {country.coliving_count || 0} coliving space{country.coliving_count !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Alert className="max-w-lg mx-auto">
            <Building className="h-4 w-4" />
            <AlertTitle>No Countries Found</AlertTitle>
            <AlertDescription>
              It seems there are no countries listed in the database yet. Please add data to the 'countries' collection in Firestore.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // If a country is selected, fetch all coliving spaces and filter
  const allSpaces: ColivingSpace[] = await getAllColivingSpaces();
  const spacesInSelectedCountry = allSpaces.filter(
    (space) => space.country.toLowerCase() === selectedCountryName.toLowerCase()
  );

  const uniqueCitiesInCountry = Array.from(
    new Set(spacesInSelectedCountry.map((space) => space.city).filter(Boolean))
  ).map(city => ({
    name: city,
    count: spacesInSelectedCountry.filter(s => s.city === city).length
  })).sort((a,b) => a.name.localeCompare(b.name));

  const filteredSpaces = selectedCityName
    ? spacesInSelectedCountry.filter(
        (space) => space.city.toLowerCase() === selectedCityName.toLowerCase()
      )
    : spacesInSelectedCountry;

  const pageTitle = selectedCityName
    ? `${selectedCityName}, ${selectedCountryName}`
    : `${selectedCountryName} Coliving Spaces`;
  
  const pageDescription = selectedCityName
    ? `Browse coliving spaces in ${selectedCityName}, ${selectedCountryName}.`
    : `Discover amazing coliving spaces in ${selectedCountryName}. Select a city or browse all.`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/coliving">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Countries
          </Link>
        </Button>
         {selectedCityName && selectedCountryName && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/coliving?country=${encodeURIComponent(selectedCountryName)}`}>
              <MapPin className="mr-2 h-4 w-4" />
              All cities in {selectedCountryName}
            </Link>
          </Button>
        )}
      </div>

      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">{pageTitle}</h1>
        <p className="text-lg text-muted-foreground mt-2">{pageDescription}</p>
      </div>

      {!selectedCityName && uniqueCitiesInCountry.length > 0 && (
        <div className="my-6 p-4 bg-card rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 text-center sm:text-left">
            Filter by City in {selectedCountryName}:
          </h2>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            {uniqueCitiesInCountry.map((city) => (
              <Button key={city.name} variant="secondary" size="sm" asChild>
                <Link href={`/coliving?country=${encodeURIComponent(selectedCountryName)}&city=${encodeURIComponent(city.name)}`}>
                  {city.name} ({city.count})
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}

      {filteredSpaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpaces.map((space) => (
            <ColivingCard key={space.id} space={space} showViewDetailsButton={true} />
          ))}
        </div>
      ) : (
        <Alert className="max-w-lg mx-auto">
          <MapPin className="h-4 w-4" />
          <AlertTitle>No Spaces Found</AlertTitle>
          <AlertDescription>
            Sorry, we couldn't find any coliving spaces for {selectedCityName ? `${selectedCityName}, ` : ''} {selectedCountryName}.
            This could be because data is still being added or your Firestore security rules need adjustment.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

```