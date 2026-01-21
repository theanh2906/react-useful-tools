import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { NAV_ITEMS, NAV_CATEGORIES } from '@/config/constants';
import { useIsMobile } from '@/hooks';
import * as Icons from 'lucide-react';
import { X, ChevronLeft, Sparkles } from 'lucide-react';

type IconName = keyof typeof Icons;

function getIcon(name: string) {
  const Icon = Icons[name as IconName] as React.ComponentType<{ className?: string }>;
  return Icon || Icons.Circle;
}

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { sidebarOpen, setSidebarOpen, mobileMenuOpen, setMobileMenuOpen } = useAppStore();
  const { isAuthenticated } = useAuthStore();

  const isOpen = isMobile ? mobileMenuOpen : sidebarOpen;
  const setIsOpen = isMobile ? setMobileMenuOpen : setSidebarOpen;

  const sidebarVariants = {
    open: { 
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    closed: { 
      x: isMobile ? '-100%' : '-100%',
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
  };

  const groupedItems = NAV_CATEGORIES.map(category => ({
    ...category,
    items: NAV_ITEMS.filter(item => item.category === category.id)
  })).filter(group => group.items.length > 0);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-72 bg-slate-900/95 backdrop-blur-xl border-r border-white/5',
          'flex flex-col',
          isMobile ? 'shadow-2xl' : ''
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3" onClick={() => isMobile && setMobileMenuOpen(false)}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-lg">Useful Tools</h1>
              <p className="text-xs text-slate-500">Pregnancy & Productivity</p>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMobile ? <X className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
          {groupedItems.map((group, groupIndex) => (
            <div key={group.id} className={cn(groupIndex > 0 && 'mt-6')}>
              <h3 className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {group.labelKey ? t(group.labelKey) : group.label}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = getIcon(item.icon);
                  const isActive = location.pathname === item.path;
                  const isProtected = item.protected && !isAuthenticated;

                  return (
                    <li key={item.id}>
                      <Link
                        to={isProtected ? `/auth?redirect=${item.path}` : item.path}
                        onClick={() => isMobile && setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                          isActive
                            ? 'bg-gradient-to-r from-primary-500/20 to-transparent text-white border-l-2 border-primary-500'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                      >
                        <Icon className={cn(
                          'w-5 h-5 transition-colors',
                          isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'
                        )} />
                        <span className="font-medium">
                          {item.labelKey ? t(item.labelKey) : item.label}
                        </span>
                        {isProtected && (
                          <Icons.Lock className="w-3.5 h-3.5 ml-auto text-slate-600" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-pink-400 flex items-center justify-center">
                <Icons.Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Made with love</p>
                <p className="text-xs text-slate-400">For growing families</p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Toggle Button (Desktop) */}
      {!isMobile && !sidebarOpen && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 p-3 bg-slate-800/90 backdrop-blur-sm border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/90 transition-all"
        >
          <Icons.Menu className="w-5 h-5" />
        </motion.button>
      )}
    </>
  );
}
