import ColivingLogo from '@/components/ColivingLogo';
import { JsonLd } from '@/components/JsonLd';
import { NearbyPlacesTabs } from '@/components/NearbyPlacesTabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllColivingSpaces, getColivingReviewsByColivingId, getNearbyPlaces } from '@/services/colivingService';
import type { CategorizedNearbyPlaceGroup, ColivingReviewData, ColivingSpace, ReviewItem } from '@/types';
import { createColivingSlug, slugify } from '@/utils/slugify';
import {
    ArrowLeft,
    Banknote,
    Beer,
    Bike,
    Briefcase,
    Building,
    Bus,
    ChefHat,
    Coffee,
    Dumbbell,
    ExternalLink,
    Footprints,
    Globe,
    Home,
    Hospital,
    Landmark,
    Mail,
    Map,
    MapPin,
    MessageCircle,
    MessageSquare,
    Mountain,
    MountainSnow,
    Phone,
    Plane,
    ShoppingCart,
    Star,
    Store,
    Trees,
    Utensils,
    Video,
    WavesIcon
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const StarRating: React.FC<{ rating?: number; maxStars?: number, starSize?: string, totalRatings?: number, showTextRating?: boolean }> = ({ rating, maxStars = 5, starSize = "h-4 w-4", totalRatings, showTextRating = false }) => {
  if (typeof rating !== 'number' || rating < 0 || rating > 5) {
    return <span className="text-xs text-muted-foreground">No rating</span>;
  }
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = maxStars - fullStars - halfStar;

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className={`${starSize} text-yellow-500 fill-current`} />
      ))}
      {halfStar === 1 && <Star key="half" className={`${starSize} text-yellow-500 fill-yellow-200`} />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={`${starSize} text-yellow-300/70`} />
      ))}
      {showTextRating && <span className="ml-1 text-xs font-medium">{rating.toFixed(1)}</span>}
      {typeof totalRatings === 'number' && (
        <span className="ml-1.5 text-xs text-muted-foreground">({totalRatings})</span>
      )}
    </div>
  );
};

const NearbyPlaceIcon: React.FC<{ type: string; className?: string }> = ({ type, className = "h-5 w-5 text-primary mr-2" }) => {
  switch (type?.toLowerCase()) {
    case 'cafe': return <Coffee className={className} />;
    case 'restaurant': return <Utensils className={className} />;
    case 'food': return <ChefHat className={className} />;
    case 'park': return <Trees className={className} />;
    case 'gym': return <Dumbbell className={className} />;
    case 'supermarket':
    case 'grocery_or_supermarket':
      return <ShoppingCart className={className} />;
    case 'transit_station':
    case 'bus_station':
    case 'subway_station':
    case 'public_transport':
       return <Bus className={className} />;
    case 'bank':
    case 'atm':
      return <Banknote className={className} />;
    case 'hospital':
    case 'doctor':
    case 'pharmacy':
      return <Hospital className={className} />;
    case 'shopping_mall':
    case 'clothing_store':
    case 'store':
    case 'shopping':
      return <Store className={className} />;
    case 'bar':
    case 'night_club':
    case 'nightlife':
      return <Beer className={className} />;
    case 'beach':
      return <WavesIcon className={className} />;
    case 'hiking_trail':
    case 'mountain':
    case 'hiking':
      return <MountainSnow className={className} />;
    case 'coworking_space':
    case 'coworking':
      return <Briefcase className={className} />;
    case 'tourist_attraction':
    case 'landmark':
       return <Landmark className={className} />;
    default: return <MapPin className={className} />;
  }
};

type Props = {
  params: { country: string; slug: string };
};

// Function to find coliving space by URL parameters
async function findColivingByParams(country: string, slug: string): Promise<ColivingSpace | null> {
  const allSpaces = await getAllColivingSpaces();
  
  // Find matching space by country and slug
  const matchingSpace = allSpaces.find(space => {
    if (!space.country) return false;
    
    const spaceCountrySlug = slugify(space.country);
    const spaceSlug = createColivingSlug(space.name, space.id);
    
    return spaceCountrySlug === country && spaceSlug === slug;
  });
  
  return matchingSpace || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const paramsResolved = await params;
  const space = await findColivingByParams(paramsResolved.country, paramsResolved.slug);

  if (!space) {
    return {
      title: 'Coliving Space Not Found',
      description: 'The requested coliving space could not be found.'
    };
  }

  const title = `${space.name} - Coliving in ${space.city || space.country}`;
  const description = `Discover ${space.name}, a premium coliving space in ${space.city || space.country}. ${space.amenities?.length ? `Features ${space.amenities.slice(0, 3).join(', ')} and more.` : ''} Perfect for digital nomads and remote workers.`;

  return {
    title,
    description: description.slice(0, 160),
    openGraph: {
      title: `${title} | NomadsHood`,
      description,
      images: space.logoUrl ? [
        {
          url: space.logoUrl,
          width: 1200,
          height: 630,
          alt: `${space.name} logo`
        }
      ] : undefined,
    },
    twitter: {
      title: `${title} | NomadsHood`,
      description,
      images: space.logoUrl ? [space.logoUrl] : undefined,
    },
    alternates: {
      canonical: `/colivings/${paramsResolved.country}/${paramsResolved.slug}`
    }
  };
}

