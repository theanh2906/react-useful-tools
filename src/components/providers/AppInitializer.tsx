'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { GlobalLoading } from '@/components/ui';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const {
    checkTokenExpiration,
    initAuthListener,
    isLoading: authLoading,
  } = useAuthStore();
  const { initProfileListener, isGlobalLoading } = useAppStore();
  const { initSettingsListener } = useSettingsStore();
  const userId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, [checkTokenExpiration]);

  useEffect(() => {
    const unsubscribeAuth = initAuthListener();
    return () => {
      if (typeof unsubscribeAuth === 'function') unsubscribeAuth();
    };
  }, [initAuthListener]);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    let unsubscribeSettings: (() => void) | null = null;

    initProfileListener().then((unsub) => {
      unsubscribeProfile = unsub;
    });

    initSettingsListener().then((unsub) => {
      unsubscribeSettings = unsub;
    });

    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, [initProfileListener, initSettingsListener, userId]);

  return (
    <>
      <GlobalLoading isLoading={isGlobalLoading || authLoading} />
      {children}
    </>
  );
}
