import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ exists: false });
    }

    const { data } = await supabaseAdmin
      .from('professionals')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    return NextResponse.json({ exists: !!data });
  } catch (error) {
    return NextResponse.json({ exists: false });
  }
}
