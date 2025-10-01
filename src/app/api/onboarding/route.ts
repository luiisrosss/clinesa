import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin, validateSupabaseConfig } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    validateSupabaseConfig();

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    // Verificar si ya existe
    const { data: existing } = await supabaseAdmin
      .from('professionals')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Profile already exists', professional: existing });
    }

    // Obtener email de Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 400 });
    }

    // Crear profesional con trial
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const { data: professional, error } = await supabaseAdmin
      .from('professionals')
      .insert({
        clerk_user_id: userId,
        email,
        name,
        subscription_plan: 'trial',
        credits_balance: 100,
        max_patients: 3,
        max_storage_mb: 50,
        trial_started_at: new Date().toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
        is_trial_active: true,
        subscription_status: 'trialing',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({ professional });
  } catch (error: any) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
