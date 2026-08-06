/**
 * @module Layout
 * @description Shared application shell for authenticated and public tool routes.
 */
'use client';

import { useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useIsMobile } from '@/hooks';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';

export function Layout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, theme } = useAppStore();
  const isMobile = useIsMobile();

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const useDark = theme === 'dark' || (theme === 'system' && prefersDark);
    document.documentElement.classList.toggle('dark', useDark);
  }, [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div
        className={cn(
          'min-h-screen transition-[margin] duration-200',
          sidebarOpen && !isMobile && 'lg:ml-[252px]'
        )}
      >
        <Header />
        <main className="min-h-[calc(100vh-72px)]">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
