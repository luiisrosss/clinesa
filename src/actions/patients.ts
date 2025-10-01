'use server';

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import type { Patient } from '@/lib/types';

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

export async function getPatients(): Promise<Patient[]> {
  const professionalId = await getProfessionalId();

  const { data, error } = await supabaseAdmin
    .from('patients')
    .select('*')
    .eq('professional_id', professionalId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Convertir datos de Supabase al formato que espera la app
  return (data || []).map((patient: any) => ({
    id: patient.id,
    name: patient.name,
    lastName: patient.last_name,
    birthDate: patient.birth_date,
    alias: patient.alias,
    phone: patient.phone,
    email: patient.email,
    contactPreference: patient.contact_preference,
    consentDataProcessing: patient.consent_data_processing,
    consentReminders: patient.consent_reminders,
    legalRepresentative: patient.legal_representative,
    reasonForConsultation: patient.reason_for_consultation,
    currentRisk: patient.current_risk,
    allergies: patient.allergies,
    assignedProfessional: patient.assigned_professional,
    registrationDate: patient.registration_date,
    referralSource: patient.referral_source,
  }));
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  const professionalId = await getProfessionalId();

  const { data, error } = await supabaseAdmin
    .from('patients')
    .select('*')
    .eq('id', id)
    .eq('professional_id', professionalId)
    .single();

  if (error) throw error;
  if (!data) return undefined;

  return {
    id: data.id,
    name: data.name,
    lastName: data.last_name,
    birthDate: data.birth_date,
    alias: data.alias,
    phone: data.phone,
    email: data.email,
    contactPreference: data.contact_preference,
    consentDataProcessing: data.consent_data_processing,
    consentReminders: data.consent_reminders,
    legalRepresentative: data.legal_representative,
    reasonForConsultation: data.reason_for_consultation,
    currentRisk: data.current_risk,
    allergies: data.allergies,
    assignedProfessional: data.assigned_professional,
    registrationDate: data.registration_date,
    referralSource: data.referral_source,
  };
}

export async function savePatient(patientData: Patient): Promise<Patient> {
  const professionalId = await getProfessionalId();

  // Verificar límites del plan
  const { data: professional } = await supabaseAdmin
    .from('professionals')
    .select('max_patients')
    .eq('id', professionalId)
    .single();

  const { data: existingPatients } = await supabaseAdmin
    .from('patients')
    .select('id')
    .eq('professional_id', professionalId)
    .eq('is_active', true);

  const patientsCount = existingPatients?.length || 0;

  if (professional?.max_patients !== null && patientsCount >= professional!.max_patients) {
    throw new Error('Has alcanzado el límite de pacientes de tu plan');
  }

  // Convertir al formato de base de datos
  const dbPatient = {
    id: patientData.id,
    professional_id: professionalId,
    name: patientData.name,
    last_name: patientData.lastName,
    birth_date: patientData.birthDate,
    alias: patientData.alias,
    phone: patientData.phone,
    email: patientData.email,
    contact_preference: patientData.contactPreference,
    consent_data_processing: patientData.consentDataProcessing,
    consent_reminders: patientData.consentReminders,
    legal_representative: patientData.legalRepresentative,
    reason_for_consultation: patientData.reasonForConsultation,
    current_risk: patientData.currentRisk,
    allergies: patientData.allergies,
    assigned_professional: patientData.assignedProfessional,
    registration_date: patientData.registrationDate,
    referral_source: patientData.referralSource,
  };

  // Verificar si existe para update o insert
  const { data: existing } = await supabaseAdmin
    .from('patients')
    .select('id')
    .eq('id', patientData.id)
    .eq('professional_id', professionalId)
    .single();

  let data, error;

  if (existing) {
    // Update
    const result = await supabaseAdmin
      .from('patients')
      .update(dbPatient)
      .eq('id', patientData.id)
      .eq('professional_id', professionalId)
      .select()
      .single();
    data = result.data;
    error = result.error;
  } else {
    // Insert
    const result = await supabaseAdmin
      .from('patients')
      .insert(dbPatient)
      .select()
      .single();
    data = result.data;
    error = result.error;
  }

  if (error) throw error;

  revalidatePath('/patients');
  revalidatePath('/sessions/new');

  // Convertir de vuelta al formato de la app
  return {
    id: data.id,
    name: data.name,
    lastName: data.last_name,
    birthDate: data.birth_date,
    alias: data.alias,
    phone: data.phone,
    email: data.email,
    contactPreference: data.contact_preference,
    consentDataProcessing: data.consent_data_processing,
    consentReminders: data.consent_reminders,
    legalRepresentative: data.legal_representative,
    reasonForConsultation: data.reason_for_consultation,
    currentRisk: data.current_risk,
    allergies: data.allergies,
    assignedProfessional: data.assigned_professional,
    registrationDate: data.registration_date,
    referralSource: data.referral_source,
  };
}
