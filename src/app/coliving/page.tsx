
'use client';

import { useState, useMemo } from 'react';
import { ColivingCard } from '@/components/ColivingCard';
import { mockColivingSpaces } from '@/lib/mock-data';
import type { ColivingSpace } from '@/types';
import { Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button'; // Added Button import
import { ColivingFilters, type FiltersState } from '@/components/ColivingFilters';

const ALL_VIBE_TAGS_FOR_FILTER: string[] = [
  "community", "wellness", "tech", "adventure", "quiet", "social", 
  "luxury", "eco-friendly", "surfing", "yoga", "city life", "mountains", 
  "urban", "creative", "outdoors", "focused", "networking", "history", "art", "music"
].sort();


export default function ColivingDirectoryPage({
  searchParams,
}: {
  searchParams?: { country?: string };
}) {
  const allSpaces: ColivingSpace[] = mockColivingSpaces;
  const selectedCountry = searchParams?.country;

  const [filters, setFilters] = useState<FiltersState>({
    minBudget: '', // Initialized for new budget range
    maxBudget: '', // Initialized for new budget range
    hasPrivateBathroom: false,
    hasCoworking: false,
    selectedVibes: [],
  });

  const handleFilterChange = (newFilters: Partial<FiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  const availableVibeTags = useMemo(() => {
    const tagsFromSpaces = new Set<string>();
    allSpaces.forEach(space => {
      space.tags?.forEach(tag => tagsFromSpaces.add(tag.toLowerCase()));
    });
    // Ensure only tags present in mock data AND in our predefined list are shown, and sort them
    return ALL_VIBE_TAGS_FOR_FILTER.filter(vibe => tagsFromSpaces.has(vibe.toLowerCase())).sort();
  }, [allSpaces]);

  const filteredSpaces = useMemo(() => {
    return allSpaces
      .filter(space => {
        // Country filter
        if (selectedCountry) {
          const addressParts = space.address.split(', ');
          const countryName = addressParts[addressParts.length - 1];
          if (countryName.toLowerCase() !== decodeURIComponent(selectedCountry).toLowerCase()) {
            return false;
          }
        }
        
        // Budget range filter
        const minBudgetNum = parseFloat(filters.minBudget);
        const maxBudgetNum = parseFloat(filters.maxBudget);

        if (!isNaN(minBudgetNum) && space.monthlyPrice < minBudgetNum) {
          return false;
        }
        if (!isNaN(maxBudgetNum) && space.monthlyPrice > maxBudgetNum) {
          return false;
        }

        // Private bathroom filter
        if (filters.hasPrivateBathroom && !space.hasPrivateBathroom) {
          return false;
        }
        // Coworking filter
        if (filters.hasCoworking && !space.hasCoworking) {
          return false;
        }
        // Vibe filter
        if (filters.selectedVibes.length > 0) {
          if (!space.tags || !filters.selectedVibes.some(vibe => space.tags!.map(t => t.toLowerCase()).includes(vibe.toLowerCase()))) {
            return false;
          }
        }
        return true;
      });
  }, [allSpaces, selectedCountry, filters]);

  const pageTitle = selectedCountry 
    ? `Coliving Spaces in ${decodeURIComponent(selectedCountry)}` 
    : 'Coliving Directory';
  
  const pageDescription = selectedCountry
    ? `Discover and filter amazing places to stay and connect in ${decodeURIComponent(selectedCountry)}.`
    : 'Explore and filter unique coliving spaces around the globe.';

  const resetAllFilters = () => {
    handleFilterChange({ 
        minBudget: '', 
        maxBudget: '', 
        hasPrivateBathroom: false, 
        hasCoworking: false, 
        selectedVibes: [] 
    });
    // If there's a country in URL, we don't remove it with this button
    // To clear country, user needs to click the "all countries" link
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">{pageTitle}</h1>
        <p className="text-lg text-muted-foreground mt-2">
          {pageDescription}
        </p>
      </div>
      
      <ColivingFilters 
        filters={filters} 
        onFilterChange={handleFilterChange}
        availableVibeTags={availableVibeTags}
      />

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
            Sorry, we couldn't find any coliving spaces matching your current filter criteria.
            <br />
            Try adjusting your filters or <Button variant="link" className="p-0 h-auto" onClick={resetAllFilters}>reset all filters</Button>.
            {selectedCountry && (
              <>
                {' '}Alternatively, explore all <a href="/coliving" className="underline hover:text-primary">available spaces in all countries</a>.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
