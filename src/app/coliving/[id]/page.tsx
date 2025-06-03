
import type { ColivingSpace, ColivingReviewData, ReviewItem, CategorizedNearbyPlaceGroup } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, MapPin, Video, MessageSquare, Users, Globe, DollarSign, Briefcase, Home, ExternalLink,
  Star, Users2, Wifi, Clock, LanguagesIcon, Mountain, Building2, Info,
  CalendarClock, Thermometer, Globe2, Smile, LocateFixed, Map, Plane, Bus, Bike, Phone, Mail, AlertCircle, MessageCircle,
  Landmark, Utensils, Coffee, ShoppingCart, Train, Trees, Dumbbell, Ticket, Banknote, Hospital, Building,
  WavesIcon, Search, Beer, Store, MountainSnow, Sailboat, Clock4, Footprints, ChefHat
} from 'lucide-react';
import { getColivingSpaceById, getColivingReviewsByColivingId, getNearbyPlaces } from '@/services/colivingService';

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
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" asChild className="mb-8 print:hidden">
        <Link href="/coliving">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Colivings
        </Link>
      </Button>

      {categorizedNearbyPlaces.length > 0 && (
        <Card className="mb-8 shadow-xl border-primary/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-primary flex items-center">
              <Map className="mr-3 h-6 w-6" />
              What&apos;s Around {space.name}?
            </CardTitle>
            <CardDescription>Discover points of interest near this coliving space. Distances are approximate.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={categorizedNearbyPlaces[0]?.categoryKey} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 mb-6 h-auto flex-wrap">
                {categorizedNearbyPlaces.map((categoryGroup) => (
                  <TabsTrigger
                    key={categoryGroup.categoryKey}
                    value={categoryGroup.categoryKey}
                    className="text-xs sm:text-sm px-2 py-1.5 h-full flex items-center justify-center leading-tight"
                  >
                    <NearbyPlaceIcon type={categoryGroup.categoryKey} className="h-4 w-4 mr-1.5 hidden xs:inline-block flex-shrink-0" />
                    <span className="truncate">{categoryGroup.categoryDisplayName}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              {categorizedNearbyPlaces.map((categoryGroup) => (
                <TabsContent key={categoryGroup.categoryKey} value={categoryGroup.categoryKey} className="mt-0">
                  {categoryGroup.places.length > 0 ? (
                    <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-muted/20">
                      <div className="flex w-max space-x-4 p-4">
                        {categoryGroup.places.map((place) => (
                          <Card key={place.id} className="w-[260px] sm:w-[280px] flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="p-3 pb-2">
                              <CardTitle className="text-sm mb-0.5 flex items-start">
                                <NearbyPlaceIcon type={place.type} className="h-3.5 w-3.5 text-muted-foreground mr-1.5 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2 font-medium">{place.name}</span>
                              </CardTitle>
                               <Badge variant="outline" className="text-xs capitalize py-0.5 px-1.5 h-auto w-fit">{place.type.replace(/_/g, ' ')}</Badge>
                            </CardHeader>
                            <CardContent className="p-3 pt-0 text-xs space-y-1.5">
                              {place.distance_walking_time !== null && typeof place.distance_walking_time === 'number' ? (
                                  <p className="text-muted-foreground flex items-center">
                                    <Footprints className="h-3.5 w-3.5 mr-1.5 text-primary/80" /> {place.distance_walking_time} min walk
                                  </p>
                                ) : place.distance_meters ? (
                                  <p className="text-muted-foreground flex items-center">
                                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary/80" /> {place.distance_meters}m
                                  </p>
                                ) : null
                              }
                              {typeof place.rating === 'number' && (
                                <div className="pt-0.5">
                                  <StarRating rating={place.rating} totalRatings={place.user_ratings_total} starSize="h-3.5 w-3.5" showTextRating />
                                </div>
                              )}
                              {place.address_vicinity && <p className="text-muted-foreground line-clamp-1"><span className="sr-only">Address: </span>{place.address_vicinity}</p>}
                            </CardContent>
                            {place.locationLink && (
                              <CardFooter className="p-3 pt-1 border-t">
                                <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs w-full justify-start">
                                  <Link
                                    href={place.locationLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View on Map <ExternalLink className="ml-1 h-3 w-3" />
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
                    <p className="text-sm text-muted-foreground py-4 text-center">No {categoryGroup.categoryDisplayName.toLowerCase()} found nearby for this category.</p>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
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

          <h3 className="text-xl font-semibold text-foreground flex items-center">
            <Info className="mr-2 h-5 w-5 text-primary" />
            Key Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            {space.monthlyPrice > 0 && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-primary" />
                <span>Approx. Price: ${space.monthlyPrice} {space.currency || ''}/month</span>
              </div>
            )}
             <div className="flex items-center">
              <Building className="h-4 w-4 mr-2 text-primary" />
              <span>Type: Coliving Space</span>
            </div>
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-primary" />
              <span>Coworking: {space.hasCoworking ? (typeof space.coworking_access === 'string' && !['yes', 'available', '24/7', 'true', ''].some(term => space.coworking_access!.toLowerCase().includes(term)) ? space.coworking_access : 'Available') : 'Not Available'}</span>
            </div>
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-2 text-primary" />
              <span>Private Bathroom: {space.hasPrivateBathroom ? 'Option Available' : 'No / Shared'}</span>
            </div>
            {space.rating && (
              <div className="flex items-center" title="NomadsHood Rating">
                <Star className="h-4 w-4 mr-2 text-yellow-500 fill-current" />
                <span>Rating: {space.rating}/5 ({space.reviews_count || 0} reviews)</span>
              </div>
            )}
            {space.capacity && (
              <div className="flex items-center">
                <Users2 className="h-4 w-4 mr-2 text-primary" />
                <span>Capacity: {space.capacity} people</span>
              </div>
            )}
            {space.vibe && (
              <div className="flex items-center">
                <Smile className="h-4 w-4 mr-2 text-primary" />
                <span>Vibe: {space.vibe}</span>
              </div>
            )}
            {space.wifi_speed && (
              <div className="flex items-center">
                <Wifi className="h-4 w-4 mr-2 text-primary" />
                <span>WiFi: {space.wifi_speed}</span>
              </div>
            )}
            {space.minimum_stay && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-primary" />
                <span>Min. Stay: {space.minimum_stay}</span>
              </div>
            )}
            {space.check_in && (
              <div className="flex items-center">
                <CalendarClock className="h-4 w-4 mr-2 text-primary" />
                <span>Check-in: {space.check_in}</span>
              </div>
            )}
            {space.languages && space.languages.length > 0 && (
               <div className="flex items-center">
                <LanguagesIcon className="h-4 w-4 mr-2 text-primary" />
                <span>Languages: {space.languages.join(', ')}</span>
              </div>
            )}
            {space.age_range && (
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-primary" />
                <span>Age Range: {space.age_range}</span>
              </div>
            )}
            {space.region && (
              <div className="flex items-center">
                <LocateFixed className="h-4 w-4 mr-2 text-primary" />
                <span>Region: {space.region}</span>
              </div>
            )}
             {space.climate && (
              <div className="flex items-center">
                <Thermometer className="h-4 w-4 mr-2 text-primary" />
                <span>Climate: {space.climate}</span>
              </div>
            )}
            {space.timezone && (
              <div className="flex items-center">
                <Globe2 className="h-4 w-4 mr-2 text-primary" />
                <span>Timezone: {space.timezone}</span>
              </div>
            )}
          </div>
          <Separator />

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

          {reviewData && (
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <MessageCircle className="mr-2 h-5 w-5 text-primary" />
                Google Reviews
              </h3>
              {(reviewData.google_rating && reviewData.google_total_ratings) ? (
                <div className="mb-6 p-4 bg-muted/30 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center">
                        <StarRating rating={reviewData.google_rating} starSize="h-6 w-6" />
                        <span className="text-lg font-semibold ml-2">{reviewData.google_rating.toFixed(1)} / 5</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({reviewData.google_total_ratings} Google ratings)</span>
                </div>
              ) : (
                 <p className="text-muted-foreground mb-4">Overall Google rating not available.</p>
              )}

              {reviewData.reviews && reviewData.reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviewData.reviews.map((review: ReviewItem) => (
                    <Card key={review.id} className="shadow-sm">
                      <CardHeader className="flex flex-row items-start space-x-4 p-4">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border">
                          <AvatarImage src={review.profile_photo_url} alt={review.author_name} data-ai-hint="profile picture user" />
                          <AvatarFallback>{review.author_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                            <p className="font-semibold text-sm">{review.author_name}</p>
                            <StarRating rating={review.rating} starSize="h-3.5 w-3.5" />
                          </div>
                          <p className="text-xs text-muted-foreground">{review.relative_time_description}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {review.text && <p className="text-sm text-foreground/90 leading-relaxed line-clamp-5">{review.text}</p>}
                        {review.author_url && (
                           <Button variant="link" size="sm" asChild className="p-0 h-auto mt-2 text-xs">
                            <Link href={review.author_url} target="_blank" rel="noopener noreferrer">
                              View original review <ExternalLink className="ml-1 h-2.5 w-2.5" />
                            </Link>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No individual Google reviews available for this location yet.</p>
              )}
              <Separator className="my-6" />
            </div>
          )}


          {space.tags && space.tags.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-3 text-foreground">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {space.tags.map((tag) => (
                  <Badge key={tag} variant="default" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-6 bg-muted/20 border-t flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap gap-3">
              {space.videoUrl && (
                  <Button variant="default" asChild>
                  <Link href={space.videoUrl} target="_blank" rel="noopener noreferrer">
                      <Video className="mr-2 h-4 w-4" />
                      Watch Video
                  </Link>
                  </Button>
              )}
              {space.whatsappLink && (
                  <Button variant="outline" asChild>
                  <Link href={space.whatsappLink} target="_blank" rel="noopener noreferrer">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Connect on WhatsApp
                  </Link>
                  </Button>
              )}
          </div>
          {/* Contact info moved to CardHeader, so this div is now empty or can be removed if no other content is planned here */}
          <div className="space-y-1 text-xs text-muted-foreground sm:text-right w-full sm:w-auto">
             {/* Placeholder if other footer content might be added later, otherwise this div can be removed */}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

    
