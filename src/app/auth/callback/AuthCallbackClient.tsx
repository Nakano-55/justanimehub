'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { Database } from '@/lib/database.types';

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const code = searchParams.get('code');
        const type = searchParams.get('type');

        if (!code) throw new Error('No verification code provided');

        if (type === 'signup' || type === 'recovery') {
          const { error } = await supabase.auth.verifyOtp({ type, token_hash: code });
          if (error) throw error;
        } else {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        setStatus('success');
        setTimeout(() => {
          const lang = window.location.pathname.includes('/id') ? 'id' : 'en';
          router.push(`/${lang}`);
        }, 2000);
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    };

    verifyEmail();
  }, [searchParams, router, supabase.auth]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
            <p className="text-lg">Verifying your email...</p>
            <p className="text-sm text-neutral-400">Please wait a moment</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="text-lg">Email verified successfully!</p>
            <p className="text-sm text-neutral-400">Redirecting to home page...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-500" />
            <p className="text-lg">Verification failed</p>
            <p className="text-sm text-red-400">{errorMessage}</p>
          </>
        )}
      </div>
    </div>
  );
}
