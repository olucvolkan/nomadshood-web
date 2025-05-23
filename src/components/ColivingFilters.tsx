
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Added Input
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';

export interface FiltersState {
  minBudget: string; // Store as string to handle empty input
  maxBudget: string; // Store as string to handle empty input
  hasPrivateBathroom: boolean;
  hasCoworking: boolean;
  selectedVibes: string[];
}

interface ColivingFiltersProps {
  filters: FiltersState;
  onFilterChange: (newFilters: Partial<FiltersState>) => void;
  availableVibeTags: string[];
}

export function ColivingFilters({ filters, onFilterChange, availableVibeTags }: ColivingFiltersProps) {
  
  const handleMinBudgetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ minBudget: event.target.value });
  };

  const handleMaxBudgetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ maxBudget: event.target.value });
  };

  const handlePrivateBathroomChange = (checked: boolean) => {
    onFilterChange({ hasPrivateBathroom: checked });
  };

  const handleCoworkingChange = (checked: boolean) => {
    onFilterChange({ hasCoworking: checked });
  };

  const handleVibeChange = (vibe: string, checked: boolean) => {
    const newSelectedVibes = checked
      ? [...filters.selectedVibes, vibe]
      : filters.selectedVibes.filter((v) => v !== vibe);
    onFilterChange({ selectedVibes: newSelectedVibes });
  };

  const resetFilters = () => {
    onFilterChange({
      minBudget: '',
      maxBudget: '',
      hasPrivateBathroom: false,
      hasCoworking: false,
      selectedVibes: [],
    });
  };

  return (
    <Card className="mb-8 shadow-lg border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <SlidersHorizontal className="mr-2 h-6 w-6" />
          Filter Coliving Spaces
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Budget Range Filter */}
          <div className="md:col-span-1 space-y-2">
            <Label className="text-md font-semibold">Budget Range (Monthly)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minBudget}
                onChange={handleMinBudgetChange}
                className="w-full"
                min="0"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxBudget}
                onChange={handleMaxBudgetChange}
                className="w-full"
                min="0"
              />
            </div>
          </div>

          {/* Amenity Filters */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 items-end">
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="private-bathroom-filter"
                checked={filters.hasPrivateBathroom}
                onCheckedChange={(checked) => handlePrivateBathroomChange(checked as boolean)}
              />
              <Label htmlFor="private-bathroom-filter" className="font-medium cursor-pointer">
                Private Bathroom
              </Label>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="coworking-filter"
                checked={filters.hasCoworking}
                onCheckedChange={(checked) => handleCoworkingChange(checked as boolean)}
              />
              <Label htmlFor="coworking-filter" className="font-medium cursor-pointer">
                Coworking Space
              </Label>
            </div>
          </div>
        </div>

        {/* Vibe Filter */}
        {availableVibeTags.length > 0 && (
          <div className="space-y-3">
            <Label className="text-md font-semibold block mb-2">Vibe / Tags</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {availableVibeTags.map((vibe) => (
                <div key={vibe} className="flex items-center space-x-2">
                  <Checkbox
                    id={`vibe-${vibe}`}
                    checked={filters.selectedVibes.includes(vibe)}
                    onCheckedChange={(checked) => handleVibeChange(vibe, checked as boolean)}
                  />
                  <Label htmlFor={`vibe-${vibe}`} className="font-medium capitalize cursor-pointer">
                    {vibe}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="pt-4">
          <Button onClick={resetFilters} variant="outline" className="w-full md:w-auto">
            Reset All Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
