import { ColivingCard } from '@/components/ColivingCard';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllColivingSpaces, getAllCountriesFromDB } from '@/services/colivingService';
import type { ColivingSpace, CountryWithCommunities } from '@/types';
import { slugify } from '@/utils/slugify';
import { AlertCircle, ArrowLeft, Building, Compass, Globe, Home, Search } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  searchParams?: { country?: string; city?: string };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const selectedCountryName = searchParams?.country ? decodeURIComponent(searchParams.country) : null;
  const selectedCityName = searchParams?.city ? decodeURIComponent(searchParams.city) : null;

  let title = 'Discover Amazing Coliving Spaces';
  let description = 'Find the perfect coliving space for digital nomads and remote workers. Explore colivings worldwide with community, workspace, and adventure.';

  if (selectedCountryName && selectedCityName) {
    title = `Coliving Spaces in ${selectedCityName}, ${selectedCountryName}`;
    description = `Discover coliving spaces in ${selectedCityName}, ${selectedCountryName}. Perfect for digital nomads seeking community and workspace.`;
  } else if (selectedCountryName) {
    title = `Coliving Spaces in ${selectedCountryName}`;
    description = `Explore coliving spaces in ${selectedCountryName}. Find the perfect place for remote work and nomadic lifestyle.`;
  }

  const canonicalUrl = selectedCountryName 
    ? `/colivings/${slugify(selectedCountryName)}`
    : '/coliving';

  return {
    title,
    description: description.slice(0, 160),
    openGraph: {
      title: `${title} | NomadsHood`,
      description,
    },
    twitter: {
      title: `${title} | NomadsHood`,
      description,
    },
    alternates: {
      canonical: canonicalUrl
    }
  };
}

export default async function ColivingDirectoryPage({
  searchParams,
}: Props) {
  const selectedCountryName = searchParams?.country ? decodeURIComponent(searchParams.country) : null;
  const selectedCityName = searchParams?.city ? decodeURIComponent(searchParams.city) : null;

  const allSpaces: ColivingSpace[] = await getAllColivingSpaces();
  const countries: CountryWithCommunities[] = await getAllCountriesFromDB();

  // Filter spaces based on selected country and city
  const filteredSpaces = allSpaces.filter((space) => {
    const matchesCountry = selectedCountryName ? space.country === selectedCountryName : true;
    const matchesCity = selectedCityName ? space.city === selectedCityName : true;
    return matchesCountry && matchesCity;
  });

  const sortedCountries = countries.sort((a, b) => (b.coliving_count || 0) - (a.coliving_count || 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl mb-6 shadow-xl">
            <Home className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent mb-6">
            {selectedCityName 
              ? `Coliving in ${selectedCityName}` 
              : selectedCountryName 
                ? `Coliving in ${selectedCountryName}` 
                : 'Discover Amazing Coliving Spaces'
            }
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {selectedCityName 
              ? `Find the perfect coliving space in ${selectedCityName}, ${selectedCountryName}. Join a community of digital nomads and remote workers.`
              : selectedCountryName 
                ? `Explore coliving spaces across ${selectedCountryName}. Connect with like-minded people and find your ideal workspace.`
                : 'Find the perfect coliving space for digital nomads and remote workers. Explore colivings worldwide with community, workspace, and adventure.'
            }
          </p>
        </div>

        {/* Breadcrumb Navigation */}
        {(selectedCountryName || selectedCityName) && (
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/coliving" className="text-orange-600 hover:text-orange-700 transition-colors">
                All Countries
              </Link>
              {selectedCountryName && (
                <>
                  <span className="text-gray-400">/</span>
                  {selectedCityName ? (
                    <Link 
                      href={`/colivings/${slugify(selectedCountryName)}`} 
                      className="text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      {selectedCountryName}
                    </Link>
                  ) : (
                    <span className="text-gray-700">{selectedCountryName}</span>
                  )}
                </>
              )}
              {selectedCityName && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-700">{selectedCityName}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Back Button */}
        {selectedCountryName && (
          <div className="mb-8">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-orange-300 text-orange-700 hover:bg-orange-50 shadow-md" 
              asChild
            >
              {selectedCityName ? (
                <Link href={`/colivings/${slugify(selectedCountryName)}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to {selectedCountryName}
                </Link>
              ) : (
                <Link href="/coliving">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to All Countries
                </Link>
              )}
            </Button>
          </div>
        )}

        {/* Main Content */}
        {!selectedCountryName ? (
          // Country Directory
          <>
            <div className="mb-16">
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-orange-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">Most Popular Destinations</h2>
                    <p className="text-gray-600 mt-1">Top countries chosen by digital nomads for coliving experiences</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedCountries.slice(0, 6).map((country, index) => (
                    <Link
                      key={country.id}
                      href={`/colivings/${slugify(country.name)}`}
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
                        
                        <div className="p-6">
                          <CardHeader className="p-0 mb-4">
                            <div className="flex items-center gap-4">
                              {country.flagImageUrl ? (
                                <div className="relative w-16 h-10 group-hover:scale-110 transition-transform duration-300">
                                  <Image
                                    src={country.flagImageUrl}
                                    alt={`${country.name} flag`}
                                    fill
                                    className="object-contain rounded-sm"
                                    data-ai-hint={`flag ${country.name.toLowerCase()}`}
                                  />
                                </div>
                              ) : (
                                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                                  {country.flag}
                                </div>
                              )}
                              <div>
                                <CardTitle className="text-xl font-bold group-hover:text-orange-600 transition-colors duration-300">
                                  {country.name}
                                </CardTitle>
                                <p className="text-sm text-gray-500 mt-1">Explore amazing spaces</p>
                              </div>
                            </div>
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
            </div>

            {/* All Countries */}
            {sortedCountries.length > 6 && (
              <div className="mb-16">
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Compass className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">All Destinations</h2>
                      <p className="text-gray-600">Explore coliving spaces in every corner of the world</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {sortedCountries.slice(6).map((country) => (
                      <Link
                        key={country.id}
                        href={`/colivings/${slugify(country.name)}`}
                        className="group"
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
              </div>
            )}
          </>
        ) : filteredSpaces.length === 0 ? (
          // No spaces found
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No Coliving Spaces Found</h2>
            <p className="text-lg text-gray-600 mb-8">
              {selectedCityName 
                ? `We couldn't find any coliving spaces in ${selectedCityName}, ${selectedCountryName}.`
                : `We couldn't find any coliving spaces in ${selectedCountryName}.`
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/coliving">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Explore All Countries
                </Link>
              </Button>
              {selectedCityName && (
                <Button asChild size="lg">
                  <Link href={`/colivings/${slugify(selectedCountryName)}`}>
                    View All {selectedCountryName} Spaces
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ) : (
          // Coliving Spaces
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
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Results Found</AlertTitle>
                <AlertDescription>
                  No coliving spaces found for your search criteria. Try adjusting your filters.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
