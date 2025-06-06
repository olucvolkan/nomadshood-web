import { ColivingCard } from '@/components/ColivingCard';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllColivingSpaces, getAllCountriesFromDB } from '@/services/colivingService';
import type { ColivingSpace, CountryData } from '@/types';
import { ArrowLeft, Building, Compass, Globe, Home, MapPin, Search, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
    
    // Sort countries by coliving count (most popular first)
    const sortedCountries = allCountries.sort((a, b) => (b.coliving_count || 0) - (a.coliving_count || 0));
    const totalSpaces = allCountries.reduce((sum, country) => sum + (country.coliving_count || 0), 0);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 rounded-3xl shadow-2xl mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-200/30 to-yellow-200/30"></div>
          <div className="relative z-10 text-center py-20 px-6">
            <div className="inline-flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Explore Colivings
              </h1>
            </div>
            <p className="text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
              Discover your perfect coliving destination from our global network of amazing spaces and communities.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-orange-600">{allCountries.length}</div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
              <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-orange-600">{totalSpaces}</div>
                <div className="text-sm text-gray-600">Coliving Spaces</div>
              </div>
              <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-orange-600">50K+</div>
                <div className="text-sm text-gray-600">Happy Nomads</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg px-8 py-4" asChild>
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50 px-8 py-4" asChild>
                <Link href="#countries">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Countries
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Countries Section */}
        <div id="countries" className="space-y-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <Compass className="h-8 w-8 text-orange-500" />
              <h2 className="text-3xl font-bold text-gray-800">Choose Your Destination</h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From vibrant city centers to peaceful coastal towns, find your ideal coliving experience worldwide.
            </p>
          </div>

          {allCountries.length > 0 ? (
            <>
              {/* Featured/Popular Countries */}
              {sortedCountries.slice(0, 6).length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-400 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Most Popular Destinations</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-orange-300 to-transparent"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sortedCountries.slice(0, 6).map((country, index) => (
                      <Link
                        key={country.id}
                        href={`/coliving?country=${encodeURIComponent(country.name)}`}
                        className="block group"
                      >
                        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-gradient-to-br from-white to-orange-50 group-hover:from-orange-50 group-hover:to-amber-50">
                          {/* Popular Badge */}
                          {index < 3 && (
                            <div className="absolute top-4 right-4 z-10">
                              <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium">
                                #{index + 1} Popular
                              </Badge>
                            </div>
                          )}
                          
                          <div className="p-8 text-center">
                            {/* Flag */}
                            <div className="relative mb-6 mx-auto">
                              {country.flagImageUrl ? (
                                <div className="relative w-24 h-16 mx-auto group-hover:scale-110 transition-transform duration-300">
                                  <Image
                                    src={country.flagImageUrl}
                                    alt={`${country.name} flag`}
                                    fill
                                    className="object-contain rounded-lg shadow-lg"
                                    data-ai-hint={`flag ${country.name.toLowerCase()}`}
                                  />
                                </div>
                              ) : (
                                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                  {country.flag}
                                </div>
                              )}
                              
                              {/* Decorative Ring */}
                              <div className="absolute -inset-4 border-2 border-orange-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            
                            {/* Country Info */}
                            <CardHeader className="p-0 mb-4">
                              <CardTitle className="text-2xl font-bold group-hover:text-orange-600 transition-colors duration-300">
                                {country.name}
                              </CardTitle>
                            </CardHeader>
                            
                            <CardContent className="p-0">
                              <div className="space-y-3">
                                <div className="flex items-center justify-center gap-2 text-orange-600">
                                  <Building className="h-4 w-4" />
                                  <span className="font-semibold">
                                    {country.coliving_count || 0} Coliving Space{country.coliving_count !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="w-full bg-orange-100 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-orange-400 to-amber-400 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((country.coliving_count || 0) / Math.max(...sortedCountries.map(c => c.coliving_count || 0)) * 100, 100)}%` }}
                                  ></div>
                                </div>
                                
                                <div className="text-sm text-gray-500">
                                  Perfect for digital nomads
                                </div>
                              </div>
                            </CardContent>
                          </div>
                          
                          {/* Hover Effect Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* All Countries */}
              {sortedCountries.length > 6 && (
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-lg flex items-center justify-center">
                      <Globe className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">All Destinations</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-blue-300 to-transparent"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {sortedCountries.slice(6).map((country) => (
                      <Link
                        key={country.id}
                        href={`/coliving?country=${encodeURIComponent(country.name)}`}
                        className="block group"
                      >
                        <Card className="h-full overflow-hidden shadow-md hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center p-4 text-center bg-white group-hover:bg-blue-50">
                          {country.flagImageUrl ? (
                            <div className="relative w-16 h-10 mb-3 group-hover:scale-110 transition-transform duration-300">
                              <Image
                                src={country.flagImageUrl}
                                alt={`${country.name} flag`}
                                fill
                                className="object-contain rounded-sm"
                                data-ai-hint={`flag ${country.name.toLowerCase()}`}
                              />
                            </div>
                          ) : (
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                              {country.flag}
                            </div>
                          )}
                          
                          <CardHeader className="p-0 mb-2">
                            <CardTitle className="text-sm font-semibold group-hover:text-blue-600 transition-colors duration-300 line-clamp-1">
                              {country.name}
                            </CardTitle>
                          </CardHeader>
                          
                          <CardContent className="p-0">
                            <p className="text-xs text-muted-foreground">
                              {country.coliving_count || 0} space{country.coliving_count !== 1 ? 's' : ''}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
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
      </div>
    );
  }

  // If a country is selected, fetch all coliving spaces and filter
  const allSpaces: ColivingSpace[] = await getAllColivingSpaces();
  const spacesInSelectedCountry = allSpaces.filter(
    (space) => space.country && space.country.toLowerCase() === selectedCountryName.toLowerCase()
  );

  const uniqueCitiesInCountry = Array.from(
    new Set(spacesInSelectedCountry.map((space) => space.city).filter(Boolean))
  ).map(city => ({
    name: city!,
    count: spacesInSelectedCountry.filter(s => s.city === city).length
  })).sort((a,b) => a.name.localeCompare(b.name));

  const filteredSpaces = selectedCityName
    ? spacesInSelectedCountry.filter(
        (space) => space.city && space.city.toLowerCase() === selectedCityName.toLowerCase()
      )
    : spacesInSelectedCountry;

  const pageTitle = selectedCityName
    ? `${selectedCityName}, ${selectedCountryName}`
    : `${selectedCountryName} Coliving Spaces`;

  const pageDescription = selectedCityName
    ? `Browse coliving spaces in ${selectedCityName}, ${selectedCountryName}.`
    : `Discover amazing coliving spaces in ${selectedCountryName}. Select a city or browse all.`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Navigation Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button variant="outline" size="lg" className="border-orange-300 text-orange-700 hover:bg-orange-50" asChild>
            <Link href="/coliving">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Countries
            </Link>
          </Button>
          {selectedCityName && selectedCountryName && (
            <Button variant="outline" size="lg" className="border-blue-300 text-blue-700 hover:bg-blue-50" asChild>
              <Link href={`/coliving?country=${encodeURIComponent(selectedCountryName)}`}>
                <MapPin className="mr-2 h-4 w-4" />
                All cities in {selectedCountryName}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 rounded-3xl shadow-2xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-200/30 to-yellow-200/30"></div>
        <div className="relative z-10 text-center py-16 px-6">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-xl">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
              {pageTitle}
            </h1>
          </div>
          <p className="text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            {pageDescription}
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="text-2xl font-bold text-orange-600">{filteredSpaces.length}</div>
              <div className="text-sm text-gray-600">Available Spaces</div>
            </div>
            {uniqueCitiesInCountry.length > 0 && (
              <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-orange-600">{uniqueCitiesInCountry.length}</div>
                <div className="text-sm text-gray-600">Cities</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coliving Spaces Grid */}
      <div className="space-y-8">
        {filteredSpaces.length > 0 ? (
          <>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Building className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedCityName ? `Coliving Spaces in ${selectedCityName}` : `All Spaces in ${selectedCountryName}`}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-green-300 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSpaces.map((space) => (
                <div key={space.id} className="transform hover:-translate-y-2 transition-transform duration-300">
                  <ColivingCard space={space} showViewDetailsButton={true} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 border border-gray-200/50 max-w-2xl mx-auto">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">No Spaces Found</h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Sorry, we couldn't find any coliving spaces for {selectedCityName ? `${selectedCityName}, ` : ''}{selectedCountryName}. 
                This could be because data is still being added or your location is not yet covered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" size="lg" className="border-orange-300 text-orange-600 hover:bg-orange-50" asChild>
                  <Link href="/coliving">
                    <Globe className="mr-2 h-4 w-4" />
                    Browse All Countries
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="border-blue-300 text-blue-600 hover:bg-blue-50" asChild>
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
