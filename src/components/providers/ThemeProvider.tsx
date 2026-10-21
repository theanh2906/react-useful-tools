'use client';

import { useEffect } from 'react';
import { applyTheme } from '@/config/themes';
import { useAppStore } from '@/stores/appStore';

/** Apply themes on every route, including auth and public sharing pages. */
export function ThemeProvider() {
  useEffect(() => {
    const syncTheme = () => {
      if (useAppStore.persist.hasHydrated()) applyTheme(useAppStore.getState().theme);
    };
    const unsubscribe = useAppStore.subscribe((state, previous) => {
      if (state.theme !== previous.theme) syncTheme();
    });
    const unsubscribeHydration = useAppStore.persist.onFinishHydration(syncTheme);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (useAppStore.getState().theme === 'system') syncTheme();
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'app-storage' || event.key === null) {
        void useAppStore.persist.rehydrate();
      }
    };
    syncTheme();
    media.addEventListener('change', handleSystemChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      unsubscribe();
      unsubscribeHydration();
      media.removeEventListener('change', handleSystemChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return null;
}
