
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const tripPlanSchema = z.object({
  location: z.string().min(2, { message: 'Location must be at least 2 characters long.' }),
  budget: z.enum(['low', 'medium', 'high'], { required_error: 'Please select a budget.' }),
  interests: z.string().min(3, { message: 'Interests must be at least 3 characters long.' }),
  duration: z.string().min(1, { message: 'Please enter the duration of your stay.'}),
  workingHours: z.string().min(3, { message: 'Please describe your working hours/pattern.'}),
  leisureTime: z.string().min(3, { message: 'Please describe your leisure time preferences.'}),
});

export type TripPlanFormData = z.infer<typeof tripPlanSchema>;

interface RecommenderFormProps {
  onSubmit: (data: TripPlanFormData) => Promise<void>;
  isLoading: boolean;
}

export function RecommenderForm({ onSubmit, isLoading }: RecommenderFormProps) {
  const form = useForm<TripPlanFormData>({
    resolver: zodResolver(tripPlanSchema),
    defaultValues: {
      location: '',
      budget: undefined,
      interests: '',
      duration: '',
      workingHours: '',
      leisureTime: '',
    },
  });

  const handleFormSubmit: SubmitHandler<TripPlanFormData> = async (data) => {
    await onSubmit(data);
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">AI Trip Planner</CardTitle>
        <CardDescription>Tell us your preferences, and our AI will craft a personalized trip plan for you!</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="location">Preferred Location</FormLabel>
                  <FormControl>
                    <Input id="location" placeholder="e.g., Bali, Lisbon, Medellin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="budget">Budget</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger id="budget">
                        <SelectValue placeholder="Select your budget range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low (e.g., <$800/month)</SelectItem>
                      <SelectItem value="medium">Medium (e.g., $800-$1500/month)</SelectItem>
                      <SelectItem value="high">High (e.g., >$1500/month)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="interests">Interests & Vibe</FormLabel>
                  <FormControl>
                    <Textarea
                      id="interests"
                      placeholder="e.g., surfing, tech networking, quiet & focused, community events, art galleries, hiking"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="duration">Duration of Stay</FormLabel>
                  <FormControl>
                    <Input id="duration" placeholder="e.g., 1 week, 3 months, 10 days" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workingHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="workingHours">Working Hours / Pattern</FormLabel>
                  <FormControl>
                    <Textarea
                      id="workingHours"
                      placeholder="e.g., 9am-5pm Mon-Fri, Flexible - mostly evenings, 4 hours daily in mornings"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="leisureTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="leisureTime">Leisure Time Preferences</FormLabel>
                  <FormControl>
                    <Textarea
                      id="leisureTime"
                      placeholder="e.g., Weekends free for day trips, weekday afternoons for museums, evenings for social events"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Your Trip Plan...
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
