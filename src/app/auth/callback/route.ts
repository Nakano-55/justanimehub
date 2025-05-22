 
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/lib/database.types';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}?error=Missing%20code`);
  }

  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;

    // Get the user data after successful authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not found after authentication');

    // Create or update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email ?? '',
        username: user.user_metadata?.username || null,
        full_name: user.user_metadata?.full_name || null,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('Profile sync error:', profileError);
    }

    return NextResponse.redirect(origin);
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(`${origin}?error=Authentication%20failed`);
  }
}