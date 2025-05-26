
import type { ColivingSpace } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Video, MessageSquare } from 'lucide-react';

interface ColivingCardProps {
  space: ColivingSpace;
  showViewDetailsButton?: boolean;
}

export function ColivingCard({ space, showViewDetailsButton = false }: ColivingCardProps) {
  // Defensively render the address based on its potential structure
  let displayAddress = 'Address not available';
  if (typeof space.address === 'string') {
    displayAddress = space.address;
  } else if (space.address && typeof (space.address as any).address === 'string') {
    // Handles if space.address is an object like: { address: "Street...", city: "...", ... }
    displayAddress = (space.address as any).address;
    if ((space.address as any).city) {
      displayAddress += `, ${(space.address as any).city}`;
    }
    if ((space.address as any).country) {
      displayAddress += `, ${(space.address as any).country}`;
    }
  } else if (space.address && typeof (space.address as any).city === 'string' && typeof (space.address as any).country === 'string') {
    // Fallback if space.address is an object but only has city/country
     displayAddress = `${(space.address as any).city}, ${(space.address as any).country}`;
  } else if (space.location && typeof space.location === 'string') {
    // Fallback to space.location if space.address is problematic but space.location (raw field) exists
    displayAddress = space.location;
  }


  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        <Image
          src={space.logoUrl} // This should come from space.cover_image in Firestore via mapping
          alt={`${space.name} logo`}
          width={80}
          height={80}
          className="rounded-lg border"
          data-ai-hint={space.dataAiHint || 'logo building'}
        />
        <div className="flex-1">
          <Link href={`/coliving/${space.id}`} className="group">
            <CardTitle className="text-xl mb-1 group-hover:text-primary transition-colors">
              {space.name}
            </CardTitle>
          </Link>
          <CardDescription className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-1.5 text-muted-foreground" />
            {displayAddress}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-foreground/80 mb-3 line-clamp-3">{space.description}</p>
        {space.tags && space.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {space.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row sm:justify-between gap-2 items-stretch">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 w-full">
          {space.videoUrl && (
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link href={space.videoUrl} target="_blank" rel="noopener noreferrer">
                <Video className="h-4 w-4 mr-2" />
                Watch Video
              </Link>
            </Button>
          )}
          {space.whatsappLink && ( 
             <Button variant="outline" size="sm" asChild className="flex-1">
              <Link href={space.whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="h-4 w-4 mr-2" />
                Join Community
              </Link>
            </Button>
          )}
           {showViewDetailsButton && (
            <Button size="sm" asChild className="flex-1">
              <Link href={`/coliving/${space.id}`}>View Details</Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
