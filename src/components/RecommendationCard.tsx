import type { ColivingRecommendation } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Info } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: ColivingRecommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center">
           <Info className="h-5 w-5 mr-2" /> {recommendation.name}
        </CardTitle>
        <CardDescription className="flex items-center text-sm pt-1">
          <MapPin className="h-4 w-4 mr-1.5 text-muted-foreground" />
          {recommendation.address}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground/90">{recommendation.description}</p>
      </CardContent>
    </Card>
  );
}
