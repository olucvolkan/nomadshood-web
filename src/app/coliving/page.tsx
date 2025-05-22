import { ColivingCard } from '@/components/ColivingCard';
import { mockColivingSpaces } from '@/lib/mock-data';
import type { ColivingSpace } from '@/types';
import { ListFilter } from 'lucide-react';

export default function ColivingDirectoryPage() {
  const spaces: ColivingSpace[] = mockColivingSpaces;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">Coliving Directory</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Explore unique coliving spaces around the globe.
        </p>
      </div>
      
      {/* Placeholder for filters - future enhancement */}
      {/* 
      <div className="flex justify-end">
        <Button variant="outline">
          <ListFilter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div> 
      */}

      {spaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => (
            <ColivingCard key={space.id} space={space} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No coliving spaces found at the moment.</p>
          <p className="text-sm text-muted-foreground mt-2">Please check back later or try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
