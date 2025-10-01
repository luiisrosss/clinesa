'use server';

/**
 * @fileOverview This file defines a Genkit flow for transcribing audio from patient sessions into text.
 *
 * It includes:
 * - transcribeAudioSession:  A function to transcribe audio from patient sessions.
 * - TranscribeAudioSessionInput: The expected input schema for the transcribeAudioSession function.
 * - TranscribeAudioSessionOutput: The output schema for the transcribeAudioSession function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeAudioSessionInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The audio data URI of the patient session recording. Must be an mp3 or mp4 file format as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:audio/mpeg;base64,<encoded_data>' or 'data:audio/mp4;base64,<encoded_data>'."
    ),
});
export type TranscribeAudioSessionInput = z.infer<typeof TranscribeAudioSessionInputSchema>;

const TranscribeAudioSessionOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text of the audio session.'),
});
export type TranscribeAudioSessionOutput = z.infer<typeof TranscribeAudioSessionOutputSchema>;

export async function transcribeAudioSession(
  input: TranscribeAudioSessionInput
): Promise<TranscribeAudioSessionOutput> {
  return transcribeAudioSessionFlow(input);
}

const transcribeAudioSessionPrompt = ai.definePrompt({
  name: 'transcribeAudioSessionPrompt',
  input: {schema: TranscribeAudioSessionInputSchema},
  output: {schema: TranscribeAudioSessionOutputSchema},
  prompt: `Transcribe the following audio recording of a therapy session to text.\n\nAudio: {{media url=audioDataUri}}`,
});

const transcribeAudioSessionFlow = ai.defineFlow(
  {
    name: 'transcribeAudioSessionFlow',
    inputSchema: TranscribeAudioSessionInputSchema,
    outputSchema: TranscribeAudioSessionOutputSchema,
  },
  async input => {
    const {output} = await transcribeAudioSessionPrompt(input);
    return output!;
  }
);
