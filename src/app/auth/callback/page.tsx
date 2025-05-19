import { Suspense } from 'react';
import AuthCallbackClient from './AuthCallbackClient';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="text-white">Verifying...</div>}>
      <AuthCallbackClient />
    </Suspense>
  );
}