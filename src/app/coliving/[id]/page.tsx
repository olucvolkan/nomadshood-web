
import type { ColivingSpace } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, MapPin, Video, MessageSquare, Users, Globe, DollarSign, Briefcase, Home, ExternalLink,
  CheckCircle, XCircle, Tag, Star, Users2, Wifi, Clock, LanguagesIcon, Mountain, Building2, Info,
  CalendarClock, Thermometer, Globe2, Smile, LocateFixed, Map, Plane, Bus, Bike, Phone, Mail
} from 'lucide-react';
import { getColivingSpaceById } from '@/services/colivingService';

export default async function ColivingDetailPage({ params }: { params: { id: string } }) {
  const space: ColivingSpace | null = await getColivingSpaceById(params.id);

  if (!space) {
    notFound();
  }

  const displayAddress = space.address || 'Location not specified';

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" asChild className="mb-8">
        <Link href="/coliving">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Directory
        </Link>
      </Button>

      <Card className="overflow-hidden shadow-xl">
        <div className="md:flex">
          <div className="md:w-1/3 p-2">
            <div className="relative w-full h-80 md:h-[500px] rounded-lg overflow-hidden shadow-md">
              <Image
                src={space.mainImageUrl || 'https://placehold.co/600x800/E0E0E0/757575.png'}
                alt={`${space.name || 'Coliving space'} main view`}
                fill
                style={{objectFit: 'cover'}}
                className="rounded-lg"
                data-ai-hint={space.dataAiHint || "building exterior"}
                priority
              />
            </div>
          </div>
          <div className="md:w-2/3 flex flex-col">
            <CardHeader className="p-6">
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 rounded-md overflow-hidden border flex-shrink-0 mt-1">
                  <Image
                    src={space.logoUrl || 'https://placehold.co/80x80/E0E0E0/757575.png'}
                    alt={`${space.name || 'Coliving'} logo`}
                    fill
                    style={{objectFit: 'contain'}}
                    data-ai-hint="company logo"
                  />
                </div>
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
                </div>
                {space.status && (
                  <Badge variant="outline" className="text-xs whitespace-nowrap ml-auto self-start">
                    {space.status.charAt(0).toUpperCase() + space.status.slice(1)}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-2 space-y-6 flex-grow">
              {space.description && (
                <>
                  <p className="text-foreground/90 leading-relaxed">{space.description}</p>
                  <Separator />
                </>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5 text-sm">
                {space.monthlyPrice > 0 && (
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-primary" />
                    <span>Approx. Price: ${space.monthlyPrice} {space.currency || ''}/month</span>
                  </div>
                )}
                <div className="flex items-center">
                  {space.hasCoworking ? <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> : <XCircle className="h-4 w-4 mr-2 text-red-600" />}
                  <span>Coworking: {space.hasCoworking ? (space.coworking_access && typeof space.coworking_access === 'string' && !['yes', 'available', '24/7'].some(term => space.coworking_access!.toLowerCase().includes(term)) ? space.coworking_access : 'Yes') : 'No/Not specified'}</span>
                </div>
                <div className="flex items-center">
                  {space.hasPrivateBathroom ? <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> : <XCircle className="h-4 w-4 mr-2 text-red-600" />}
                  <span>Private Bathroom: {space.hasPrivateBathroom ? 'Option' : 'No/Shared'}</span>
                </div>
                {space.rating && (
                  <div className="flex items-center">
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
                </div>
              )}

              {(space.coordinates?.latitude && space.coordinates?.longitude || space.transportation) && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-3 text-foreground">Location & Transportation:</h3>
                  <div className="space-y-2 text-sm">
                    {space.coordinates?.latitude && space.coordinates?.longitude && (
                       <Link href={`https://www.google.com/maps?q=${space.coordinates.latitude},${space.coordinates.longitude}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary">
                        <Map className="h-4 w-4 mr-2 text-primary" />
                        View on Google Maps ({space.coordinates.latitude.toFixed(4)}, {space.coordinates.longitude.toFixed(4)})
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    )}
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
                </div>
              )}
              
              {space.nearby_attractions && space.nearby_attractions.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-3 text-foreground">Nearby Attractions:</h3>
                  <div className="flex flex-wrap gap-2">
                    {space.nearby_attractions.map((attraction) => (
                      <Badge key={attraction} variant="secondary" className="text-xs">
                         <Mountain className="mr-1 h-3 w-3"/> {attraction}
                      </Badge>
                    ))}
                  </div>
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

            <CardFooter className="p-6 bg-muted/20 border-t mt-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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
              <div className="space-y-1 text-xs text-muted-foreground text-right">
                  {space.email && (
                    <div className="flex items-center justify-end">
                      <Mail className="h-3 w-3 mr-1.5" />
                      <a href={`mailto:${space.email}`} className="hover:underline">{space.email}</a>
                    </div>
                  )}
                  {space.phone && (
                     <div className="flex items-center justify-end">
                       <Phone className="h-3 w-3 mr-1.5" />
                      <span>{space.phone}</span>
                    </div>
                  )}
              </div>
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
}
