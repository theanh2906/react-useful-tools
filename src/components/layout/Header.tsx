/**
 * @module Header
 * @description Application toolbar with command search and account controls.
 */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NAV_ITEMS, SHOW_PREGNANCY_UI } from '@/config/constants';
import { SPREADSHEET_NAV_ITEM } from '@/config/spreadsheet-navigation';
import { useIsMobile } from '@/hooks';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';

const NAVIGATION_ITEMS = [...NAV_ITEMS, SPREADSHEET_NAV_ITEM];

export function Header() {
  const { t } = useTranslation();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { sidebarOpen, setSidebarOpen, setMobileMenuOpen, theme } = useAppStore();
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return NAVIGATION_ITEMS.filter((item) => {
      if (item.pregnancyUiOnly && !SHOW_PREGNANCY_UI) return false;
      if (item.isAdminOnly && user?.role !== 'Administrator') return false;
      return `${item.label} ${item.id}`.toLowerCase().includes(needle);
    }).slice(0, 6);
  }, [query, user?.role]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'Escape') {
        setShowUserMenu(false);
        setQuery('');
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleNavigation = () => {
    if (isMobile) setMobileMenuOpen(true);
    else setSidebarOpen(!sidebarOpen);
  };

  const navigateToResult = (path: string) => {
    setQuery('');
    router.push(path);
  };

  return (
    <header className="sticky top-0 z-30 flex h-[72px] w-full items-center justify-between border-b border-line bg-elevated/95 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <button type="button" onClick={toggleNavigation} className="btn-icon shrink-0" aria-label="Toggle navigation">
          <Menu className="size-5" />
        </button>

        <div className="relative hidden w-full max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm nhanh công cụ..."
            className="h-10 w-full rounded-md border border-line bg-background pl-10 pr-16 text-sm text-foreground placeholder:text-muted"
            aria-label="Search tools"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-line bg-elevated px-2 py-0.5 text-[11px] font-medium text-muted">
            Ctrl K
          </kbd>
          {query && (
            <div className="absolute left-0 right-0 top-12 overflow-hidden rounded-lg border border-line bg-elevated shadow-xl">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateToResult(item.path)}
                    className="flex w-full items-center px-4 py-3 text-left text-sm text-foreground hover:bg-surface"
                  >
                    {item.labelKey ? t(item.labelKey) : item.label}
                  </button>
                ))
              ) : (
                <p className="px-4 py-3 text-sm text-muted">Không tìm thấy công cụ.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <LanguageSwitcher />
        <button
          type="button"
          onClick={() => void updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' })}
          className="btn-icon"
          aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
        >
          {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>
        <button type="button" className="btn-icon relative" aria-label="Notifications">
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-primary-500 ring-2 ring-elevated" />
        </button>

        {isAuthenticated ? (
          <div ref={accountRef} className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu((open) => !open)}
              className="ml-1 flex min-h-11 items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-surface sm:pr-2"
              aria-expanded={showUserMenu}
            >
              <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-primary-700">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="size-full object-cover" />
                ) : (
                  <User className="size-4" />
                )}
              </span>
              <span className="hidden min-w-0 text-left sm:block">
                <span className="block max-w-32 truncate text-sm font-semibold text-foreground">
                  {user?.displayName || user?.email?.split('@')[0] || 'User'}
                </span>
                <span className="block text-xs text-muted">{user?.role || 'Member'}</span>
              </span>
              <ChevronDown className="hidden size-4 text-muted sm:block" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-line bg-elevated shadow-xl"
                >
                  <div className="border-b border-line px-4 py-3">
                    <p className="truncate text-sm font-semibold text-foreground">{user?.displayName || 'User'}</p>
                    <p className="truncate text-xs text-muted">{user?.email}</p>
                  </div>
                  <div className="p-1.5">
                    <Link href="/settings" onClick={() => setShowUserMenu(false)} className="flex min-h-10 items-center gap-2 rounded-md px-3 text-sm text-foreground hover:bg-surface">
                      <Settings className="size-4 text-muted" />
                      {t('common.settings')}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="size-4" />
                      {t('common.logout')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link href="/auth" className="ml-1 inline-flex min-h-10 items-center gap-2 rounded-md bg-primary-500 px-3 text-sm font-semibold text-white hover:bg-primary-600 sm:px-4">
            <User className="size-4" />
            <span className="hidden sm:inline">{t('common.login')}</span>
          </Link>
        )}
      </div>
    </header>
  );
}
