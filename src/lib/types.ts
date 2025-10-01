import type { AnalyzeSessionInsightsOutput, CaptureConversationMetricsOutput } from "@/lib/actions";

export interface Patient {
  id: string; // UUID
  name: string;
  lastName: string;
  birthDate?: string;
  alias?: string;
  phone: string;
  email: string;
  contactPreference?: 'phone' | 'email';
  
  // RGPD/Consentimientos
  consentDataProcessing?: { accepted: boolean; date: string; documentVersion: string };
  consentReminders?: { accepted: boolean; date: string; };
  legalRepresentative?: { name: string; relation: string; };

  // Clínico
  reasonForConsultation: string;
  currentRisk?: 'none' | 'low' | 'medium' | 'high';
  allergies?: string;

  // Administrativo
  assignedProfessional?: string;
  registrationDate: string; // Fecha de alta
  referralSource?: string;
}

export interface Session {
  id: string;
  patientId: string;
  patientName: string; // Para mostrarlo fácilmente
  professionalId: string; // Asumimos un profesional por ahora
  sessionDate: string; // fecha_hora
  duration: number; // duracion_min
  notes?: {
    subjective?: string; // S_subjetivo / D_descripcion
    objective?: string; // O_objetivo
    analysis?: string; // A_analisis
    plan?: string; // P_plan
  };
  treatmentGoals?: string[];
  goalStatus?: 'not_started' | 'in_progress' | 'achieved';
  riskScreening?: 'none' | 'low' | 'medium' | 'high';
  riskActions?: string;
  diagnosis?: {
    system?: 'DSM-5-TR' | 'CIE-10' | 'CIE-11';
    codes?: string[];
    date?: string;
  };
  appliedTechniques?: string[];
  reportedMedication?: string;
  scales?: {
    name: string; // PHQ-9, GAD-7, etc.
    score: string;
    date: string;
  }[];
  consentRecording?: {
    accepted: boolean;
    date: string;
  };
  attachments?: string[]; // URLs a archivos
  billing?: {
    amount: number;
    vat: number;
    paid: boolean;
    invoiceRef?: string;
  };
  // Campos de AI que ya existían
  audioUrl?: string;
  transcription?: string;
  analysis?: AnalyzeSessionInsightsOutput;
  metrics?: CaptureConversationMetricsOutput;
}
