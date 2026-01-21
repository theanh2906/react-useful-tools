import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ThemeMode, PregnancyInfo } from '@/types';
import { differenceInDays, addDays } from 'date-fns';
import { PREGNANCY_WEEKS, DAYS_PER_WEEK, TRIMESTER_RANGES } from '@/config/constants';
import { listenProfile, saveProfile } from '@/services/profileService';

interface AppState {
  // Theme
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  // Language
  language: 'en' | 'vi';
  setLanguage: (lang: 'en' | 'vi') => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Mobile menu
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Pregnancy info
  conceptionDate: string | null;
  setConceptionDate: (date: string) => void;
  getPregnancyInfo: () => PregnancyInfo | null;

  // Baby birth date (for Peanut)
  babyBirthDate: string | null;
  setBabyBirthDate: (date: string) => void;
  getBabyAge: () => { days: number; weeks: number; months: number } | null;

  // Profile sync
  initProfileListener: () => Promise<() => void>;
  saveProfile: () => Promise<void>;

  // Global loading
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      // Language
      language: 'en',
      setLanguage: (language) => set({ language }),

      // Sidebar
      sidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Mobile menu
      mobileMenuOpen: false,
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),

      // Pregnancy info
      conceptionDate: null,
      setConceptionDate: (conceptionDate) => set({ conceptionDate }),
      getPregnancyInfo: () => {
        const { conceptionDate } = get();
        if (!conceptionDate) return null;

        const conception = new Date(conceptionDate);
        const today = new Date();
        const dueDate = addDays(conception, PREGNANCY_WEEKS * DAYS_PER_WEEK);
        
        const daysSinceConception = differenceInDays(today, conception);
        const currentWeek = Math.floor(daysSinceConception / DAYS_PER_WEEK) + 1;
        const currentDay = (daysSinceConception % DAYS_PER_WEEK) + 1;
        const daysRemaining = differenceInDays(dueDate, today);
        const progress = Math.min(100, Math.max(0, (daysSinceConception / (PREGNANCY_WEEKS * DAYS_PER_WEEK)) * 100));

        let trimester: 1 | 2 | 3 = 1;
        if (currentWeek >= TRIMESTER_RANGES.third.start) {
          trimester = 3;
        } else if (currentWeek >= TRIMESTER_RANGES.second.start) {
          trimester = 2;
        }

        return {
          conceptionDate: conception,
          dueDate,
          currentWeek: Math.max(1, Math.min(PREGNANCY_WEEKS, currentWeek)),
          currentDay,
          daysRemaining: Math.max(0, daysRemaining),
          trimester,
          progress
        };
      },

      // Baby birth date
      babyBirthDate: null,
      setBabyBirthDate: (babyBirthDate) => set({ babyBirthDate }),
      getBabyAge: () => {
        const { babyBirthDate } = get();
        if (!babyBirthDate) return null;

        const birthDate = new Date(babyBirthDate);
        const today = new Date();
        const days = differenceInDays(today, birthDate);
        
        return {
          days,
          weeks: Math.floor(days / 7),
          months: Math.floor(days / 30)
        };
      },

      // Global loading
      isGlobalLoading: false,
      setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),

      initProfileListener: async () => {
        const unsubscribe = await listenProfile((profile) => {
          if (!profile) return;
          set({
            conceptionDate: profile.conceptionDate || null,
            babyBirthDate: profile.babyBirthDate || null,
          });
        });
        return unsubscribe;
      },

      saveProfile: async () => {
        const { conceptionDate, babyBirthDate } = get();
        await saveProfile({
          conceptionDate: conceptionDate || undefined,
          babyBirthDate: babyBirthDate || undefined,
        });
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        conceptionDate: state.conceptionDate,
        babyBirthDate: state.babyBirthDate,
      }),
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
