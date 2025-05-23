
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react'; // Changed icon to a more generic filter icon

export interface FiltersState {
  selectedCity: string;
}

interface ColivingFiltersProps {
  filters: FiltersState;
  onFilterChange: (newFilters: Partial<FiltersState>) => void;
}

export function ColivingFilters({ filters, onFilterChange }: ColivingFiltersProps) {
  
  const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ selectedCity: event.target.value });
  };

  const resetFilters = () => {
    onFilterChange({
      selectedCity: '',
    });
  };

  return (
    <Card className="mb-8 shadow-lg border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <Filter className="mr-2 h-6 w-6" />
          Filtrele
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          {/* City Filter */}
          <div className="md:col-span-1 space-y-2">
            <Label htmlFor="city-filter-input" className="text-md font-semibold">Şehir</Label>
            <Input
              id="city-filter-input"
              type="text"
              placeholder="Şehir adı girin..."
              value={filters.selectedCity}
              onChange={handleCityChange}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="pt-4">
          <Button onClick={resetFilters} variant="outline" className="w-full md:w-auto">
            Filtreleri Temizle
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
