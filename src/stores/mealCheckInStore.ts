/**
 * @module stores/mealCheckInStore
 * @description Meal check-in state store.
 * Manages daily meal check-ins, monthly statistics, and CRUD operations.
 */

import { create } from 'zustand';
import { addDays, format } from 'date-fns';
import type {
  MealCheckIn,
  MealCheckInCycleConfig,
  MealCheckInCycleStats,
} from '../types';
import { mealCheckInService } from '../services/mealCheckInService';

/** Meal check-in state shape and actions. */
interface MealCheckInState {
  checkIns: MealCheckIn[];
  cycleStats: MealCheckInCycleStats | null;
  cycleConfig: MealCheckInCycleConfig | null;
  isLoading: boolean;
  error: string | null;
  selectedCheckIn: MealCheckIn | null;

  // Actions
  loadCycleData: (userId: string) => Promise<void>;
  saveCycleConfig: (
    userId: string,
    startDate: string,
    cycleDays: number
  ) => Promise<void>;
  createCheckIn: (
    userId: string,
    date: string,
    imageFile: File,
    notes?: string
  ) => Promise<void>;
  deleteCheckIn: (checkIn: MealCheckIn) => Promise<void>;
  updateNotes: (userId: string, date: string, notes: string) => Promise<void>;
  setSelectedCheckIn: (checkIn: MealCheckIn | null) => void;
  clearError: () => void;
}

export const useMealCheckInStore = create<MealCheckInState>((set, get) => ({
  checkIns: [],
  cycleStats: null,
  cycleConfig: null,
  isLoading: false,
  error: null,
  selectedCheckIn: null,

  loadCycleData: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      let config = await mealCheckInService.getCycleConfig(userId);

      if (!config) {
        // Fallback to current month if no config
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const cycleDays = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0
        ).getDate();
        config = {
          userId,
          startDate: format(startOfMonth, 'yyyy-MM-dd'),
          cycleDays,
        };
      }

      const endDate = format(
        addDays(new Date(config.startDate + 'T00:00:00'), config.cycleDays - 1),
        'yyyy-MM-dd'
      );

      const [checkIns, stats] = await Promise.all([
        mealCheckInService.getCheckInsByDateRange(
          userId,
          config.startDate,
          endDate
        ),
        mealCheckInService.getCycleStats(
          userId,
          config.startDate,
          endDate,
          config.cycleDays
        ),
      ]);

      set({
        checkIns,
        cycleStats: stats,
        cycleConfig: config,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to load cycle data',
        isLoading: false,
      });
    }
  },

  saveCycleConfig: async (
    userId: string,
    startDate: string,
    cycleDays: number
  ) => {
    set({ isLoading: true, error: null });
    try {
      const config: MealCheckInCycleConfig = { userId, startDate, cycleDays };
      await mealCheckInService.saveCycleConfig(config);

      // Reload cycle data after saving config
      await get().loadCycleData(userId);
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to save cycle config',
        isLoading: false,
      });
      throw error;
    }
  },

  createCheckIn: async (
    userId: string,
    date: string,
    imageFile: File,
    notes?: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const newCheckIn = await mealCheckInService.createCheckIn(
        userId,
        date,
        imageFile,
        notes
      );

      const currentCheckIns = get().checkIns;
      const existingIndex = currentCheckIns.findIndex((c) => c.date === date);

      let updatedCheckIns: MealCheckIn[];
      if (existingIndex >= 0) {
        // Replace existing check-in
        updatedCheckIns = [...currentCheckIns];
        updatedCheckIns[existingIndex] = newCheckIn;
      } else {
        // Add new check-in and sort by date
        updatedCheckIns = [...currentCheckIns, newCheckIn].sort((a, b) =>
          a.date.localeCompare(b.date)
        );
      }

      // Recalculate stats
      const config = get().cycleConfig;
      if (config) {
        const endDate = format(
          addDays(
            new Date(config.startDate + 'T00:00:00'),
            config.cycleDays - 1
          ),
          'yyyy-MM-dd'
        );
        const stats = await mealCheckInService.getCycleStats(
          userId,
          config.startDate,
          endDate,
          config.cycleDays
        );
        set({ cycleStats: stats });
      }

      set({
        checkIns: updatedCheckIns,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to create check-in',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteCheckIn: async (checkIn: MealCheckIn) => {
    set({ isLoading: true, error: null });
    try {
      await mealCheckInService.deleteCheckIn(checkIn);

      const updatedCheckIns = get().checkIns.filter((c) => c.id !== checkIn.id);

      // Recalculate stats
      const config = get().cycleConfig;
      if (config) {
        const endDate = format(
          addDays(
            new Date(config.startDate + 'T00:00:00'),
            config.cycleDays - 1
          ),
          'yyyy-MM-dd'
        );
        const stats = await mealCheckInService.getCycleStats(
          checkIn.userId,
          config.startDate,
          endDate,
          config.cycleDays
        );
        set({ cycleStats: stats });
      }

      set({
        checkIns: updatedCheckIns,
        selectedCheckIn: null,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to delete check-in',
        isLoading: false,
      });
      throw error;
    }
  },

  updateNotes: async (userId: string, date: string, notes: string) => {
    set({ isLoading: true, error: null });
    try {
      await mealCheckInService.updateNotes(userId, date, notes);

      const updatedCheckIns = get().checkIns.map((c) =>
        c.date === date ? { ...c, notes, updatedAt: Date.now() } : c
      );

      set({
        checkIns: updatedCheckIns,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to update notes',
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedCheckIn: (checkIn: MealCheckIn | null) => {
    set({ selectedCheckIn: checkIn });
  },

  clearError: () => {
    set({ error: null });
  },
}));
