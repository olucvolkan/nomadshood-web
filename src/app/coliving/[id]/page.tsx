import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getColivingReviewsByColivingId, getColivingSpaceById, getNearbyPlaces } from '@/services/colivingService';
import type { CategorizedNearbyPlaceGroup, ColivingReviewData, ColivingSpace, ReviewItem } from '@/types';
import {
    AlertCircle,
    ArrowLeft,
    Banknote,
    Beer,
    Bike,
    Briefcase,
    Building,
    Bus,
    CalendarClock,
    ChefHat,
    Clock,
    Coffee,
    DollarSign,
    Dumbbell,
    ExternalLink,
    Footprints,
    Globe,
    Globe2,
    Home,
    Hospital,
    Info,
    Landmark,
    LanguagesIcon,
    LocateFixed,
    Mail,
    Map,
    MapPin,
    MessageCircle,
    MessageSquare,
    Mountain,
    MountainSnow,
    Phone,
    Plane,
    Search,
    ShoppingCart,
    Smile,
    Star,
    Store,
    Thermometer,
    Trees,
    Users,
    Users2,
    Utensils,
    Video,
    WavesIcon,
    Wifi
} from 'lucide-react';
import Image from 'next/image';
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


export default async function ColivingDetailPage({ params: paramsProp }: { params: { id: string } }) {
  const params = await paramsProp;
  const space: ColivingSpace | null = await getColivingSpaceById(params.id);
  const reviewData: ColivingReviewData | null = await getColivingReviewsByColivingId(params.id);
  const categorizedNearbyPlaces: CategorizedNearbyPlaceGroup[] = await getNearbyPlaces(params.id);

  if (!space) {
    notFound();
  }

  const displayAddress = space.address || 'Location not specified';
  const hasValidCoordinates = typeof space.coordinates?.latitude === 'number' && typeof space.coordinates?.longitude === 'number';

  return (
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
            <Link href="/coliving">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Colivings
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 rounded-3xl shadow-2xl mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-200/30 to-yellow-200/30"></div>
          <div className="relative z-10 p-8">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Logo */}
              {space.logoUrl && !space.logoUrl.includes('placehold.co') && (
                <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white p-2 flex-shrink-0">
                  <Image
                    src={space.logoUrl}
                    alt={`${space.name || 'Coliving'} logo`}
                    fill
                    style={{objectFit: 'contain'}}
                    data-ai-hint="company logo"
                  />
                </div>
              )}

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
                      <div className="text-xs text-gray-600">{space.currency || ''}/month</div>
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

                {/* Contact Info */}
                {(space.email || space.phone) && (
                  <div className="mt-6 flex flex-wrap gap-4">
                    {space.email && (
                      <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <a href={`mailto:${space.email}`} className="text-sm text-gray-700 hover:underline">{space.email}</a>
                      </div>
                    )}
                    {space.phone && (
                      <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2">
                        <Phone className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">{space.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {categorizedNearbyPlaces.length > 0 && (
          <div className="mb-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Map className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">What's Around {space.name}?</h2>
                  <p className="text-gray-600 mt-1">Discover points of interest near this coliving space. Distances are approximate.</p>
                </div>
              </div>
              
              <Tabs defaultValue={categorizedNearbyPlaces[0]?.categoryKey} className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 mb-8 h-auto bg-gradient-to-r from-orange-100 to-amber-100 p-2 rounded-2xl">
                  {categorizedNearbyPlaces.map((categoryGroup) => (
                    <TabsTrigger
                      key={categoryGroup.categoryKey}
                      value={categoryGroup.categoryKey}
                      className="text-xs sm:text-sm px-3 py-3 h-full flex items-center justify-center leading-tight rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                    >
                      <NearbyPlaceIcon type={categoryGroup.categoryKey} className="h-4 w-4 mr-2 hidden xs:inline-block flex-shrink-0" />
                      <span className="truncate font-medium">{categoryGroup.categoryDisplayName}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {categorizedNearbyPlaces.map((categoryGroup) => (
                  <TabsContent key={categoryGroup.categoryKey} value={categoryGroup.categoryKey} className="mt-0">
                    {categoryGroup.places.length > 0 ? (
                      <ScrollArea className="w-full whitespace-nowrap rounded-2xl">
                        <div className="flex w-max space-x-6 p-4">
                          {categoryGroup.places.map((place) => (
                            <Card key={place.id} className="w-[280px] sm:w-[320px] flex-shrink-0 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50">
                              <CardHeader className="p-6 pb-4">
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                    <NearbyPlaceIcon type={place.type} className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <CardTitle className="text-lg font-bold text-gray-800 line-clamp-2 mb-2">
                                      {place.name}
                                    </CardTitle>
                                    <Badge variant="secondary" className="text-xs capitalize bg-blue-100 text-blue-700 font-medium">
                                      {place.type.replace(/_/g, ' ')}
                                    </Badge>
                                  </div>
                                </div>
                              </CardHeader>
                              
                              <CardContent className="p-6 pt-0 space-y-4">
                                {/* Distance Info */}
                                {place.distance_walking_time !== null && typeof place.distance_walking_time === 'number' ? (
                                  <div className="flex items-center gap-2 bg-green-50 rounded-lg p-3">
                                    <Footprints className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-700">
                                      {place.distance_walking_time} min walk
                                    </span>
                                  </div>
                                ) : place.distance_meters ? (
                                  <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-3">
                                    <MapPin className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-700">
                                      {place.distance_meters}m away
                                    </span>
                                  </div>
                                ) : null}
                                
                                {/* Rating */}
                                {typeof place.rating === 'number' && (
                                  <div className="bg-yellow-50 rounded-lg p-3">
                                    <StarRating 
                                      rating={place.rating} 
                                      totalRatings={place.user_ratings_total} 
                                      starSize="h-4 w-4" 
                                      showTextRating 
                                    />
                                  </div>
                                )}
                                
                                {/* Address */}
                                {place.address_vicinity && (
                                  <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                                    <MapPin className="h-4 w-4 inline mr-2 text-gray-500" />
                                    <span className="line-clamp-2">{place.address_vicinity}</span>
                                  </div>
                                )}
                              </CardContent>
                              
                              {place.locationLink && (
                                <CardFooter className="p-6 pt-0">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 shadow-sm" 
                                    asChild
                                  >
                                    <Link
                                      href={place.locationLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Map className="mr-2 h-4 w-4" />
                                      View on Map
                                      <ExternalLink className="ml-2 h-4 w-4" />
                                    </Link>
                                  </Button>
                                </CardFooter>
                              )}
                            </Card>
                          ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-2xl">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-600 mb-2">No {categoryGroup.categoryDisplayName.toLowerCase()} found</p>
                        <p className="text-sm text-gray-500">We couldn't find any {categoryGroup.categoryDisplayName.toLowerCase()} in this area.</p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        )}

        <Card className="overflow-hidden shadow-xl">
          <CardHeader className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {space.logoUrl && !space.logoUrl.includes('placehold.co') && (
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden border flex-shrink-0 mt-1 shadow-sm bg-card p-1">
                  <Image
                    src={space.logoUrl}
                    alt={`${space.name || 'Coliving'} logo`}
                    fill
                    style={{objectFit: 'contain'}}
                    data-ai-hint="company logo"
                  />
                </div>
              )}
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold text-primary">{space.name}</CardTitle>
                {space.brand && (
                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                    <Briefcase className="h-4 w-4 mr-2" /> {space.brand}
                  </p>
                )}
                <CardDescription className="flex items-start text-md text-muted-foreground mt-1.5">
                  <MapPin className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{displayAddress}</span>
                </CardDescription>
                {space.websiteUrl && (
                  <Button variant="link" asChild className="p-0 h-auto mt-2 text-sm">
                    <Link href={space.websiteUrl} target="_blank" rel="noopener noreferrer">
                      <Globe className="mr-2 h-4 w-4" />
                      Visit Website
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                )}
                {(space.email || space.phone) && (
                  <div className="mt-2 space-y-1">
                    {space.email && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 mr-2 text-primary" />
                        <a href={`mailto:${space.email}`} className="hover:underline">{space.email}</a>
                      </div>
                    )}
                    {space.phone && (
                       <div className="flex items-center text-sm text-muted-foreground">
                         <Phone className="h-4 w-4 mr-2 text-primary" />
                        <span>{space.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {space.status && (
                <Badge variant="outline" className="text-xs whitespace-nowrap self-start sm:ml-auto mt-2 sm:mt-0">
                  {space.status.charAt(0).toUpperCase() + space.status.slice(1)}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6 pt-0 space-y-6">
            {/* Key Information & Details */}
            <div className="space-y-8">
              {/* Key Information Section */}
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Info className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">Key Information</h2>
                    <p className="text-gray-600 mt-1">Essential details about this coliving space.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {space.monthlyPrice > 0 && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-gray-800">Monthly Price</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">${space.monthlyPrice}</p>
                      <p className="text-sm text-gray-600">{space.currency || ''} per month</p>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                        <Building className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-gray-800">Property Type</span>
                    </div>
                    <p className="text-lg font-medium text-blue-600">Coliving Space</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-gray-800">Coworking</span>
                    </div>
                    <p className="text-lg font-medium text-orange-600">
                      {space.hasCoworking ? (typeof space.coworking_access === 'string' && !['yes', 'available', '24/7', 'true', ''].some(term => space.coworking_access!.toLowerCase().includes(term)) ? space.coworking_access : 'Available') : 'Not Available'}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center">
                        <Home className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-gray-800">Private Bathroom</span>
                    </div>
                    <p className="text-lg font-medium text-purple-600">
                      {space.hasPrivateBathroom ? 'Available' : 'Shared'}
                    </p>
                  </div>
                  
                  {space.rating && (
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center">
                          <Star className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-gray-800">Rating</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-yellow-600">{space.rating}</p>
                        <StarRating rating={space.rating} starSize="h-5 w-5" />
                      </div>
                      <p className="text-sm text-gray-600">({space.reviews_count || 0} reviews)</p>
                    </div>
                  )}
                  
                  {space.capacity && (
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                          <Users2 className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-gray-800">Capacity</span>
                      </div>
                      <p className="text-2xl font-bold text-teal-600">{space.capacity}</p>
                      <p className="text-sm text-gray-600">people</p>
                    </div>
                  )}
                </div>
                
                {/* Additional Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                  {space.vibe && (
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                      <Smile className="h-5 w-5 text-pink-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-600">Vibe</span>
                        <p className="font-semibold text-gray-800">{space.vibe}</p>
                      </div>
                    </div>
                  )}
                  
                  {space.wifi_speed && (
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                      <Wifi className="h-5 w-5 text-blue-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-600">WiFi Speed</span>
                        <p className="font-semibold text-gray-800">{space.wifi_speed}</p>
                      </div>
                    </div>
                  )}
                  
                  {space.minimum_stay && (
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-600">Min. Stay</span>
                        <p className="font-semibold text-gray-800">{space.minimum_stay}</p>
                      </div>
                    </div>
                  )}
                  
                  {space.check_in && (
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                      <CalendarClock className="h-5 w-5 text-purple-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-600">Check-in</span>
                        <p className="font-semibold text-gray-800">{space.check_in}</p>
                      </div>
                    </div>
                  )}
                  
                  {space.languages && space.languages.length > 0 && (
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                      <LanguagesIcon className="h-5 w-5 text-green-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-600">Languages</span>
                        <p className="font-semibold text-gray-800">{space.languages.join(', ')}</p>
                      </div>
                    </div>
                  )}
                  
                  {space.age_range && (
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                      <Users className="h-5 w-5 text-indigo-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-600">Age Range</span>
                        <p className="font-semibold text-gray-800">{space.age_range}</p>
                      </div>
                    </div>
                  )}
                  
                  {space.region && (
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                      <LocateFixed className="h-5 w-5 text-red-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-600">Region</span>
                        <p className="font-semibold text-gray-800">{space.region}</p>
                      </div>
                    </div>
                  )}
                  
                  {space.climate && (
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                      <Thermometer className="h-5 w-5 text-orange-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-600">Climate</span>
                        <p className="font-semibold text-gray-800">{space.climate}</p>
                      </div>
                    </div>
                  )}
                  
                  {space.timezone && (
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                      <Globe2 className="h-5 w-5 text-blue-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-600">Timezone</span>
                        <p className="font-semibold text-gray-800">{space.timezone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {space.amenities && space.amenities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Amenities:</h3>
                <div className="flex flex-wrap gap-2">
                  {space.amenities.map((amenity) => (
                    <Badge key={amenity} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
                <Separator className="my-6" />
              </div>
            )}

            {space.room_types && space.room_types.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 mt-4 text-foreground">Room Types:</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {space.room_types.map((room, index) => (
                     <Card key={index} className="p-3 bg-muted/30">
                      <p className="font-medium text-sm">{room.type || 'N/A'}</p>
                      {room.price && room.currency && <p className="text-xs text-muted-foreground">{room.price} {room.currency}</p>}
                    </Card>
                  ))}
                </div>
                <Separator className="my-6" />
              </div>
            )}

            {(hasValidCoordinates || space.transportation) && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Location & Transportation:</h3>
                {hasValidCoordinates && space.coordinates?.latitude && space.coordinates?.longitude && (
                  <div className="mb-4">
                    <iframe
                      width="100%"
                      height="300"
                      loading="lazy"
                      allowFullScreen
                      className="rounded-md border shadow-sm"
                      src={`https://maps.google.com/maps?q=${space.coordinates.latitude},${space.coordinates.longitude}&z=15&output=embed&hl=en`}
                      title={`Map of ${space.name}`}
                    ></iframe>
                     <Link href={`https://www.google.com/maps?q=${space.coordinates.latitude},${space.coordinates.longitude}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center text-sm text-primary hover:underline">
                      <Map className="h-4 w-4 mr-2" />
                      View on Google Maps ({space.coordinates.latitude.toFixed(4)}, {space.coordinates.longitude.toFixed(4)})
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                )}
                {!hasValidCoordinates && space.transportation && (
                   <div className="flex items-center text-sm text-muted-foreground p-3 bg-muted/30 rounded-md mb-4">
                      <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                      Map data is currently unavailable for this location.
                    </div>
                )}
                {(space.transportation?.airport_distance || space.transportation?.public_transport || typeof space.transportation?.bike_rental === 'boolean') && (
                  <div className="space-y-2 text-sm">
                    {space.transportation?.airport_distance && (
                      <div className="flex items-center">
                        <Plane className="h-4 w-4 mr-2 text-primary" />
                        <span>Airport Distance: {space.transportation.airport_distance}</span>
                      </div>
                    )}
                    {space.transportation?.public_transport && (
                      <div className="flex items-center">
                        <Bus className="h-4 w-4 mr-2 text-primary" />
                        <span>Public Transport: {space.transportation.public_transport}</span>
                      </div>
                    )}
                    {typeof space.transportation?.bike_rental === 'boolean' && (
                      <div className="flex items-center">
                        <Bike className="h-4 w-4 mr-2 text-primary" />
                        <span>Bike Rental: {space.transportation.bike_rental ? 'Available' : 'Not Available'}</span>
                      </div>
                    )}
                  </div>
                )}
                <Separator className="my-6" />
              </div>
            )}

            {space.nearby_attractions && space.nearby_attractions.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-3 text-foreground">Nearby Attractions (Manual):</h3>
                <div className="flex flex-wrap gap-2">
                  {space.nearby_attractions.map((attraction) => (
                    <Badge key={attraction} variant="secondary" className="text-xs">
                       <Mountain className="mr-1 h-3 w-3"/> {attraction}
                    </Badge>
                  ))}
                </div>
                <Separator className="my-6" />
              </div>
            )}

            {/* Google Reviews Section */}
            {reviewData && (
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">Google Reviews</h2>
                    <p className="text-gray-600 mt-1">What guests are saying about this place.</p>
                  </div>
                </div>
                
                {(reviewData.google_rating && reviewData.google_total_ratings) ? (
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-8 border border-yellow-200 mb-8">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-yellow-600 mb-2">{reviewData.google_rating.toFixed(1)}</div>
                        <StarRating rating={reviewData.google_rating} starSize="h-8 w-8" />
                        <p className="text-lg font-semibold text-gray-700 mt-2">Google Rating</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-700 mb-2">{reviewData.google_total_ratings}</div>
                        <p className="text-lg font-semibold text-gray-600">Total Reviews</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 mb-8 text-center">
                    <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Rating Available</h3>
                    <p className="text-gray-500">Overall Google rating not available for this location.</p>
                  </div>
                )}

                {reviewData.reviews && reviewData.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviewData.reviews.map((review: ReviewItem) => (
                      <div key={review.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-14 w-14 border-2 border-gray-200 shadow-md">
                            <AvatarImage src={review.profile_photo_url} alt={review.author_name} data-ai-hint="profile picture user" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold">
                              {review.author_name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                              <div>
                                <h4 className="font-bold text-lg text-gray-800">{review.author_name}</h4>
                                <p className="text-sm text-gray-500">{review.relative_time_description}</p>
                              </div>
                              <div className="bg-yellow-50 rounded-lg px-3 py-2 border border-yellow-200">
                                <StarRating rating={review.rating} starSize="h-4 w-4" showTextRating />
                              </div>
                            </div>
                            
                            {review.text && (
                              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                <p className="text-gray-700 leading-relaxed">{review.text}</p>
                              </div>
                            )}
                            
                            {review.author_url && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-blue-300 text-blue-600 hover:bg-blue-50" 
                                asChild
                              >
                                <Link href={review.author_url} target="_blank" rel="noopener noreferrer">
                                  View Full Review
                                  <ExternalLink className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Reviews Yet</h3>
                    <p className="text-gray-500">No individual Google reviews available for this location yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tags Section */}
            {space.tags && space.tags.length > 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">Tags</h2>
                    <p className="text-gray-600 mt-1">Keywords that describe this space.</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {space.tags.map((tag, index) => (
                    <div key={tag} className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl px-6 py-3 border border-pink-200 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">#{index + 1}</span>
                        </div>
                        <span className="font-medium text-gray-800">{tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    
