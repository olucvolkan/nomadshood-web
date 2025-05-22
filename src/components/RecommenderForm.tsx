'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const recommendationSchema = z.object({
  location: z.string().min(2, { message: 'Location must be at least 2 characters long.' }),
  budget: z.enum(['low', 'medium', 'high'], { required_error: 'Please select a budget.' }),
  interests: z.string().min(3, { message: 'Interests must be at least 3 characters long.' }),
});

export type RecommendationFormData = z.infer<typeof recommendationSchema>;

interface RecommenderFormProps {
  onSubmit: (data: RecommendationFormData) => Promise<void>;
  isLoading: boolean;
}

export function RecommenderForm({ onSubmit, isLoading }: RecommenderFormProps) {
  const form = useForm<RecommendationFormData>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      location: '',
      budget: undefined, // Default to undefined so placeholder shows
      interests: '',
    },
  });

  const handleFormSubmit: SubmitHandler<RecommendationFormData> = async (data) => {
    await onSubmit(data);
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Find Your Perfect Coliving</CardTitle>
        <CardDescription>Tell us your preferences, and our AI will suggest the top 3 spots for you!</CardDescription>
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
                      <SelectItem value="low">Low (e.g., &lt;$800/month)</SelectItem>
                      <SelectItem value="medium">Medium (e.g., $800-$1500/month)</SelectItem>
                      <SelectItem value="high">High (e.g., &gt;$1500/month)</SelectItem>
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
                      placeholder="e.g., surfing, tech networking, quiet & focused, community events"
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
                  Getting Recommendations...
                </>
              ) : (
                'Get Recommendations'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
