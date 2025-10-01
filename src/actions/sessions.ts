'use server';

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import type { Session } from '@/lib/types';

async function getProfessionalId() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const { data } = await supabaseAdmin
    .from('professionals')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!data) throw new Error('Professional not found');
  return data.id;
}

export async function getSessions(): Promise<Session[]> {
  const professionalId = await getProfessionalId();

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select(`
      *,
      patient:patients (
        id,
        name,
        last_name
      )
    `)
    .eq('professional_id', professionalId)
    .order('session_date', { ascending: false });

  if (error) throw error;

  return (data || []).map((session: any) => ({
    id: session.id,
    patientId: session.patient_id,
    patientName: session.patient ? `${session.patient.name} ${session.patient.last_name}` : '',
    professionalId: session.professional_id,
    sessionDate: session.session_date,
    duration: session.duration,
    notes: session.notes,
    treatmentGoals: session.treatment_goals,
    goalStatus: session.goal_status,
    riskScreening: session.risk_screening,
    riskActions: session.risk_actions,
    diagnosis: session.diagnosis,
    appliedTechniques: session.applied_techniques,
    reportedMedication: session.reported_medication,
    scales: session.scales,
    consentRecording: session.consent_recording,
    attachments: session.attachments,
    audioUrl: session.audio_url,
    billing: session.billing,
    transcription: session.transcription,
    analysis: session.analysis,
    metrics: session.metrics,
  }));
}

export async function getSessionById(id: string): Promise<Session | undefined> {
  const professionalId = await getProfessionalId();

  const { data, error} = await supabaseAdmin
    .from('sessions')
    .select(`
      *,
      patient:patients (
        id,
        name,
        last_name
      )
    `)
    .eq('id', id)
    .eq('professional_id', professionalId)
    .single();

  if (error) throw error;
  if (!data) return undefined;

  return {
    id: data.id,
    patientId: data.patient_id,
    patientName: data.patient ? `${data.patient.name} ${data.patient.last_name}` : '',
    professionalId: data.professional_id,
    sessionDate: data.session_date,
    duration: data.duration,
    notes: data.notes,
    treatmentGoals: data.treatment_goals,
    goalStatus: data.goal_status,
    riskScreening: data.risk_screening,
    riskActions: data.risk_actions,
    diagnosis: data.diagnosis,
    appliedTechniques: data.applied_techniques,
    reportedMedication: data.reported_medication,
    scales: data.scales,
    consentRecording: data.consent_recording,
    attachments: data.attachments,
    audioUrl: data.audio_url,
    billing: data.billing,
    transcription: data.transcription,
    analysis: data.analysis,
    metrics: data.metrics,
  };
}

export async function saveSession(sessionData: Session): Promise<Session> {
  const professionalId = await getProfessionalId();

  // Obtener el nombre del paciente si no lo tiene
  let patientName = sessionData.patientName;
  if (!patientName && sessionData.patientId) {
    const { data: patient } = await supabaseAdmin
      .from('patients')
      .select('name, last_name')
      .eq('id', sessionData.patientId)
      .single();

    if (patient) {
      patientName = `${patient.name} ${patient.last_name}`;
    }
  }

  const dbSession = {
    id: sessionData.id,
    patient_id: sessionData.patientId,
    professional_id: professionalId,
    session_date: sessionData.sessionDate,
    duration: sessionData.duration,
    notes: sessionData.notes,
    treatment_goals: sessionData.treatmentGoals,
    goal_status: sessionData.goalStatus,
    risk_screening: sessionData.riskScreening,
    risk_actions: sessionData.riskActions,
    diagnosis: sessionData.diagnosis,
    applied_techniques: sessionData.appliedTechniques,
    reported_medication: sessionData.reportedMedication,
    scales: sessionData.scales,
    consent_recording: sessionData.consentRecording,
    attachments: sessionData.attachments,
    audio_url: sessionData.audioUrl,
    billing: sessionData.billing,
    transcription: sessionData.transcription,
    analysis: sessionData.analysis,
    metrics: sessionData.metrics,
  };

  const { data: existing } = await supabaseAdmin
    .from('sessions')
    .select('id')
    .eq('id', sessionData.id)
    .eq('professional_id', professionalId)
    .single();

  let data, error;

  if (existing) {
    // Update
    const result = await supabaseAdmin
      .from('sessions')
      .update(dbSession)
      .eq('id', sessionData.id)
      .eq('professional_id', professionalId)
      .select()
      .single();
    data = result.data;
    error = result.error;
  } else {
    // Insert
    const result = await supabaseAdmin
      .from('sessions')
      .insert(dbSession)
      .select()
      .single();
    data = result.data;
    error = result.error;
  }

  if (error) throw error;

  revalidatePath('/sessions');
  revalidatePath('/dashboard');
  revalidatePath('/calendar');
  revalidatePath(`/sessions/${sessionData.id}`);

  return {
    id: data.id,
    patientId: data.patient_id,
    patientName: patientName,
    professionalId: data.professional_id,
    sessionDate: data.session_date,
    duration: data.duration,
    notes: data.notes,
    treatmentGoals: data.treatment_goals,
    goalStatus: data.goal_status,
    riskScreening: data.risk_screening,
    riskActions: data.risk_actions,
    diagnosis: data.diagnosis,
    appliedTechniques: data.applied_techniques,
    reportedMedication: data.reported_medication,
    scales: data.scales,
    consentRecording: data.consent_recording,
    attachments: data.attachments,
    audioUrl: data.audio_url,
    billing: data.billing,
    transcription: data.transcription,
    analysis: data.analysis,
    metrics: data.metrics,
  };
}
