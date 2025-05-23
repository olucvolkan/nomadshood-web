
'use client';

import { useState, useMemo } from 'react';
import { ColivingCard } from '@/components/ColivingCard';
import { mockColivingSpaces } from '@/lib/mock-data';
import type { ColivingSpace } from '@/types';
import { Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { ColivingFilters, type FiltersState } from '@/components/ColivingFilters';

export default function ColivingDirectoryPage({
  searchParams,
}: {
  searchParams?: { country?: string };
}) {
  const allSpaces: ColivingSpace[] = mockColivingSpaces;
  const selectedCountry = searchParams?.country;

  const [filters, setFilters] = useState<FiltersState>({
    selectedCity: '',
  });

  const handleFilterChange = (newFilters: Partial<FiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  const filteredSpaces = useMemo(() => {
    return allSpaces
      .filter(space => {
        // Country filter
        if (selectedCountry) {
          const addressParts = space.address.split(', ');
          const countryNameInSpace = addressParts[addressParts.length - 1];
          if (countryNameInSpace.toLowerCase() !== decodeURIComponent(selectedCountry).toLowerCase()) {
            return false;
          }
        }
        
        // City filter
        if (filters.selectedCity) {
          const addressParts = space.address.split(', ');
          const cityNameInSpace = addressParts[0]; // Assuming city is the first part of the address
          if (!cityNameInSpace.toLowerCase().includes(filters.selectedCity.toLowerCase().trim())) {
            return false;
          }
        }
        
        return true;
      });
  }, [allSpaces, selectedCountry, filters]);

  const pageTitle = selectedCountry 
    ? `${decodeURIComponent(selectedCountry)} şehrindeki Coliving Alanları` 
    : 'Coliving Rehberi';
  
  const pageDescription = selectedCountry
    ? `${decodeURIComponent(selectedCountry)} şehrindeki harika yerleri keşfedin ve filtreleyin.`
    : 'Dünyanın dört bir yanındaki benzersiz coliving alanlarını keşfedin ve filtreleyin.';

  const resetAllFilters = () => {
    handleFilterChange({ 
        selectedCity: ''
    });
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
          <AlertTitle>Alan Bulunamadı</AlertTitle>
          <AlertDescription>
            Üzgünüz, mevcut filtre kriterlerinize uyan herhangi bir coliving alanı bulamadık.
            <br />
            Filtrelerinizi ayarlamayı veya <Button variant="link" className="p-0 h-auto" onClick={resetAllFilters}>tüm filtreleri sıfırlamayı</Button> deneyin.
            {selectedCountry && (
              <>
                {' '}Alternatif olarak, <a href="/coliving" className="underline hover:text-primary">tüm ülkelerdeki mevcut alanları</a> keşfedin.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
