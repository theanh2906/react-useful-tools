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
import { ref as dbRef, set, get, remove } from 'firebase/database';
import { database } from '@/config/firebase';

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

/** @internal Realtime Database root collection for period share tokens. */
const SHARE_TOKENS_COLLECTION = 'periodShareTokens';

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

/**
 * Generate a random share token for a user's period tracker page.
 * Saves the token in the cycle settings and creates a reverse-lookup entry.
 */
export const generateShareToken = async (userId: string): Promise<string> => {
  try {
    const token = crypto.randomUUID();

    // 1. Save token on cycle settings
    const settings = await fetchCycleSettings();
    const updatedSettings = {
      ...(settings || { averageCycleLength: 28, averagePeriodLength: 5 }),
      shareToken: token,
    };
    await saveCycleSettings(updatedSettings);

    // 2. Reverse-lookup: token → userId
    const tokenRef = dbRef(database, `${SHARE_TOKENS_COLLECTION}/${token}`);
    await set(tokenRef, { userId });

    return token;
  } catch (error) {
    console.error('Error generating period share token:', error);
    throw error;
  }
};

/**
 * Revoke a share token. Removes lookup entry and clears token from settings.
 */
export const revokeShareToken = async (userId: string, token: string): Promise<void> => {
  try {
    // 1. Remove reverse-lookup entry
    const tokenRef = dbRef(database, `${SHARE_TOKENS_COLLECTION}/${token}`);
    await remove(tokenRef);

    // 2. Clear token from cycle settings
    const settings = await fetchCycleSettings();
    if (settings) {
      const { shareToken, ...rest } = settings;
      await saveCycleSettings(rest);
    }
  } catch (error) {
    console.error('Error revoking period share token:', error);
    throw error;
  }
};

/**
 * Resolve a share token to its owner's userId.
 * Returns null if the token does not exist.
 */
export const getUserIdByShareToken = async (token: string): Promise<string | null> => {
  try {
    const tokenRef = dbRef(database, `${SHARE_TOKENS_COLLECTION}/${token}`);
    const snapshot = await get(tokenRef);
    if (snapshot.exists()) {
      const data = snapshot.val() as { userId: string };
      return data.userId;
    }
    return null;
  } catch (error) {
    console.error('Error resolving period share token:', error);
    return null;
  }
};

/**
 * Fetch period logs for a specific user (public read-only)
 */
export const fetchSharedPeriodLogs = async (userId: string): Promise<PeriodLog[]> => {
  try {
    const logsRef = dbRef(database, `users/${userId}/${PERIOD_LOGS_PATH}`);
    const snapshot = await get(logsRef);
    if (!snapshot.exists()) return [];

    const val = snapshot.val();
    if (Array.isArray(val)) {
      return val.filter(Boolean);
    }
    return Object.entries(val).map(([id, item]) => ({
      ...(item as object),
      id,
    })) as PeriodLog[];
  } catch (error) {
    console.error('Error fetching shared period logs:', error);
    throw error;
  }
};

/**
 * Fetch cycle settings for a specific user (public read-only)
 */
export const fetchSharedCycleSettings = async (userId: string): Promise<CycleSettings | null> => {
  try {
    const settingsRef = dbRef(database, `users/${userId}/${CYCLE_SETTINGS_PATH}`);
    const snapshot = await get(settingsRef);
    if (snapshot.exists()) {
      return snapshot.val() as CycleSettings;
    }
    return null;
  } catch (error) {
    console.error('Error fetching shared cycle settings:', error);
    throw error;
  }
};

