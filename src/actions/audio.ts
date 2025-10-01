'use server';

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

async function getProfessionalData() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const { data, error } = await supabaseAdmin
    .from('professionals')
    .select('id, clerk_user_id, current_storage_mb, max_storage_mb')
    .eq('clerk_user_id', userId)
    .single();

  if (error || !data) throw new Error('Professional not found');
  return data;
}

/**
 * Sube un archivo de audio a Supabase Storage
 * Retorna la URL pública del archivo
 */
export async function uploadAudioFile(
  file: File,
  sessionId: string
): Promise<{ url: string; storagePath: string; fileSizeMB: number }> {
  const professional = await getProfessionalData();

  // Calcular tamaño del archivo en MB
  const fileSizeMB = file.size / (1024 * 1024);

  // Verificar límite de storage
  const newStorageTotal = professional.current_storage_mb + fileSizeMB;
  if (newStorageTotal > professional.max_storage_mb) {
    throw new Error(
      `No tienes suficiente espacio de almacenamiento. Usados: ${professional.current_storage_mb.toFixed(2)}MB / ${professional.max_storage_mb}MB`
    );
  }

  // Crear cliente Supabase con autenticación del usuario
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Generar path único: clerk_user_id/session_id/filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const storagePath = `${professional.clerk_user_id}/${sessionId}/${fileName}`;

  // Convertir File a Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload a Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('session-audio')
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error(`Error al subir el archivo: ${uploadError.message}`);
  }

  // Actualizar storage usado del profesional
  const { error: updateError } = await supabaseAdmin
    .from('professionals')
    .update({
      current_storage_mb: newStorageTotal,
    })
    .eq('id', professional.id);

  if (updateError) {
    console.error('Error updating storage:', updateError);
    // No lanzamos error aquí porque el archivo ya se subió
  }

  // Obtener URL pública firmada (válida por 1 año)
  const { data: urlData } = await supabase.storage
    .from('session-audio')
    .createSignedUrl(storagePath, 31536000); // 1 año en segundos

  if (!urlData?.signedUrl) {
    throw new Error('Error al generar URL del archivo');
  }

  return {
    url: urlData.signedUrl,
    storagePath,
    fileSizeMB,
  };
}

/**
 * Elimina un archivo de audio de Supabase Storage
 */
export async function deleteAudioFile(
  storagePath: string,
  fileSizeMB: number
): Promise<void> {
  const professional = await getProfessionalData();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Eliminar archivo de Storage
  const { error: deleteError } = await supabase.storage
    .from('session-audio')
    .remove([storagePath]);

  if (deleteError) {
    console.error('Delete error:', deleteError);
    throw new Error(`Error al eliminar el archivo: ${deleteError.message}`);
  }

  // Actualizar storage usado del profesional
  const newStorageTotal = Math.max(0, professional.current_storage_mb - fileSizeMB);

  const { error: updateError } = await supabaseAdmin
    .from('professionals')
    .update({
      current_storage_mb: newStorageTotal,
    })
    .eq('id', professional.id);

  if (updateError) {
    console.error('Error updating storage:', updateError);
  }
}

/**
 * Obtiene una URL firmada renovada para un archivo existente
 */
export async function getSignedAudioUrl(storagePath: string): Promise<string> {
  await getProfessionalData(); // Verifica autenticación

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase.storage
    .from('session-audio')
    .createSignedUrl(storagePath, 31536000); // 1 año

  if (error || !data?.signedUrl) {
    throw new Error('Error al generar URL del archivo');
  }

  return data.signedUrl;
}

/**
 * Verifica si el usuario tiene espacio suficiente para subir un archivo
 */
export async function checkStorageAvailable(fileSizeMB: number): Promise<{
  canUpload: boolean;
  currentMB: number;
  maxMB: number;
  availableMB: number;
}> {
  const professional = await getProfessionalData();

  const availableMB = professional.max_storage_mb - professional.current_storage_mb;
  const canUpload = availableMB >= fileSizeMB;

  return {
    canUpload,
    currentMB: professional.current_storage_mb,
    maxMB: professional.max_storage_mb,
    availableMB,
  };
}
