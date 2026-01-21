import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { languages } from '@/i18n';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 
                 border border-white/10 hover:border-white/20 transition-all"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4 text-white/60" />
        <span className="text-sm">{currentLanguage.flag}</span>
        <span className="text-sm text-white/80 hidden sm:inline">
          {currentLanguage.name}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 py-2 
                     bg-[#1a1a24]/95 backdrop-blur-xl rounded-xl 
                     border border-white/10 shadow-xl z-50"
          >
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5
                  hover:bg-white/10 transition-colors
                  ${i18n.language === language.code ? 'bg-white/5' : ''}
                `}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="flex-1 text-left text-white/80">{language.name}</span>
                {i18n.language === language.code && (
                  <Check className="w-4 h-4 text-emerald-400" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
