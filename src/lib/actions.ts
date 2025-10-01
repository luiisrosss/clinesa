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

export type AnalyzeSessionInsightsOutput = AnalyzeOutput;
export type CaptureConversationMetricsOutput = MetricsOutput;

export async function runTranscription(
  input: TranscribeAudioSessionInput
): Promise<TranscribeAudioSessionOutput> {
  return await transcribeAudioSession(input);
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
