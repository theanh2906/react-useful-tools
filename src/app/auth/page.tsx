'use client';

import { GuestRoute } from '@/components/auth/GuestRoute';
import { Suspense } from 'react';
import { AuthPage } from '@/views/Auth';

function AuthContent() {
  return (
    <GuestRoute>
      <AuthPage />
    </GuestRoute>
  );
}

export default function AuthPageRoute() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  );
}
