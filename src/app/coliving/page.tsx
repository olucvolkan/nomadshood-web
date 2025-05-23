
'use client';

import { useMemo } from 'react';
import { ColivingCard } from '@/components/ColivingCard';
import { mockColivingSpaces } from '@/lib/mock-data';
import type { ColivingSpace } from '@/types';
import { Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ColivingDirectoryPage({
  searchParams,
}: {
  searchParams?: { country?: string };
}) {
  const allSpaces: ColivingSpace[] = mockColivingSpaces;
  const selectedCountry = searchParams?.country;

  const filteredSpaces = useMemo(() => {
    if (!selectedCountry) {
      return allSpaces; // No country selected, show all spaces
    }
    return allSpaces.filter(space => {
      const addressParts = space.address.split(', ');
      const countryNameInSpace = addressParts[addressParts.length - 1];
      return countryNameInSpace.toLowerCase() === decodeURIComponent(selectedCountry).toLowerCase();
    });
  }, [allSpaces, selectedCountry]);

  const pageTitle = selectedCountry
    ? `${decodeURIComponent(selectedCountry)} Coliving Alanları`
    : 'Tüm Coliving Alanları';

  const pageDescription = selectedCountry
    ? `${decodeURIComponent(selectedCountry)} bölgesindeki tüm harika coliving alanlarını keşfedin.`
    : 'Dünyanın dört bir yanındaki benzersiz coliving alanlarını keşfedin.';

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">{pageTitle}</h1>
        <p className="text-lg text-muted-foreground mt-2">
          {pageDescription}
        </p>
      </div>

      {filteredSpaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpaces.map((space) => (
            <ColivingCard key={space.id} space={space} showViewDetailsButton={true} />
          ))}
        </div>
      ) : (
        <Alert className="max-w-lg mx-auto">
          <Info className="h-4 w-4" />
          <AlertTitle>Alan Bulunamadı</AlertTitle>
          <AlertDescription>
            {selectedCountry ? (
              <>
                Üzgünüz, {decodeURIComponent(selectedCountry)} için herhangi bir coliving alanı bulamadık.
                <br />
                <Button variant="link" className="p-0 h-auto mt-2" asChild>
                  <Link href="/coliving">Tüm alanları gör</Link>
                </Button>
              </>
            ) : (
              "Üzgünüz, şu anda listelenecek bir coliving alanı bulunmamaktadır."
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
