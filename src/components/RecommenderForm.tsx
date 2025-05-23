
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

// Schema and type definition moved to top level for potentially simpler parsing.
const tripPlanSchema = z.object({
  location: z.string().min(2, { message: "Location must be at least 2 characters." }),
  budget: z.enum(['low', 'medium', 'high'], {
    required_error: "You need to select a budget range.",
  }),
  interests: z.string().min(3, { message: "Interests must be at least 3 characters." }),
  duration: z.string().min(3, { message: "Duration must be at least 3 characters." }),
  workingHours: z.string().min(3, { message: "Working hours description must be at least 3 characters." }),
  leisureTime: z.string().min(3, { message: "Leisure time preferences must be at least 3 characters." })
});

// Temporarily use 'any' to simplify type for parsing diagnosis
type TripPlanFormData = any;
// For actual use, it should be:
// export type TripPlanFormData = z.infer<typeof tripPlanSchema>;


interface RecommenderFormProps {
  onSubmit: (data: TripPlanFormData) => Promise<void>; // TripPlanFormData is now 'any' for this debug step
  isLoading: boolean;
}

export function RecommenderForm({ onSubmit, isLoading }: RecommenderFormProps) {
  const form = useForm<TripPlanFormData>({ // TripPlanFormData is now 'any'
    resolver: zodResolver(tripPlanSchema),
    defaultValues: {
      location: '',
      budget: undefined, // To allow placeholder to show
      interests: '',
      duration: '',
      workingHours: '',
      leisureTime: ''
    }
  });
  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">AI Trip Planner</CardTitle>
        <CardDescription>Tell us your preferences, and our AI will craft a personalized trip plan for you!</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Bali, Lisbon, Medellin" {...field} />
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
                  <FormLabel>Budget</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined} defaultValue={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
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
                  <FormLabel>Interests & Vibe</FormLabel>
                  <FormControl>
                    <Textarea
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
                  <FormLabel>Duration of Stay</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1 week, 3 months, 10 days" {...field} />
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
                  <FormLabel>Working Hours / Pattern</FormLabel>
                  <FormControl>
                    <Textarea
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
                  <FormLabel>Leisure Time Preferences</FormLabel>
                  <FormControl>
                    <Textarea
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
