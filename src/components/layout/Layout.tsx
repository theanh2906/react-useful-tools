/**
 * @module Layout
 * @description Root application layout with background decorations, sidebar, header and routed content area.
 */
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppStore } from '@/stores/appStore';
import { useEffect } from 'react';
import { useIsMobile } from '@/hooks';
import { cn } from '@/lib/utils';

/**
 * Root layout component that composes the {@link Sidebar}, {@link Header}
 * and a main content area rendered via React Router's `<Outlet />`.
 * Also manages the dark-mode class on `<html>` and renders background decorations.
 */
export function Layout() {
  const { sidebarOpen, theme } = useAppStore();
  const isMobile = useIsMobile();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl animate-pulse-slow animate-delay-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/5 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={cn(
          'min-h-screen transition-all duration-300',
          sidebarOpen && !isMobile ? 'lg:ml-72' : ''
        )}
      >
        <Header />

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8 max-w-7xl">
            <Outlet />
          </div>
        </motion.main>

        {/* Footer */}
        <footer
          className={cn(
            'relative border-t border-white/5 py-6 px-4 lg:px-8',
            sidebarOpen && !isMobile ? '' : ''
          )}
        >
          <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © 2026 Useful Tools. Made with 💜 for growing families.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-slate-500 hover:text-white transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-slate-500 hover:text-white transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-slate-500 hover:text-white transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
