/**
 * @module stores/periodStore
 * @description Period tracker state store.
 * Manages period logs, cycle settings, real-time subscriptions, and cycle predictions.
 */

import { create } from 'zustand';
import { addDays, differenceInDays, parseISO, format } from 'date-fns';
import type { PeriodLog, CycleSettings, CyclePrediction } from '@/types';
import {
  listenPeriodLogs,
  createPeriodLog,
  updatePeriodLog as updatePeriodLogService,
  deletePeriodLog as deletePeriodLogService,
  fetchCycleSettings,
  saveCycleSettings,
} from '@/services/periodService';

/** Default cycle settings when user has no saved preferences. */
const DEFAULT_SETTINGS: CycleSettings = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
};

/** Period tracker state shape and actions. */
interface PeriodState {
  periodLogs: PeriodLog[];
  cycleSettings: CycleSettings;
  isLoading: boolean;
  unsubscribe?: () => void;

  subscribePeriodLogs: () => Promise<void>;
  loadCycleSettings: () => Promise<void>;
  addPeriodLog: (log: PeriodLog) => Promise<void>;
  updatePeriodLog: (id: string, log: Partial<PeriodLog>) => Promise<void>;
  deletePeriodLog: (id: string) => Promise<void>;
  updateCycleSettings: (settings: CycleSettings) => Promise<void>;

  getAverageCycleLength: () => number;
  getPrediction: () => CyclePrediction | null;
  getCurrentCycleDay: () => number | null;
}

export const usePeriodStore = create<PeriodState>((set, get) => ({
  periodLogs: [],
  cycleSettings: DEFAULT_SETTINGS,
  isLoading: false,
  unsubscribe: undefined,

  subscribePeriodLogs: async () => {
    const current = get().unsubscribe;
    if (current) current();
    set({ isLoading: true });
    const unsubscribe = await listenPeriodLogs((logs) => {
      const sorted = [...logs].sort(
        (a, b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime()
      );
      set({ periodLogs: sorted, isLoading: false });
    });
    set({ unsubscribe });
  },

  loadCycleSettings: async () => {
    const settings = await fetchCycleSettings();
    if (settings) set({ cycleSettings: settings });
  },

  addPeriodLog: async (log) => {
    await createPeriodLog(log);
  },

  updatePeriodLog: async (id, log) => {
    await updatePeriodLogService(id, log);
  },

  deletePeriodLog: async (id) => {
    await deletePeriodLogService(id);
  },

  updateCycleSettings: async (settings) => {
    await saveCycleSettings(settings);
    set({ cycleSettings: settings });
  },

  getAverageCycleLength: () => {
    const { periodLogs, cycleSettings } = get();
    if (periodLogs.length < 2) return cycleSettings.averageCycleLength;

    const sorted = [...periodLogs].sort(
      (a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()
    );

    let totalDays = 0;
    let count = 0;
    for (let i = 1; i < sorted.length; i++) {
      const gap = differenceInDays(
        parseISO(sorted[i].startDate),
        parseISO(sorted[i - 1].startDate)
      );
      if (gap > 15 && gap < 60) {
        totalDays += gap;
        count++;
      }
    }

    return count > 0 ? Math.round(totalDays / count) : cycleSettings.averageCycleLength;
  },

  getPrediction: () => {
    const { periodLogs, cycleSettings, getAverageCycleLength } = get();
    if (periodLogs.length === 0) return null;

    const lastLog = periodLogs[0];
    const avgCycle = getAverageCycleLength();
    const avgPeriod = cycleSettings.averagePeriodLength;

    const nextStart = addDays(parseISO(lastLog.startDate), avgCycle);
    const nextEnd = addDays(nextStart, avgPeriod - 1);

    return {
      nextPeriodStart: format(nextStart, 'yyyy-MM-dd'),
      nextPeriodEnd: format(nextEnd, 'yyyy-MM-dd'),
    };
  },

  getCurrentCycleDay: () => {
    const { periodLogs } = get();
    if (periodLogs.length === 0) return null;

    const lastLog = periodLogs[0];
    const today = new Date();
    const daysSinceStart = differenceInDays(today, parseISO(lastLog.startDate));

    return daysSinceStart >= 0 ? daysSinceStart + 1 : null;
  },
}));
