'use client';

import { useState } from 'react';
import { RecommenderForm, type TripPlanFormData } from '@/components/RecommenderForm'; // Updated import
import { TripPlanDisplay } from '@/components/TripPlanDisplay'; // New component for displaying the plan
import type { TripPlanOutput } from '@/types'; // Updated type import
import { generateTripPlan } from '@/ai/flows/trip-planner-flow'; // Updated AI flow import
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, PlaneTakeoff } from "lucide-react";

export default function RecommenderPage() {
  const [tripPlan, setTripPlan] = useState<TripPlanOutput | null>(null); // Updated state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (data: TripPlanFormData) => {
    setIsLoading(true);
    setError(null);
    setTripPlan(null); // Clear previous plan

    try {
      const result: TripPlanOutput = await generateTripPlan(data); // Call updated AI flow
      if (result) {
        setTripPlan(result);
        toast({
          title: "Trip Plan Generated!",
          description: "Here is your personalized trip plan.",
          className: "bg-primary text-primary-foreground",
        });
      } else {
        // This case might not be hit if the flow always throws an error on failure
        setError('No trip plan could be generated. Try adjusting your preferences.');
         toast({
          variant: "destructive",
          title: "Uh oh!",
          description: "No trip plan could be generated for your criteria.",
        });
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      setError(`Failed to generate trip plan: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to generate trip plan: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary flex items-center justify-center">
          <PlaneTakeoff className="mr-3 h-10 w-10" />
          AI Trip Planner
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Let our AI craft the perfect digital nomad adventure for you!
        </p>
      </div>
      
      <RecommenderForm onSubmit={handleSubmit} isLoading={isLoading} />

      {error && (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {tripPlan && !isLoading && (
        <div className="mt-10">
          <h2 className="text-3xl font-semibold text-center mb-8 text-primary">Your Personalized Trip Plan</h2>
          <TripPlanDisplay tripPlan={tripPlan} />
        </div>
      )}
    </div>
  );
}
