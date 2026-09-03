import type { SpreadsheetConnection } from '@/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SpreadsheetState {
  files: SpreadsheetConnection[];
  selectedId: string | null;
  addFile: (file: SpreadsheetConnection) => void;
  updateFile: (id: string, updates: Partial<SpreadsheetConnection>) => void;
  removeFile: (id: string) => void;
  selectFile: (id: string | null) => void;
}

export const useSpreadsheetStore = create<SpreadsheetState>()(
  persist(
    (set) => ({
      files: [],
      selectedId: null,
      addFile: (file) =>
        set((state) => ({
          files: [file, ...state.files.filter((item) => item.url !== file.url)],
          selectedId: file.id,
        })),
      updateFile: (id, updates) =>
        set((state) => ({
          files: state.files.map((file) => (file.id === id ? { ...file, ...updates } : file)),
        })),
      removeFile: (id) =>
        set((state) => ({
          files: state.files.filter((file) => file.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
        })),
      selectFile: (selectedId) => set({ selectedId }),
    }),
    {
      name: 'spreadsheet-manager-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
