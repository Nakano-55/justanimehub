import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req: request, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if user is authenticated
  if (!session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return res;
}



export const config = {
  matcher: ['/admin/:path*']
};