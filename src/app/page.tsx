import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { List, Lightbulb, Users, MapPin, Video } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-10 bg-gradient-to-r from-primary/10 via-background to-accent/10 rounded-xl shadow-sm">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary">
          Welcome to Nomad Coliving Hub
        </h1>
        <p className="mt-4 text-xl text-foreground/80 max-w-2xl mx-auto">
          Discover your next home away from home. Explore coliving spaces, watch community videos, and connect with fellow digital nomads.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Button size="lg" asChild>
            <Link href="/coliving">
              <List className="mr-2 h-5 w-5" /> Explore Directory
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/recommender">
              <Lightbulb className="mr-2 h-5 w-5" /> AI Recommender
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <MapPin className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Extensive Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Browse a curated list of coliving spaces worldwide. Find addresses, amenities, and essential details.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Video className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Video Showcases</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get a real feel for coliving life with videos from residents and community managers.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Users className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Community Links</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Connect with local nomad communities through Slack, WhatsApp, and other group links.
            </CardDescription>
          </CardContent>
        </Card>
      </section>

      <section className="text-center">
        <Image 
          src="https://placehold.co/800x400.png" 
          alt="Nomads working and collaborating" 
          width={800} 
          height={400}
          className="rounded-lg mx-auto shadow-md"
          data-ai-hint="nomads collaboration" 
        />
        <h2 className="text-3xl font-semibold mt-6">Join the Movement</h2>
        <p className="mt-2 text-lg text-foreground/70 max-w-xl mx-auto">
          Nomad Coliving Hub is more than a directory; it&apos;s your gateway to a global community.
        </p>
      </section>
    </div>
  );
}
