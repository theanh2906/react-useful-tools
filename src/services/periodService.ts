/**
 * @module services/periodService
 * @description CRUD operations for period tracking logs and cycle settings.
 * Uses Firebase Realtime Database via the realtimeDb abstraction layer.
 */

import type { PeriodLog, CycleSettings } from '@/types';
import {
  createItem,
  deleteItem,
  listenCollection,
  updateItem,
  fetchValue,
  setValue,
} from './realtimeDb';

/** Strips keys with `undefined` values — Firebase RTDB rejects them. */
const stripUndefined = <T extends Record<string, unknown>>(obj: T): T => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;
};

/** @internal Realtime Database path for period logs. */
const PERIOD_LOGS_PATH = 'periodLogs';

/** @internal Realtime Database path for cycle settings. */
const CYCLE_SETTINGS_PATH = 'cycleSettings';

/**
 * Subscribes to real-time updates of period logs.
 *
 * @param onChange - Callback invoked with the latest array of period logs.
 * @returns Unsubscribe function.
 */
export const listenPeriodLogs = (onChange: (logs: PeriodLog[]) => void) => {
  return listenCollection<PeriodLog>(PERIOD_LOGS_PATH, onChange);
};

/**
 * Creates a new period log entry.
 *
 * @param log - The period log data (the `id` field is stripped before saving).
 * @returns The generated log key.
 */
export const createPeriodLog = async (log: PeriodLog) => {
  const { id, ...payload } = log;
  return createItem(PERIOD_LOGS_PATH, stripUndefined(payload));
};

/**
 * Updates an existing period log by ID.
 *
 * @param id - Period log ID to update.
 * @param log - Partial period log data to merge.
 */
export const updatePeriodLog = async (id: string, log: Partial<PeriodLog>) => {
  const { id: _ignore, ...payload } = log;
  return updateItem(PERIOD_LOGS_PATH, id, stripUndefined(payload));
};

/**
 * Deletes a period log by ID.
 *
 * @param id - Period log ID to delete.
 */
export const deletePeriodLog = async (id: string) => {
  return deleteItem(PERIOD_LOGS_PATH, id);
};

/**
 * Fetches the user's cycle settings.
 *
 * @returns The cycle settings, or `null` if not yet configured.
 */
export const fetchCycleSettings = async () => {
  return fetchValue<CycleSettings>(CYCLE_SETTINGS_PATH);
};

/**
 * Saves the user's cycle settings.
 *
 * @param settings - The cycle settings to persist.
 */
export const saveCycleSettings = async (settings: CycleSettings) => {
  return setValue(CYCLE_SETTINGS_PATH, settings);
};
