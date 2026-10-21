import { listenValue, setValue, fetchValue } from './realtimeDb';
import { auth } from '@/config/firebase';
import type { ThemeMode } from '@/types';

export interface DashboardLayoutItem {
  id: string;
  visible: boolean;
  order: number;
}

export interface UserSettings {
  theme?: ThemeMode;
  language?: 'en' | 'vi';
  dashboardLayout?: DashboardLayoutItem[];
}

const SETTINGS_PATH = 'settings';

export const listenSettings = async (
  onChange: (settings: UserSettings | null) => void
) => {
  // Guest preferences belong to this device, never to a shared database path.
  if (!auth.currentUser) {
    onChange(null);
    return () => {};
  }
  return listenValue<UserSettings>(SETTINGS_PATH, onChange);
};

export const fetchSettings = async () => {
  return fetchValue<UserSettings>(SETTINGS_PATH);
};

export const saveSettings = async (settings: Partial<UserSettings>) => {
  if (!auth.currentUser) return;
  return setValue(SETTINGS_PATH, settings);
};
