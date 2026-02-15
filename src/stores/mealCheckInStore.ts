/**
 * @module stores/mealCheckInStore
 * @description Meal check-in state store.
 * Manages daily meal check-ins, monthly statistics, and CRUD operations.
 */

import { create } from 'zustand';
import type { MealCheckIn, MealCheckInStats } from '../types';
import { mealCheckInService } from '../services/mealCheckInService';

/** Meal check-in state shape and actions. */
interface MealCheckInState {
  checkIns: MealCheckIn[];
  currentMonthStats: MealCheckInStats | null;
  isLoading: boolean;
  error: string | null;
  selectedCheckIn: MealCheckIn | null;

  // Actions
  loadMonthCheckIns: (
    userId: string,
    year: number,
    month: number
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
  currentMonthStats: null,
  isLoading: false,
  error: null,
  selectedCheckIn: null,

  loadMonthCheckIns: async (userId: string, year: number, month: number) => {
    set({ isLoading: true, error: null });
    try {
      const [checkIns, stats] = await Promise.all([
        mealCheckInService.getCheckInsByMonth(userId, year, month),
        mealCheckInService.getMonthStats(userId, year, month),
      ]);

      set({
        checkIns,
        currentMonthStats: stats,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to load check-ins',
        isLoading: false,
      });
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
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1;
      const stats = await mealCheckInService.getMonthStats(userId, year, month);

      set({
        checkIns: updatedCheckIns,
        currentMonthStats: stats,
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
      const dateObj = new Date(checkIn.date);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1;
      const stats = await mealCheckInService.getMonthStats(
        checkIn.userId,
        year,
        month
      );

      set({
        checkIns: updatedCheckIns,
        currentMonthStats: stats,
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
