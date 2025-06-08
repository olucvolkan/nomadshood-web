import ColivingImage from '@/components/ColivingImage';
import { getAllColivingSpaces } from '@/services/colivingService';
import type { ColivingSpace } from '@/types';
import { createColivingSlug, slugify } from '@/utils/slugify';
import { ArrowLeft, MapPin, Star, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = {
  params: { country: string };
};

// Function to get all coliving spaces in a country
async function getColivingsInCountry(country: string): Promise<ColivingSpace[]> {
  const allSpaces = await getAllColivingSpaces();
  
  return allSpaces.filter(space => {
    if (!space.country) return false;
    return slugify(space.country) === country;
  });
}

// Function to get original country name
async function getCountryInfo(country: string): Promise<{ countryName: string } | null> {
  const allSpaces = await getAllColivingSpaces();
  
  const space = allSpaces.find(space => {
    if (!space.country) return false;
    return slugify(space.country) === country;
  });
  
  return space ? { countryName: space.country } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const paramsResolved = await params;
  const countryInfo = await getCountryInfo(paramsResolved.country);
  const colivings = await getColivingsInCountry(paramsResolved.country);

  if (!countryInfo) {
    return {
      title: 'Country Not Found',
      description: 'The requested country could not be found.'
    };
  }

  const uniqueCities = Array.from(new Set(colivings.map(space => space.city).filter(Boolean)));
  const title = `Coliving Spaces in ${countryInfo.countryName}`;
  const description = `Discover ${colivings.length} premium coliving spaces across ${uniqueCities.length} cities in ${countryInfo.countryName}. Perfect for digital nomads and remote workers.`;

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
      canonical: `/colivings/${paramsResolved.country}`
    }
  };
}

// Generate static params for static generation
export async function generateStaticParams(): Promise<Props['params'][]> {
  try {
    const allSpaces = await getAllColivingSpaces();
    
    // Get unique countries
    const uniqueCountries = Array.from(
      new Set(
        allSpaces
          .filter(space => space.country)
          .map(space => slugify(space.country!))
      )
    );
    
    return uniqueCountries.map(country => ({ country }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function CountryColivingsPage({ params: paramsProp }: { params: { country: string } }) {
  const params = await paramsProp;
  const countryInfo = await getCountryInfo(params.country);
  const colivings = await getColivingsInCountry(params.country);

  if (!countryInfo || colivings.length === 0) {
    notFound();
  }

  const uniqueCities = Array.from(new Set(colivings.map(space => space.city).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/coliving"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-orange-200 text-orange-700 hover:bg-orange-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Colivings
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent mb-4">
            Coliving Spaces in {countryInfo.countryName}
          </h1>
          <p className="text-lg text-gray-700 mb-4">
            Explore {colivings.length} coliving spaces across {uniqueCities.length} cities
          </p>
        </div>

        {/* Colivings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {colivings.map((space) => {
            const spaceSlug = createColivingSlug(space.name, space.id);
            
            return (
              <Link
                key={space.id}
                href={`/colivings/${params.country}/${spaceSlug}`}
                className="group block"
              >
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-orange-100 group-hover:border-orange-200">
                  {/* Space Image/Logo */}
                  <div className="relative h-48 w-full">
                    <ColivingImage
                      logoUrl={space.logoUrl}
                      name={space.name}
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-xl text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {space.name}
                      </h3>
                      {space.rating && (
                        <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-medium text-gray-700">{space.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    {space.brand && (
                      <p className="text-sm text-gray-600 mb-2">{space.brand}</p>
                    )}

                    {(space.address || space.city) && (
                      <div className="flex items-start gap-2 text-gray-600 mb-4">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-orange-500" />
                        <span className="text-sm">
                          {space.address || `${space.city}, ${countryInfo.countryName}`}
                        </span>
                      </div>
                    )}

                    {/* Stats Row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {space.monthlyPrice > 0 && (
                          <div className="text-orange-600 font-bold">
                            ${space.monthlyPrice}/mo
                          </div>
                        )}
                      </div>

                      {space.capacity && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{space.capacity} guests</span>
                        </div>
                      )}
                    </div>

                    {/* Amenities Preview */}
                    {space.amenities && space.amenities.length > 0 && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-1">
                          {space.amenities.slice(0, 3).map((amenity) => (
                            <span
                              key={amenity}
                              className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full"
                            >
                              {amenity}
                            </span>
                          ))}
                          {space.amenities.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{space.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* No Results Message */}
        {colivings.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No coliving spaces found</h3>
            <p className="text-sm text-gray-500">
              We couldn't find any coliving spaces in {countryInfo.countryName} at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 