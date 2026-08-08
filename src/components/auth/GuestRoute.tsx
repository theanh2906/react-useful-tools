'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const redirect =
    redirectParam?.startsWith('/') && !redirectParam.startsWith('//')
      ? redirectParam
      : '/';

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace(redirect);
    }
  }, [isAuthenticated, isInitialized, redirect, router]);

  if (!isInitialized || isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
