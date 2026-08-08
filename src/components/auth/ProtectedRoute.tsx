'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace(`/auth?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isInitialized, pathname, router]);

  if (!isInitialized || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
