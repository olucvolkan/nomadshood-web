import { mockColivingSpaces } from '@/lib/mock-data';
import type { ColivingSpace } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, MapPin, Video, MessageSquare, ExternalLink, Users, Globe } from 'lucide-react';

export default function ColivingDetailPage({ params }: { params: { id: string } }) {
  const space = mockColivingSpaces.find((s) => s.id === params.id);

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
                src={space.logoUrl} // Using logoUrl as main image for now
                alt={`${space.name} view`}
                layout="fill"
                objectFit="cover"
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
                 {/* Placeholder for a website link if we add it to types later */}
                {/* {space.websiteUrl && (
                    <Button variant="outline" asChild>
                    <Link href={space.websiteUrl} target="_blank" rel="noopener noreferrer">
                        <Globe className="mr-2 h-4 w-4" />
                        Visit Website
                    </Link>
                    </Button>
                )} */}
            </div>
        </CardFooter>
      </Card>

      {/* Future section for embedded video, if direct embed is preferred */}
      {/* {space.videoUrl && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Video Tour</h2>
          <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${extractYoutubeId(space.videoUrl)}`} // Example for YouTube
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )} */}
    </div>
  );
}

// Helper function if you want to embed YouTube videos directly
// function extractYoutubeId(url: string): string | null {
//   const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
//   const match = url.match(regExp);
//   return (match && match[7].length === 11) ? match[7] : null;
// }
