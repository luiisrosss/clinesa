import { config } from 'dotenv';
config();

import '@/ai/flows/capture-conversation-metrics.ts';
import '@/ai/flows/analyze-session-insights.ts';
import '@/ai/flows/transcribe-audio-session.ts';