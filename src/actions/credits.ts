'use server';

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

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

/**
 * Obtiene el balance de créditos actual del profesional
 */
export async function getProfessionalCredits(): Promise<{
  balance: number;
  plan: string;
  totalPurchased: number;
}> {
  const professionalId = await getProfessionalId();

  const { data, error } = await supabaseAdmin
    .from('professionals')
    .select('credits_balance, subscription_plan, credits_total_purchased')
    .eq('id', professionalId)
    .single();

  if (error) throw error;

  return {
    balance: data.credits_balance,
    plan: data.subscription_plan,
    totalPurchased: data.credits_total_purchased,
  };
}

/**
 * Calcula los créditos necesarios para procesar audio
 * Fórmula: ~1.3 créditos por minuto
 */
export async function calculateCreditsForAudio(durationMinutes: number): Promise<number> {
  const { data, error } = await supabaseAdmin
    .rpc('calculate_credits_for_audio', { duration_minutes: durationMinutes });

  if (error) throw error;
  return data as number;
}

/**
 * Verifica si el profesional tiene créditos suficientes
 */
export async function hasEnoughCredits(requiredCredits: number): Promise<boolean> {
  const professionalId = await getProfessionalId();

  const { data, error } = await supabaseAdmin
    .rpc('has_enough_credits', {
      prof_id: professionalId,
      required_credits: requiredCredits
    });

  if (error) throw error;
  return data as boolean;
}

/**
 * Consume créditos y registra la transacción
 * Retorna true si se consumieron exitosamente, false si no había suficientes
 */
export async function consumeCredits(
  sessionId: string,
  amount: number,
  description: string
): Promise<boolean> {
  const professionalId = await getProfessionalId();

  const { data, error } = await supabaseAdmin
    .rpc('consume_credits', {
      prof_id: professionalId,
      amount: amount,
      session_id: sessionId,
      description: description,
    });

  if (error) {
    console.error('Error consuming credits:', error);
    throw error;
  }

  // Actualizar el campo credits_consumed en la sesión
  await supabaseAdmin
    .from('sessions')
    .update({ credits_consumed: amount })
    .eq('id', sessionId)
    .eq('professional_id', professionalId);

  revalidatePath('/dashboard');
  revalidatePath('/credits');
  revalidatePath(`/sessions/${sessionId}`);

  return data as boolean;
}

/**
 * Agrega créditos al profesional (compras, renovaciones, etc.)
 */
export async function addCredits(
  amount: number,
  transactionType: 'purchase' | 'subscription_renewal' | 'bonus' | 'refund',
  description: string,
  stripePaymentIntentId?: string
): Promise<number> {
  const professionalId = await getProfessionalId();

  const { data, error } = await supabaseAdmin
    .rpc('add_credits', {
      prof_id: professionalId,
      amount: amount,
      transaction_type: transactionType,
      description: description,
      stripe_payment_intent_id: stripePaymentIntentId,
    });

  if (error) {
    console.error('Error adding credits:', error);
    throw error;
  }

  revalidatePath('/dashboard');
  revalidatePath('/credits');

  return data as number;
}

/**
 * Obtiene el historial de transacciones de créditos
 */
export async function getCreditTransactions(limit: number = 50): Promise<any[]> {
  const professionalId = await getProfessionalId();

  const { data, error } = await supabaseAdmin
    .from('credit_transactions')
    .select('*')
    .eq('professional_id', professionalId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((tx: any) => ({
    id: tx.id,
    amount: tx.amount,
    balanceAfter: tx.balance_after,
    transactionType: tx.transaction_type,
    sessionId: tx.session_id,
    description: tx.description,
    createdAt: tx.created_at,
    stripePaymentIntentId: tx.stripe_payment_intent_id,
  }));
}

/**
 * Obtiene estadísticas de uso de créditos
 */
export async function getCreditStats(): Promise<{
  totalConsumed: number;
  totalAdded: number;
  transactionsCount: number;
  lastTransactionDate: string | null;
}> {
  const professionalId = await getProfessionalId();

  const { data, error } = await supabaseAdmin
    .from('credit_transactions')
    .select('amount, created_at')
    .eq('professional_id', professionalId);

  if (error) throw error;

  if (!data || data.length === 0) {
    return {
      totalConsumed: 0,
      totalAdded: 0,
      transactionsCount: 0,
      lastTransactionDate: null,
    };
  }

  const totalConsumed = data
    .filter((tx: any) => tx.amount < 0)
    .reduce((sum: number, tx: any) => sum + Math.abs(tx.amount), 0);

  const totalAdded = data
    .filter((tx: any) => tx.amount > 0)
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);

  const lastTransaction = data.sort((a: any, b: any) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];

  return {
    totalConsumed,
    totalAdded,
    transactionsCount: data.length,
    lastTransactionDate: lastTransaction?.created_at || null,
  };
}
