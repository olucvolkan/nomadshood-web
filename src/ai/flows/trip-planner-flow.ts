// The use server directive is necessary for code that will be called by React.
'use server';

/**
 * @fileOverview AI Trip Planner for Digital Nomads.
 *
 * - generateTripPlan - A function that generates a trip plan based on user preferences.
 * - TripPlanInput - The input type for the generateTripPlan function.
 * - TripPlanOutput - The return type for the generateTripPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { TripPlanInput as TripPlanInputType, TripPlanOutput as TripPlanOutputType } from '@/types';


const TripPlanInputSchema = z.object({
  location: z.string().describe('The preferred location for the trip.'),
  budget: z.enum(['low', 'medium', 'high']).describe('The budget for the trip, e.g., "low", "medium", "high".'),
  interests: z.string().describe('The interests of the user, e.g., "surfing", "hiking", "art", "tech meetups".'),
  duration: z.string().describe('Duration of stay, e.g., "1 week", "2 months", "15 days".'),
  workingHours: z.string().describe('Typical working hours or work pattern, e.g., "9am-5pm Mon-Fri", "flexible, mostly evenings", "part-time 4 hours daily".'),
  leisureTime: z.string().describe('Preferred time for sightseeing and leisure activities, e.g., "weekends only", " weekday afternoons", "mornings and late evenings".'),
  workingStyle: z.enum(['intense_focus', 'social_networking', 'balanced']).describe('User\'s preferred working style: "intense_focus" for quiet, dedicated work; "social_networking" for collaborative environments and networking; "balanced" for a mix of both.'),
});
export type TripPlanInput = z.infer<typeof TripPlanInputSchema>;

const ColivingSuggestionSchema = z.object({
  name: z.string().describe('The name of the recommended coliving space.'),
  address: z.string().describe('The address of the coliving space.'),
  reason: z.string().describe('A brief reason why this coliving space is recommended for the user, considering their working style and other preferences.'),
});

const ActivitySuggestionSchema = z.object({
    name: z.string().describe('Name of the cafe or restaurant.'),
    reason: z.string().optional().describe('Brief reason for recommendation (e.g., good wifi, quiet, social atmosphere, local cuisine), considering working style.'),
    cuisine: z.string().optional().describe('Type of cuisine (for restaurants).'),
});

const DailyItineraryItemSchema = z.object({
  day: z.string().describe('Label for the day, e.g., "Day 1", "Sample Monday".'),
  morningActivity: z.string().describe('Suggested morning activity, work block, or cafe visit, aligned with working style and leisure preferences.'),
  afternoonActivity: z.string().describe('Suggested afternoon activity, work block, or exploration, aligned with working style and leisure preferences.'),
  eveningActivity: z.string().describe('Suggested evening activity, e.g., dinner, social event, relaxation, aligned with interests and working style if applicable (e.g., networking events).'),
});

const TripPlanOutputSchema = z.object({
  destinationOverview: z.string().describe('A brief overview of the recommended destination and why it fits the user\'s preferences including working style.'),
  colivingSuggestion: ColivingSuggestionSchema.describe('A single, top coliving space recommendation tailored to the user\'s working style and preferences.'),
  dailyItinerary: z.array(DailyItineraryItemSchema).length(3).describe('A sample 3-day itinerary, detailing morning, afternoon, and evening plans, considering working style, working hours, and leisure time.'),
  cafeSuggestions: z.array(ActivitySuggestionSchema).length(2).describe('Two cafe suggestions suitable for working, based on working style (e.g., quiet for focus, lively for networking), including name and reason.'),
  restaurantSuggestions: z.array(ActivitySuggestionSchema).length(2).describe('Two restaurant suggestions, including name, cuisine, and reason, potentially matching working style (e.g., quick eats for focus, group-friendly for networking).'),
});
export type TripPlanOutput = z.infer<typeof TripPlanOutputSchema>;


export async function generateTripPlan(input: TripPlanInputType): Promise<TripPlanOutputType> {
  return tripPlannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tripPlannerPrompt',
  input: {schema: TripPlanInputSchema},
  output: {schema: TripPlanOutputSchema},
  prompt: `You are an AI travel planner for digital nomads. Based on the user's preferences, generate a comprehensive trip plan.
Be practical, concise, and ensure your suggestions are actionable.

User Preferences:
Location: {{{location}}}
Budget: {{{budget}}}
Interests: {{{interests}}}
Duration of Stay: {{{duration}}}
Working Hours: {{{workingHours}}}
Leisure Preferences: {{{leisureTime}}}
Working Style: {{{workingStyle}}} (This describes the user's preferred work environment: 'intense_focus' for quiet, dedicated work; 'social_networking' for collaborative environments and networking events; 'balanced' for a mix.)

Generate a plan with the following structure:
1.  Destination Overview: A brief (2-3 sentences) overview of why the chosen location is suitable based on the user's inputs, including their working style.
2.  Coliving Suggestion: Recommend ONE coliving space. Provide its name, a plausible fictional address, and a short reason it fits the user, especially considering their working style (e.g., quiet zones for 'intense_focus', strong community for 'social_networking').
3.  Daily Itinerary: Provide a sample 3-DAY itinerary. For each day, suggest distinct morning, afternoon, and evening activities. These activities can include focused work blocks (mention if it's a good time based on workingHours), suggestions for working at a cafe (tailored to workingStyle), local exploration, cultural experiences, or dining. Integrate workingHours and leisureTime preferences.
4.  Cafe Suggestions: Recommend TWO cafes suitable for working. Provide their names and a brief reason for the recommendation, explicitly linking it to the user's workingStyle (e.g., "Quiet atmosphere, perfect for intense focus" or "Lively, great for networking and casual work").
5.  Restaurant Suggestions: Recommend TWO restaurants. Provide their names, type of cuisine, and a brief reason for the recommendation. If applicable, relate to working style (e.g., "Quick and healthy options for focused days" or "Good for group dinners if user is social").

Focus on providing concrete and diverse suggestions that align with a digital nomad lifestyle. Ensure all output fields are populated according to the schema and user's working style preference.`,
});

const tripPlannerFlow = ai.defineFlow(
  {
    name: 'tripPlannerFlow',
    inputSchema: TripPlanInputSchema,
    outputSchema: TripPlanOutputSchema,
  },
  async (input: TripPlanInputType) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a trip plan.');
    }
    return output;
  }
);
