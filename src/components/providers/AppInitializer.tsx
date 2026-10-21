'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSpreadsheetStore } from '@/stores/spreadsheet-store';
import { GlobalLoading } from '@/components/ui';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const [storesHydrated, setStoresHydrated] = useState(false);
  const {
    checkTokenExpiration,
    initAuthListener,
    isLoading: authLoading,
  } = useAuthStore();
  const { initProfileListener, isGlobalLoading } = useAppStore();
  const { initSettingsListener } = useSettingsStore();
  const userId = useAuthStore((state) => state.user?.id);
  const authInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    Promise.all([
      useAuthStore.persist.rehydrate(),
      useAppStore.persist.rehydrate(),
      useSettingsStore.persist.rehydrate(),
      useSpreadsheetStore.persist.rehydrate(),
    ]).finally(() => setStoresHydrated(true));
  }, []);

  useEffect(() => {
    if (!storesHydrated) return;
    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, [checkTokenExpiration, storesHydrated]);

  useEffect(() => {
    if (!storesHydrated) return;
    const unsubscribeAuth = initAuthListener();
    return () => {
      if (typeof unsubscribeAuth === 'function') unsubscribeAuth();
    };
  }, [initAuthListener, storesHydrated]);

  useEffect(() => {
    if (!storesHydrated || !authInitialized) return;
    let unsubscribeProfile: (() => void) | null = null;
    let unsubscribeSettings: (() => void) | null = null;
    let disposed = false;

    initProfileListener().then((unsub) => {
      if (disposed) unsub();
      else unsubscribeProfile = unsub;
    });

    initSettingsListener().then((unsub) => {
      if (disposed) unsub();
      else unsubscribeSettings = unsub;
    });

    return () => {
      disposed = true;
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, [initProfileListener, initSettingsListener, storesHydrated, authInitialized, userId]);

  return (
    <>
      <GlobalLoading isLoading={isGlobalLoading || authLoading} />
      {children}
    </>
  );
}
