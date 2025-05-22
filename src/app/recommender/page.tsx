'use client';

import { useState } from 'react';
import { RecommenderForm, type RecommendationFormData } from '@/components/RecommenderForm';
import { RecommendationCard } from '@/components/RecommendationCard';
import type { ColivingRecommendation } from '@/types';
import { getColivingRecommendations, type ColivingRecommendationsOutput } from '@/ai/flows/coliving-recommendations';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function RecommenderPage() {
  const [recommendations, setRecommendations] = useState<ColivingRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (data: RecommendationFormData) => {
    setIsLoading(true);
    setError(null);
    setRecommendations([]); // Clear previous recommendations

    try {
      const result: ColivingRecommendationsOutput = await getColivingRecommendations(data);
      if (result && result.recommendations) {
        setRecommendations(result.recommendations);
        toast({
          title: "Success!",
          description: "Here are your coliving recommendations.",
        });
      } else {
        setError('No recommendations found. Try adjusting your preferences.');
         toast({
          variant: "destructive",
          title: "Uh oh!",
          description: "No recommendations found for your criteria.",
        });
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      setError(`Failed to get recommendations: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to get recommendations: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">AI Coliving Recommender</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Let our AI find the perfect coliving match for you based on your preferences.
        </p>
      </div>
      
      <RecommenderForm onSubmit={handleSubmit} isLoading={isLoading} />

      {error && (
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {recommendations.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-center mb-6">Your Top 3 Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
