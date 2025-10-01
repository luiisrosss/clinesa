'use server';

/**
 * @fileOverview This file defines a Genkit flow to capture conversation metrics from a session transcript.
 *
 * The flow takes a session transcript as input and returns metrics such as speaker time and response intensity.
 *
 * - captureConversationMetrics - A function that initiates the conversation metrics capture flow.
 * - CaptureConversationMetricsInput - The input type for the captureConversationMetrics function.
 * - CaptureConversationMetricsOutput - The return type for the captureConversationMetrics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CaptureConversationMetricsInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the conversation to analyze.'),
});
export type CaptureConversationMetricsInput = z.infer<
  typeof CaptureConversationMetricsInputSchema
>;

const CaptureConversationMetricsOutputSchema = z.object({
  speakerTime: z
    .array(z.object({
      speaker: z.string().describe('The name or identifier of the speaker.'),
      time: z.number().describe('The total speaking time in seconds.'),
    }))
    .describe('The speaking time for each speaker.'),
  responseIntensity: z
    .array(z.object({
      speaker: z.string().describe('The name or identifier of the speaker.'),
      intensity: z.number().describe('The average response intensity.'),
    }))
    .describe('The response intensity for each speaker.'),
});
export type CaptureConversationMetricsOutput = z.infer<
  typeof CaptureConversationMetricsOutputSchema
>;

export async function captureConversationMetrics(
  input: CaptureConversationMetricsInput
): Promise<CaptureConversationMetricsOutput> {
  return captureConversationMetricsFlow(input);
}

const captureConversationMetricsPrompt = ai.definePrompt({
  name: 'captureConversationMetricsPrompt',
  input: {schema: CaptureConversationMetricsInputSchema},
  output: {schema: CaptureConversationMetricsOutputSchema},
  prompt: `You are an AI assistant designed to analyze conversation transcripts and extract key metrics.

  Analyze the following transcript and provide the speaker time and response intensity for each speaker.
  The speaker time should be measured in seconds.
  The response intensity should be measured on a scale of 1 to 10.

  Transcript: {{{transcript}}}`,
});

const captureConversationMetricsFlow = ai.defineFlow(
  {
    name: 'captureConversationMetricsFlow',
    inputSchema: CaptureConversationMetricsInputSchema,
    outputSchema: CaptureConversationMetricsOutputSchema,
  },
  async input => {
    const {output} = await captureConversationMetricsPrompt(input);
    return output!;
  }
);
