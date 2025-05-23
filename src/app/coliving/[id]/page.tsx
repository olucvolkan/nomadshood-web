
// import { mockColivingSpaces } from '@/lib/mock-data'; // Firebase data will be used
import type { ColivingSpace } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, MapPin, Video, MessageSquare, Users, Globe, DollarSign, Bath, Briefcase } from 'lucide-react';
import { getColivingSpaceById } from '@/services/colivingService'; // Import Firebase service

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
                src={space.logoUrl || 'https://placehold.co/600x400.png'}
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
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <p className="text-foreground/90 leading-relaxed">{space.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-primary" />
                  <span>Monthly Price: ~${space.monthlyPrice}</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-2 text-primary" />
                  <span>Private Bathroom: {space.hasPrivateBathroom ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-primary" />
                  <span>Coworking Space: {space.hasCoworking ? 'Yes' : 'No/Not specified'}</span>
                </div>
              </div>

              {space.tags && space.tags.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold mb-2 text-foreground">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {space.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-sm">
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
                {space.slackLink && (
                    <Button variant="outline" asChild>
                    <Link href={space.slackLink} target="_blank" rel="noopener noreferrer">
                        <Users className="mr-2 h-4 w-4" />
                        Join Slack Community
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
