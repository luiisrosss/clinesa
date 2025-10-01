'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing transcribed session text to identify key discussion points and summarize the session.
 *
 * - analyzeSessionInsights - A function that handles the session analysis process.
 * - AnalyzeSessionInsightsInput - The input type for the analyzeSessionInsights function.
 * - AnalyzeSessionInsightsOutput - The return type for the analyzeSessionInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSessionInsightsInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcribed text of the session.'),
});
export type AnalyzeSessionInsightsInput = z.infer<typeof AnalyzeSessionInsightsInputSchema>;

const AnalyzeSessionInsightsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the session.'),
  keyDiscussionPoints: z
    .string()
    .describe('Key discussion points identified in the session.'),
  emotionalCues: z
    .string()
    .describe('Identified emotional cues from the session.'),
  potentialKeyMetrics: z
    .string()
    .describe('Potential key metrics extracted from the session.'),
});
export type AnalyzeSessionInsightsOutput = z.infer<typeof AnalyzeSessionInsightsOutputSchema>;

export async function analyzeSessionInsights(input: AnalyzeSessionInsightsInput): Promise<AnalyzeSessionInsightsOutput> {
  return analyzeSessionInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSessionInsightsPrompt',
  input: {schema: AnalyzeSessionInsightsInputSchema},
  output: {schema: AnalyzeSessionInsightsOutputSchema},
  prompt: `You are an AI assistant designed to analyze psychology session transcripts.

  Analyze the following transcript and provide a summary, key discussion points, emotional cues, and potential key metrics.

  Transcript: {{{transcript}}}

  Respond with a structured summary, key discussion points, emotional cues, and potential key metrics in the session.
  Format your response as a JSON object with the fields "summary", "keyDiscussionPoints", "emotionalCues", and "potentialKeyMetrics".

  Ensure that the summary provides a concise overview of the session.
  Identify and list the key discussion points that emerged during the session.
  Analyze the transcript to identify emotional cues, such as expressions of sadness, anger, or joy.
  Suggest potential key metrics that can be tracked to assess the patient\'s progress over time.
`,
});

const analyzeSessionInsightsFlow = ai.defineFlow(
  {
    name: 'analyzeSessionInsightsFlow',
    inputSchema: AnalyzeSessionInsightsInputSchema,
    outputSchema: AnalyzeSessionInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