// Generate static params for static generation
export async function generateStaticParams(): Promise<Props['params'][]> {
  try {
    const allSpaces = await getAllColivingSpaces();
    
    return allSpaces
      .filter(space => space.country && space.name) // Only include spaces with complete data
      .map(space => ({
        country: slugify(space.country!),
        slug: createColivingSlug(space.name, space.id)
      }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function ColivingDetailPage({ params: paramsProp }: { params: { country: string; slug: string } }) {
  const params = await paramsProp;
  const space = await findColivingByParams(params.country, params.slug);

  if (!space) {
    notFound();
  }

  const reviewData: ColivingReviewData | null = await getColivingReviewsByColivingId(space.id);
  const categorizedNearbyPlaces: CategorizedNearbyPlaceGroup[] = await getNearbyPlaces(space.id);
  const displayAddress = space.address || 'Location not specified';
  const hasValidCoordinates = typeof space.coordinates?.latitude === 'number' && typeof space.coordinates?.longitude === 'number';

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": space.name,
    "description": `${space.name} is a coliving space located in ${space.city || space.country}.`,
    "address": space.address ? {
      "@type": "PostalAddress",
      "streetAddress": space.address,
      "addressLocality": space.city,
      "addressCountry": space.country
    } : undefined,
    "url": space.websiteUrl,
    "logo": space.logoUrl,
    "geo": hasValidCoordinates ? {
      "@type": "GeoCoordinates",
      "latitude": space.coordinates?.latitude,
      "longitude": space.coordinates?.longitude
    } : undefined,
    "aggregateRating": space.rating ? {
      "@type": "AggregateRating",
      "ratingValue": space.rating,
      "bestRating": "5"
    } : undefined,
    "priceRange": space.monthlyPrice ? `$${space.monthlyPrice}/month` : undefined,
    "amenityFeature": space.amenities?.map(amenity => ({
      "@type": "LocationFeatureSpecification",
      "name": amenity
    })),
    "maximumAttendeeCapacity": space.capacity
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-8">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-orange-300 text-orange-700 hover:bg-orange-50 shadow-md" 
              asChild
            >
              <Link href={`/colivings/${params.country}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {space.country} Colivings
              </Link>
            </Button>
          </div>

          {/* Hero Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 rounded-3xl shadow-2xl mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-200/30 to-yellow-200/30"></div>
            <div className="relative z-10 p-8">
              <div className="flex flex-col lg:flex-row items-start gap-8">
                {/* Logo or Fallback */}
                <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white flex-shrink-0">
                  <ColivingLogo logoUrl={space.logoUrl} name={space.name} />
                </div>

                {/* Main Info */}
                <div className="flex-1">
                  <div className="mb-6">
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent mb-3">
                      {space.name}
                    </h1>
                    {space.brand && (
                      <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 mb-3">
                        <Briefcase className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-gray-700">{space.brand}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-3 text-gray-700 text-lg">
                      <MapPin className="h-6 w-6 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>{displayAddress}</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {space.monthlyPrice > 0 && (
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">${space.monthlyPrice}</div>
                        <div className="text-xs text-gray-600">/month</div>
                      </div>
                    )}
                    {space.rating && (
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">{space.rating}</div>
                        <div className="text-xs text-gray-600">Rating</div>
                      </div>
                    )}
                    {space.capacity && (
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">{space.capacity}</div>
                        <div className="text-xs text-gray-600">Capacity</div>
                      </div>
                    )}
                    {space.status && (
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center">
                        <div className="text-sm font-bold text-green-600">{space.status.toUpperCase()}</div>
                        <div className="text-xs text-gray-600">Status</div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4">
                    {space.websiteUrl && (
                      <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg" asChild>
                        <Link href={space.websiteUrl} target="_blank" rel="noopener noreferrer">
                          <Globe className="mr-2 h-4 w-4" />
                          Visit Website
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    {space.whatsappLink && (
                      <Button size="lg" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 shadow-md" asChild>
                        <Link href={space.whatsappLink} target="_blank" rel="noopener noreferrer">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          WhatsApp
                        </Link>
                      </Button>
                    )}
                    {space.videoUrl && (
                      <Button size="lg" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 shadow-md" asChild>
                        <Link href={space.videoUrl} target="_blank" rel="noopener noreferrer">
                          <Video className="mr-2 h-4 w-4" />
                          Watch Video
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nearby Places Section */}
          {categorizedNearbyPlaces.length > 0 && (
            <div className="mb-8">
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Map className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">What's Around {space.name}?</h2>
                    <p className="text-gray-600 mt-1">Discover points of interest near this coliving space.</p>
                  </div>
                </div>
                
                {/* Tab-based compact design */}
                <NearbyPlacesTabs categorizedNearbyPlaces={categorizedNearbyPlaces} />
              </div>
            </div>
          )}

          {/* Room Types Section */}
          {space.room_types && space.room_types.length > 0 && (
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Room Types & Pricing</h2>
                  <p className="text-gray-600 mt-1">Available accommodation options and their pricing.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {space.room_types.map((room, index) => (
                  <div key={index} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <Home className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-gray-800">{room.type || 'Room'}</span>
                    </div>
                    {room.price && (
                      <div className="mb-2">
                        <p className="text-2xl font-bold text-indigo-600">
                          {room.currency || '$'}{room.price}
                        </p>
                        <p className="text-sm text-gray-600">per month</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transportation Section */}
          {space.transportation && (
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Bus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Transportation & Access</h2>
                  <p className="text-gray-600 mt-1">Getting around and accessing the location.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {space.transportation.airport_distance && (
                  <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                    <Plane className="h-5 w-5 text-blue-500" />
                    <div>
                      <span className="text-sm font-medium text-gray-600">Airport Distance</span>
                      <p className="font-semibold text-gray-800">{space.transportation.airport_distance}</p>
                    </div>
                  </div>
                )}
                
                {space.transportation.public_transport && (
                  <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                    <Bus className="h-5 w-5 text-green-500" />
                    <div>
                      <span className="text-sm font-medium text-gray-600">Public Transport</span>
                      <p className="font-semibold text-gray-800">{space.transportation.public_transport}</p>
                    </div>
                  </div>
                )}
                
                {space.transportation.bike_rental && (
                  <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                    <Bike className="h-5 w-5 text-orange-500" />
                    <div>
                      <span className="text-sm font-medium text-gray-600">Bike Rental</span>
                      <p className="font-semibold text-gray-800">Available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Nearby Attractions */}
          {space.nearby_attractions && space.nearby_attractions.length > 0 && (
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Mountain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Nearby Attractions</h2>
                  <p className="text-gray-600 mt-1">Points of interest and attractions near this location.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {space.nearby_attractions.map((attraction, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                    <Footprints className="h-5 w-5 text-rose-500" />
                    <span className="font-medium text-gray-800">{attraction}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {(space.contact?.email || space.contact?.phone) && (
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Contact Information</h2>
                  <p className="text-gray-600 mt-1">Get in touch with the coliving space.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {space.contact?.email && (
                  <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                      <span className="text-sm font-medium text-gray-600">Email</span>
                      <p className="font-semibold text-gray-800">
                        <a href={`mailto:${space.contact.email}`} className="hover:underline">
                          {space.contact.email}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
                
                {space.contact?.phone && (
                  <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                    <Phone className="h-5 w-5 text-green-500" />
                    <div>
                      <span className="text-sm font-medium text-gray-600">Phone</span>
                      <p className="font-semibold text-gray-800">{space.contact.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          {reviewData && reviewData.reviews && reviewData.reviews.length > 0 && (
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Reviews</h2>
                  <p className="text-gray-600 mt-1">What people are saying about this coliving space.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviewData.reviews.slice(0, 6).map((review: ReviewItem, index: number) => (
                  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.profile_photo_url} />
                        <AvatarFallback>{review.author_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-800">{review.author_name || 'Anonymous'}</p>
                        <StarRating rating={review.rating} starSize="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm line-clamp-4">{review.text}</p>
                    {review.time && (
                      <p className="text-xs text-gray-500 mt-2">{review.time}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags Section */}
          {space.tags && space.tags.length > 0 && (
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Tags</h2>
                  <p className="text-gray-600 mt-1">Categories and features of this coliving space.</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {space.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-700 border-cyan-200 px-4 py-2">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 