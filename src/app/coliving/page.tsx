
import { ColivingCard } from '@/components/ColivingCard';
import { mockColivingSpaces } from '@/lib/mock-data';
import type { ColivingSpace } from '@/types';
import { ListFilter, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ColivingDirectoryPage({
  searchParams,
}: {
  searchParams?: { country?: string };
}) {
  const allSpaces: ColivingSpace[] = mockColivingSpaces;
  const selectedCountry = searchParams?.country;

  const filteredSpaces = selectedCountry
    ? allSpaces.filter(space => {
        const addressParts = space.address.split(', ');
        const countryName = addressParts[addressParts.length - 1];
        // Ensure case-insensitive comparison and decode URI component for safety
        return countryName.toLowerCase() === decodeURIComponent(selectedCountry).toLowerCase();
      })
    : allSpaces;

  const pageTitle = selectedCountry 
    ? `Coliving Spaces in ${decodeURIComponent(selectedCountry)}` 
    : 'Coliving Directory';
  
  const pageDescription = selectedCountry
    ? `Discover amazing places to stay and connect in ${decodeURIComponent(selectedCountry)}.`
    : 'Explore unique coliving spaces around the globe.';

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">{pageTitle}</h1>
        <p className="text-lg text-muted-foreground mt-2">
          {pageDescription}
        </p>
      </div>
      
      {/* Placeholder for advanced filters - future enhancement */}
      {/* 
      <div className="flex justify-end">
        <Button variant="outline">
          <ListFilter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div> 
      */}

      {filteredSpaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpaces.map((space) => (
            <ColivingCard key={space.id} space={space} />
          ))}
        </div>
      ) : (
        <Alert className="max-w-lg mx-auto">
          <Info className="h-4 w-4" />
          <AlertTitle>No Spaces Found</AlertTitle>
          <AlertDescription>
            {selectedCountry 
              ? `Sorry, we couldn't find any coliving spaces in ${decodeURIComponent(selectedCountry)} at the moment.`
              : 'No coliving spaces found at the moment.'}
            <br />
            Please check back later or try exploring all <a href="/coliving" className="underline hover:text-primary">available spaces</a>.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
