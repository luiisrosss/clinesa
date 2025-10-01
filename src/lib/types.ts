import type { AnalyzeSessionInsightsOutput, CaptureConversationMetricsOutput } from "@/lib/actions";

export interface Session {
  id: string;
  patientName: string;
  sessionDate: string;
  sessionNumber: number;
  audioUrl?: string;
  transcription?: string;
  notes?: string;
  analysis?: AnalyzeSessionInsightsOutput;
  metrics?: CaptureConversationMetricsOutput;
}
