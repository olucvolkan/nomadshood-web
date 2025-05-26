
import type { ColivingSpace } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, MapPin, Video, MessageSquare, Users, Globe, DollarSign, Bath, Briefcase, Home, ExternalLink, CheckCircle, XCircle, Tag, Star, Users2 } from 'lucide-react';
import { getColivingSpaceById } from '@/services/colivingService'; 

export default async function ColivingDetailPage({ params }: { params: { id: string } }) {
  const space: ColivingSpace | null = await getColivingSpaceById(params.id);

  if (!space) {
    notFound();
  }

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
                src={space.logoUrl || 'https://placehold.co/600x400/E0E0E0/757575.png'} // Updated placeholder
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
                {space.address}
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
            <CardContent className="p-6 pt-0 space-y-4">
              <p className="text-foreground/90 leading-relaxed">{space.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-primary" />
                  <span>Monthly Price: ~${space.monthlyPrice} {space.budget_range?.currency || ''}</span>
                </div>
                <div className="flex items-center">
                  {space.hasPrivateBathroom ? <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> : <XCircle className="h-4 w-4 mr-2 text-red-600" />}
                  <span>Private Bathroom: {space.hasPrivateBathroom ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center">
                  {space.hasCoworking ? <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> : <XCircle className="h-4 w-4 mr-2 text-red-600" />}
                  <span>Coworking Space: {space.hasCoworking ? 'Yes' : 'No/Not specified'}</span>
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
              </div>

              {space.amenities && space.amenities.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold mb-2 text-foreground">Amenities:</h3>
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
                  <h3 className="text-md font-semibold mb-2 mt-3 text-foreground">Room Types:</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {space.room_types.map((room, index) => (
                      <Badge key={index} variant="secondary" className="text-xs justify-start p-2">
                        <Home className="mr-1.5 h-3 w-3"/> {room.type}: {room.price} {room.currency}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}


              {space.tags && space.tags.length > 0 && (
                <div className="mt-3">
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
        </CardFooter>
      </Card>
    </div>
  );
}
