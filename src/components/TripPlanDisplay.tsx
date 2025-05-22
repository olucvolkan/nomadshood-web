'use client';

import type { TripPlanOutput, DailyItineraryItem, ActivitySuggestion, ColivingSuggestion } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, Briefcase, Coffee, Utensils, CalendarDays, Building, Info, Sun, Moon, CloudSun } from 'lucide-react';

interface TripPlanDisplayProps {
  tripPlan: TripPlanOutput;
}

export function TripPlanDisplay({ tripPlan }: TripPlanDisplayProps) {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-primary/50">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center">
            <Info className="mr-2 h-6 w-6" />
            Destination Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/90">{tripPlan.destinationOverview}</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Building className="mr-2 h-5 w-5 text-primary" />
            Coliving Suggestion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <h3 className="font-semibold text-lg">{tripPlan.colivingSuggestion.name}</h3>
          <p className="text-sm text-muted-foreground flex items-center">
            <MapPin className="h-4 w-4 mr-1.5" />
            {tripPlan.colivingSuggestion.address}
          </p>
          <p className="text-sm text-foreground/80">{tripPlan.colivingSuggestion.reason}</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <CalendarDays className="mr-2 h-5 w-5 text-primary" />
            Sample 3-Day Itinerary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {tripPlan.dailyItinerary.map((item, index) => (
            <div key={index}>
              <h4 className="font-semibold text-lg mb-2 text-accent-foreground">{item.day}</h4>
              <div className="space-y-3 pl-4 border-l-2 border-accent">
                <div className="flex items-start">
                  <Sun className="h-5 w-5 mr-3 mt-1 text-yellow-500" />
                  <div>
                    <span className="font-medium">Morning:</span>
                    <p className="text-sm text-foreground/80">{item.morningActivity}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CloudSun className="h-5 w-5 mr-3 mt-1 text-orange-400" />
                  <div>
                    <span className="font-medium">Afternoon:</span>
                    <p className="text-sm text-foreground/80">{item.afternoonActivity}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Moon className="h-5 w-5 mr-3 mt-1 text-indigo-400" />
                  <div>
                    <span className="font-medium">Evening:</span>
                    <p className="text-sm text-foreground/80">{item.eveningActivity}</p>
                  </div>
                </div>
              </div>
              {index < tripPlan.dailyItinerary.length - 1 && <Separator className="my-6" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Coffee className="mr-2 h-5 w-5 text-primary" />
              Cafe Suggestions (for work)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tripPlan.cafeSuggestions.map((cafe, index) => (
              <div key={index}>
                <h4 className="font-semibold">{cafe.name}</h4>
                {cafe.reason && <p className="text-sm text-muted-foreground">{cafe.reason}</p>}
                {index < tripPlan.cafeSuggestions.length - 1 && <Separator className="my-3" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Utensils className="mr-2 h-5 w-5 text-primary" />
              Restaurant Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tripPlan.restaurantSuggestions.map((resto, index) => (
              <div key={index}>
                <h4 className="font-semibold">{resto.name}</h4>
                {resto.cuisine && <p className="text-xs text-muted-foreground uppercase tracking-wider">{resto.cuisine}</p>}
                {resto.reason && <p className="text-sm text-foreground/80">{resto.reason}</p>}
                {index < tripPlan.restaurantSuggestions.length - 1 && <Separator className="my-3" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
