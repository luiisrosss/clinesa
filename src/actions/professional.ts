'use server';

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function getProfessionalProfile() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const { data, error } = await supabaseAdmin
    .from('professionals')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function checkPlanLimits() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const { data: prof } = await supabaseAdmin
    .from('professionals')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!prof) throw new Error('Professional not found');

  // Como aún no tenemos la función RPC creada en Supabase,
  // vamos a calcular manualmente por ahora
  const { data: professional } = await supabaseAdmin
    .from('professionals')
    .select('*')
    .eq('id', prof.id)
    .single();

  const { data: patients } = await supabaseAdmin
    .from('patients')
    .select('id')
    .eq('professional_id', prof.id)
    .eq('is_active', true);

  const patientsCount = patients?.length || 0;

  return {
    can_create_patient: professional!.max_patients === null || patientsCount < professional!.max_patients,
    can_upload_audio: professional!.current_storage_mb < professional!.max_storage_mb,
    patients_count: patientsCount,
    patients_limit: professional!.max_patients,
    storage_used_mb: professional!.current_storage_mb,
    storage_limit_mb: professional!.max_storage_mb,
    credits_remaining: professional!.credits_balance,
  };
}
