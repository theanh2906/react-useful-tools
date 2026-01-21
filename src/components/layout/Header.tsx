import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Bell, User, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { useIsMobile } from '@/hooks';
import { useState } from 'react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function Header() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { sidebarOpen, setSidebarOpen, setMobileMenuOpen, theme, setTheme } = useAppStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleMenu = () => {
    if (isMobile) {
      setMobileMenuOpen(true);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-slate-900/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMenu}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
        </button>

        {/* User Menu */}
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1.5 pr-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium text-white">
                {user?.displayName || user?.email?.split('@')[0]}
              </span>
            </button>

            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden"
              >
                <div className="p-3 border-b border-white/5">
                  <p className="text-sm font-medium text-white">{user?.displayName || 'User'}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <div className="p-1">
                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    {t('common.settings')}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('common.logout')}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <Link
            to="/auth"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-primary-500/25 transition-all"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{t('common.login')}</span>
          </Link>
        )}
      </div>
    </header>
  );
}
