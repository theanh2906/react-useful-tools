/**
 * @module LanguageSwitcher
 * @description Dropdown component for switching the application language (i18n).
 */
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { languages } from '@/i18n';
import { useAppStore } from '@/stores/appStore';

/**
 * Language switcher dropdown that lets the user pick from the available locales.
 * Closes on outside click. Uses `react-i18next` to persist the selection.
 */

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const setLanguage = useAppStore((state) => state.setLanguage);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage =
    languages.find((l) => l.code === i18n.language) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLanguageChange = (code: 'en' | 'vi') => {
    i18n.changeLanguage(code);
    setLanguage(code);
    document.documentElement.lang = code;
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-10 items-center gap-2 rounded-md border border-line bg-elevated px-3 py-2 transition-colors hover:bg-surface"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe className="h-4 w-4 text-muted" />
        <span className="text-sm font-semibold text-foreground">
          {currentLanguage.code.toUpperCase()}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-line bg-elevated py-2 shadow-xl"
          >
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-foreground transition-colors hover:bg-surface ${
                  i18n.language === language.code ? 'bg-accent-50' : ''
                }`}
              >
                <span className="w-7 text-xs font-bold text-accent-600">
                  {language.code.toUpperCase()}
                </span>
                <span className="flex-1 text-left text-sm">
                  {language.name}
                </span>
                {i18n.language === language.code && (
                  <Check className="h-4 w-4 text-emerald-600" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
