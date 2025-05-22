// The use server directive is necessary for code that will be called by React.
'use server';

/**
 * @fileOverview Coliving recommendation AI agent.
 *
 * - getColivingRecommendations - A function that returns the top 3 coliving recommendations.
 * - ColivingRecommendationsInput - The input type for the getColivingRecommendations function.
 * - ColivingRecommendationsOutput - The return type for the getColivingRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ColivingRecommendationsInputSchema = z.object({
  location: z.string().describe('The preferred location for coliving.'),
  budget: z.string().describe('The budget for coliving, e.g., "low", "medium", "high".'),
  interests: z.string().describe('The interests of the user, e.g., "surfing", "hiking", "nightlife".'),
});
export type ColivingRecommendationsInput = z.infer<typeof ColivingRecommendationsInputSchema>;

const ColivingRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      name: z.string().describe('The name of the coliving space.'),
      address: z.string().describe('The address of the coliving space.'),
      description: z.string().describe('A short description of the coliving space and why it is recommended.'),
    })
  ).describe('Top 3 coliving recommendations based on user preferences.'),
});
export type ColivingRecommendationsOutput = z.infer<typeof ColivingRecommendationsOutputSchema>;

export async function getColivingRecommendations(input: ColivingRecommendationsInput): Promise<ColivingRecommendationsOutput> {
  return colivingRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'colivingRecommendationsPrompt',
  input: {schema: ColivingRecommendationsInputSchema},
  output: {schema: ColivingRecommendationsOutputSchema},
  prompt: `You are an AI assistant that recommends coliving spaces based on user preferences. Provide the top 3 coliving recommendations based on the user's location, budget, and interests. Be concise and provide the name, address, and a short description for each recommendation.

Location: {{{location}}}
Budget: {{{budget}}}
Interests: {{{interests}}}

Here are the recommendations:`,
});

const colivingRecommendationsFlow = ai.defineFlow(
  {
    name: 'colivingRecommendationsFlow',
    inputSchema: ColivingRecommendationsInputSchema,
    outputSchema: ColivingRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
