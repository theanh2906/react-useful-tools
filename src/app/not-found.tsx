'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex items-center gap-3 rounded-lg border border-line bg-elevated px-5 py-4 text-foreground shadow-sm">
        <Loader2 className="size-5 animate-spin text-accent-600" aria-hidden="true" />
        <p className="text-sm font-medium">Returning to Useful Tools...</p>
      </div>
    </main>
  );
}
