import { listenValue, setValue, fetchValue } from './realtimeDb';

export interface DashboardLayoutItem {
  id: string;
  visible: boolean;
  order: number;
}

export interface UserSettings {
  theme?: 'light' | 'dark';
  language?: 'en' | 'vi';
  dashboardLayout?: DashboardLayoutItem[];
}

const SETTINGS_PATH = 'settings';

export const listenSettings = async (
  onChange: (settings: UserSettings | null) => void
) => {
  return listenValue<UserSettings>(SETTINGS_PATH, onChange);
};

export const fetchSettings = async () => {
  return fetchValue<UserSettings>(SETTINGS_PATH);
};

export const saveSettings = async (settings: Partial<UserSettings>) => {
  return setValue(SETTINGS_PATH, settings);
};
