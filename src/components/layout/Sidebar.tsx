/**
 * @module Sidebar
 * @description Responsive application navigation grouped by product area.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { ChevronDown, ChevronLeft, LayoutGrid, Lock, X } from 'lucide-react';
import { NAV_CATEGORIES, NAV_ITEMS, SHOW_PREGNANCY_UI } from '@/config/constants';
import { SPREADSHEET_NAV_ITEM } from '@/config/spreadsheet-navigation';
import { useIsMobile } from '@/hooks';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';

type IconName = keyof typeof Icons;
const NAVIGATION_ITEMS = [...NAV_ITEMS, SPREADSHEET_NAV_ITEM];

function getIcon(name: string) {
  const Icon = Icons[name as IconName] as React.ComponentType<{ className?: string }>;
  return Icon || Icons.Circle;
}

export function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { sidebarOpen, setSidebarOpen, mobileMenuOpen, setMobileMenuOpen } = useAppStore();
  const { isAuthenticated, user } = useAuthStore();
  const [expandedItems, setExpandedItems] = useState<string[]>(['calendar']);

  const isOpen = isMobile ? mobileMenuOpen : sidebarOpen;
  const close = () => (isMobile ? setMobileMenuOpen(false) : setSidebarOpen(false));
  const visibleNavItems = NAVIGATION_ITEMS.filter((item) => {
    if (item.pregnancyUiOnly && !SHOW_PREGNANCY_UI) return false;
    if (item.isAdminOnly && user?.role !== 'Administrator') return false;
    return true;
  });
  const groups = NAV_CATEGORIES.map((category) => ({
    ...category,
    items: visibleNavItems.filter((item) => item.category === category.id),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.button
            type="button"
            aria-label="Close navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-[2px] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        className="fixed inset-y-0 left-0 z-50 flex w-[252px] flex-col border-r border-line bg-elevated"
      >
        <div className="flex h-[72px] items-center justify-between border-b border-line px-5">
          <Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => isMobile && close()}>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-white shadow-sm">
              <LayoutGrid className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-lg font-bold text-foreground">Useful Tools</span>
              <span className="block text-[11px] font-semibold text-primary-500">Warm Family OS</span>
            </span>
          </Link>
          <button type="button" onClick={close} className="btn-icon" aria-label="Collapse navigation">
            {isMobile ? <X className="size-5" /> : <ChevronLeft className="size-5" />}
          </button>
        </div>

        <nav className="scrollbar-hide flex-1 overflow-y-auto px-3 py-5" aria-label="Primary navigation">
          {groups.map((group, index) => (
            <section key={group.id} className={cn(index > 0 && 'mt-6')}>
              <h2 className="mb-2 px-3 text-[11px] font-semibold uppercase text-muted">
                {group.labelKey ? t(group.labelKey) : group.label}
              </h2>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = getIcon(item.icon);
                  const hasChildren = Boolean(item.children?.length);
                  const isChildActive = item.children?.some((child) => pathname === child.path) ?? false;
                  const isActive = pathname === item.path || isChildActive;
                  const isProtected = item.protected && !isAuthenticated;
                  const isExpanded = expandedItems.includes(item.id);

                  return (
                    <li key={item.id}>
                      <div className="flex items-center gap-1">
                        <Link
                          href={isProtected ? `/auth?redirect=${item.path}` : item.path}
                          onClick={() => isMobile && close()}
                          className={cn(
                            'flex min-h-11 flex-1 items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                            isActive
                              ? 'bg-accent-50 font-semibold text-accent-600'
                              : 'text-foreground hover:bg-surface'
                          )}
                        >
                          <Icon className={cn('size-5 shrink-0', isActive ? 'text-accent-500' : 'text-muted')} />
                          <span className="truncate">{item.labelKey ? t(item.labelKey) : item.label}</span>
                          {isProtected && !hasChildren && <Lock className="ml-auto size-3.5 text-muted" />}
                        </Link>
                        {hasChildren && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedItems((current) =>
                                current.includes(item.id)
                                  ? current.filter((id) => id !== item.id)
                                  : [...current, item.id]
                              )
                            }
                            className="btn-icon size-9"
                            aria-label={`Toggle ${item.label}`}
                            aria-expanded={isExpanded}
                          >
                            <ChevronDown className={cn('size-4 transition-transform', isExpanded && 'rotate-180')} />
                          </button>
                        )}
                      </div>

                      {hasChildren && isExpanded && (
                        <ul className="ml-5 mt-1 space-y-1 border-l border-line pl-3">
                          {item.children!.map((child) => {
                            const ChildIcon = getIcon(child.icon);
                            const childProtected = child.protected && !isAuthenticated;
                            const childActive = pathname === child.path;
                            return (
                              <li key={child.id}>
                                <Link
                                  href={childProtected ? `/auth?redirect=${child.path}` : child.path}
                                  onClick={() => isMobile && close()}
                                  className={cn(
                                    'flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                                    childActive
                                      ? 'bg-accent-50 font-semibold text-accent-600'
                                      : 'text-muted hover:bg-surface hover:text-foreground'
                                  )}
                                >
                                  <ChildIcon className="size-4" />
                                  <span className="truncate">{child.labelKey ? t(child.labelKey) : child.label}</span>
                                  {childProtected && <Lock className="ml-auto size-3 text-muted" />}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <Link href="/settings" className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-foreground hover:bg-surface">
            <Icons.Settings className="size-5 text-muted" />
            {t('common.settings')}
          </Link>
        </div>
      </motion.aside>
    </>
  );
}
