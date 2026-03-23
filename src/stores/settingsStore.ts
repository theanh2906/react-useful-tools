import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { listenSettings, saveSettings, UserSettings, DashboardLayoutItem } from '@/services/settingsService';
import { useAppStore } from './appStore';

export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayoutItem[] = [
  { id: 'quick-setup', visible: true, order: 0 },
  { id: 'stats-grid', visible: true, order: 1 },
  { id: 'quick-actions', visible: true, order: 2 },
  { id: 'baby-age', visible: true, order: 3 },
  { id: 'recent-activity', visible: true, order: 4 },
  { id: 'todays-tip', visible: true, order: 5 },
];

interface SettingsState {
  settings: UserSettings;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  initSettingsListener: () => Promise<() => void>;
  importSettings: (importedSettings: UserSettings) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: {
        dashboardLayout: DEFAULT_DASHBOARD_LAYOUT,
      },
      isLoading: false,

      updateSettings: async (newSettings) => {
        const currentSettings = get().settings;
        const updatedSettings = { ...currentSettings, ...newSettings };
        set({ settings: updatedSettings });
        await saveSettings(updatedSettings);

        // Sync with appStore if theme or language changed
        if (newSettings.theme) {
          useAppStore.getState().setTheme(newSettings.theme);
        }
        if (newSettings.language) {
          useAppStore.getState().setLanguage(newSettings.language);
        }
      },

      initSettingsListener: async () => {
        set({ isLoading: true });
        const unsubscribe = await listenSettings((dbSettings) => {
          if (dbSettings) {
            const currentSettings = get().settings;
            const updatedSettings = { ...currentSettings, ...dbSettings };
            
            // Ensure layout has all default items if some are missing
            if (updatedSettings.dashboardLayout) {
              const layoutIds = new Set(updatedSettings.dashboardLayout.map(i => i.id));
              const missingItems = DEFAULT_DASHBOARD_LAYOUT.filter(i => !layoutIds.has(i.id));
              if (missingItems.length > 0) {
                updatedSettings.dashboardLayout = [
                  ...updatedSettings.dashboardLayout,
                  ...missingItems.map(i => ({ ...i, order: updatedSettings.dashboardLayout!.length + i.order }))
                ];
              }
            } else {
              updatedSettings.dashboardLayout = DEFAULT_DASHBOARD_LAYOUT;
            }

            set({ settings: updatedSettings, isLoading: false });

            // Sync with appStore
            if (dbSettings.theme) {
              useAppStore.getState().setTheme(dbSettings.theme);
            }
            if (dbSettings.language) {
              useAppStore.getState().setLanguage(dbSettings.language);
            }
          } else {
            set({ isLoading: false });
          }
        });
        return unsubscribe;
      },

      importSettings: async (importedSettings) => {
        await get().updateSettings(importedSettings);
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
