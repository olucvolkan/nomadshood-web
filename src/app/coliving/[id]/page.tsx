
import type { ColivingSpace } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, MapPin, Video, MessageSquare, Users, Globe, DollarSign, Bath, Briefcase, Home, ExternalLink, CheckCircle, XCircle, Tag, Star, Users2, Wifi, Clock, LanguagesIcon, Mountain } from 'lucide-react';
import { getColivingSpaceById } from '@/services/colivingService'; 

export default async function ColivingDetailPage({ params }: { params: { id: string } }) {
  const space: ColivingSpace | null = await getColivingSpaceById(params.id);

  if (!space) {
    notFound();
  }

  // The space.address should now be a pre-formatted string from the service
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
            <div className="relative w-full h-64 md:h-full rounded-lg overflow-hidden">
              <Image
                src={space.mainImageUrl || 'https://placehold.co/600x400/E0E0E0/757575.png'}
                alt={`${space.name} view`}
                fill
                style={{objectFit: 'cover'}}
                className="rounded-lg"
                data-ai-hint={space.dataAiHint || "building exterior"}
              />
            </div>
          </div>
          <div className="md:w-2/3">
            <CardHeader className="p-6">
              <CardTitle className="text-3xl font-bold text-primary">{space.name}</CardTitle>
              <CardDescription className="flex items-center text-lg text-muted-foreground mt-1">
                <MapPin className="h-5 w-5 mr-2" />
                {displayAddress}
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
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-6">
              <p className="text-foreground/90 leading-relaxed">{space.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {space.monthlyPrice > 0 && (
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-primary" />
                    <span>Approx. Monthly Price: ${space.monthlyPrice} {space.budget_range?.currency || ''}</span>
                  </div>
                )}
                <div className="flex items-center">
                  {space.hasCoworking ? <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> : <XCircle className="h-4 w-4 mr-2 text-red-600" />}
                  <span>Coworking Space: {space.hasCoworking ? (space.coworking_access && typeof space.coworking_access === 'string' && !['yes', 'available', '24/7'].some(term => space.coworking_access!.toLowerCase().includes(term)) ? space.coworking_access : 'Yes') : 'No/Not specified'}</span>
                </div>
                 <div className="flex items-center">
                  {space.hasPrivateBathroom ? <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> : <XCircle className="h-4 w-4 mr-2 text-red-600" />}
                  <span>Private Bathroom: {space.hasPrivateBathroom ? 'Available option' : 'No/Shared'}</span>
                </div>
                {space.rating && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-2 text-yellow-500" />
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
                    <Tag className="h-4 w-4 mr-2 text-primary" />
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
                {space.languages && space.languages.length > 0 && (
                   <div className="flex items-center">
                    <LanguagesIcon className="h-4 w-4 mr-2 text-primary" />
                    <span>Languages: {space.languages.join(', ')}</span>
                  </div>
                )}
              </div>

              {space.amenities && space.amenities.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold mb-2 text-foreground mt-4">Amenities:</h3>
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
                  <h3 className="text-md font-semibold mb-2 mt-4 text-foreground">Room Types:</h3>
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
               {space.nearby_attractions && space.nearby_attractions.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold mb-2 mt-4 text-foreground">Nearby Attractions:</h3>
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
                  <h3 className="text-md font-semibold mb-2 text-foreground">Tags:</h3>
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
          </div>
        </div>
        <CardFooter className="p-6 bg-muted/30 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-3">
                {space.videoUrl && (
                    <Button variant="default" asChild>
                    <Link href={space.videoUrl} target="_blank" rel="noopener noreferrer">
                        <Video className="mr-2 h-4 w-4" />
                        Watch Video Showcase
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
             {space.contact?.email && (
                <p className="text-xs text-muted-foreground">
                  Email: <a href={`mailto:${space.contact.email}`} className="hover:underline">{space.contact.email}</a>
                </p>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
