
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const tripPlanSchema = z.object({
  location: z.string().min(2, { message: 'Location must be at least 2 characters.' }),
  budget: z.enum(['low', 'medium', 'high'], {
    required_error: 'You need to select a budget.',
  }),
  interests: z.string().min(3, { message: 'Please describe your interests.' }),
  duration: z.string().min(2, { message: 'Please specify the duration of your stay.' }),
  workingHours: z.string().min(3, { message: 'Please describe your typical working hours.' }),
  workingStyle: z.enum(['intense_focus', 'social_networking', 'balanced'], {
    required_error: 'Please select your working style.',
  }),
  leisureTime: z.string().min(3, { message: 'Please describe your leisure time preferences.' }),
});

export type TripPlanFormData = z.infer<typeof tripPlanSchema>;

interface RecommenderFormProps {
  onSubmit: (data: TripPlanFormData) => Promise<void>;
  isLoading: boolean;
}

const defaultFormValues: TripPlanFormData = {
  location: '',
  budget: undefined as unknown as 'low' | 'medium' | 'high', // To allow placeholder to show
  interests: '',
  duration: '',
  workingHours: '',
  workingStyle: undefined as unknown as 'intense_focus' | 'social_networking' | 'balanced',
  leisureTime: '',
};

export function RecommenderForm({ onSubmit, isLoading }: RecommenderFormProps) {
  const form = useForm<TripPlanFormData>({
    resolver: zodResolver(tripPlanSchema),
    defaultValues: defaultFormValues,
  });

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-primary/30">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">AI Trip Planner</CardTitle>
        <CardDescription>Tell us your preferences, and our AI will craft a personalized trip plan for you!</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Destination(s)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Lisbon, Portugal or Bali, Indonesia" {...field} />
                    </FormControl>
                    <FormDescription>Where are you planning to go?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your budget range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low (e.g., <$1000/month)</SelectItem>
                        <SelectItem value="medium">Medium (e.g., $1000-$2500/month)</SelectItem>
                        <SelectItem value="high">High (e.g., >$2500/month)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>What is your approximate monthly budget?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interests</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., nature, hiking, city life, beaches, cultural activities, adventure sports, tech meetups"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>What kind of activities and environments do you enjoy?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Travel Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1 month, 3 months, 6+ months" {...field} />
                    </FormControl>
                    <FormDescription>How long are you planning to stay?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                control={form.control}
                name="workingStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Working Style</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your preferred working style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="intense_focus">Intense Focus (Prefer quiet, dedicated spaces)</SelectItem>
                        <SelectItem value="social_networking">Social & Networking (Enjoy collaborative environments)</SelectItem>
                        <SelectItem value="balanced">Balanced (A mix of focus and social interaction)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>What kind of work environment do you prefer?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="workingHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Working Hours</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 9am-5pm Mon-Fri, flexible evenings, 4 hours daily" {...field} />
                  </FormControl>
                  <FormDescription>What are your typical working hours or work pattern?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="leisureTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leisure Time Preferences</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., weekends only, weekday afternoons, mornings and late evenings"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>When do you prefer to allocate time for sightseeing and leisure?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isLoading} size="lg" className="w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                'Generate Trip Plan'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
