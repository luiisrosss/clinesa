'use server';

import {
  transcribeAudioSession,
  TranscribeAudioSessionInput,
  TranscribeAudioSessionOutput,
} from '@/ai/flows/transcribe-audio-session';
import {
  analyzeSessionInsights,
  AnalyzeSessionInsightsInput,
  AnalyzeSessionInsightsOutput as AnalyzeOutput,
} from '@/ai/flows/analyze-session-insights';
import {
  captureConversationMetrics,
  CaptureConversationMetricsInput,
  CaptureConversationMetricsOutput as MetricsOutput,
} from '@/ai/flows/capture-conversation-metrics';
import { calculateCreditsForAudio, consumeCredits, hasEnoughCredits } from '@/actions/credits';

export type AnalyzeSessionInsightsOutput = AnalyzeOutput;
export type CaptureConversationMetricsOutput = MetricsOutput;

export async function runTranscription(
  input: TranscribeAudioSessionInput & { sessionId: string; durationMinutes: number }
): Promise<TranscribeAudioSessionOutput> {
  const { sessionId, durationMinutes, ...transcriptionInput } = input;

  // Calcular créditos necesarios
  const creditsNeeded = await calculateCreditsForAudio(durationMinutes);

  // Verificar si tiene suficientes créditos
  const hasCredits = await hasEnoughCredits(creditsNeeded);
  if (!hasCredits) {
    throw new Error(
      `Créditos insuficientes. Necesitas ${creditsNeeded} créditos para transcribir ${durationMinutes} minutos de audio.`
    );
  }

  // Realizar transcripción
  const result = await transcribeAudioSession(transcriptionInput);

  // Consumir créditos
  const consumed = await consumeCredits(
    sessionId,
    creditsNeeded,
    `Transcripción de audio (${durationMinutes} min)`
  );

  if (!consumed) {
    // Esto no debería pasar porque ya verificamos, pero por seguridad
    throw new Error('Error al consumir créditos. Contacta con soporte.');
  }

  return result;
}

export async function runAnalysis(
  input: AnalyzeSessionInsightsInput
): Promise<AnalyzeSessionInsightsOutput> {
  return await analyzeSessionInsights(input);
}

export async function runMetrics(
  input: CaptureConversationMetricsInput
): Promise<CaptureConversationMetricsOutput> {
  return await captureConversationMetrics(input);
}
