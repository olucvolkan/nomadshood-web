
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';

export interface FiltersState {
  budget: string; // 'all', 'low', 'medium', 'high'
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
  
  const handleBudgetChange = (value: string) => {
    onFilterChange({ budget: value });
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
      budget: 'all',
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Budget Filter */}
          <div className="space-y-2">
            <Label htmlFor="budget-filter" className="text-md font-semibold">Budget</Label>
            <Select value={filters.budget} onValueChange={handleBudgetChange}>
              <SelectTrigger id="budget-filter" className="w-full">
                <SelectValue placeholder="Select budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Budgets</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amenity Filters */}
          <div className="space-y-4 pt-2 md:pt-8"> {/* Adjust top padding for alignment */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="private-bathroom-filter"
                checked={filters.hasPrivateBathroom}
                onCheckedChange={(checked) => handlePrivateBathroomChange(checked as boolean)}
              />
              <Label htmlFor="private-bathroom-filter" className="font-medium cursor-pointer">
                Private Bathroom
              </Label>
            </div>
            <div className="flex items-center space-x-2">
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
        
        <div className="pt-4">
          <Button onClick={resetFilters} variant="outline" className="w-full md:w-auto">
            Reset All Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
