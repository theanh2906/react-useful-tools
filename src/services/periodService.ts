/**
 * @module services/periodService
 * @description CRUD operations for period tracking logs and cycle settings.
 * Uses Firebase Realtime Database via the realtimeDb abstraction layer.
 */

import type { PeriodLog, CycleSettings } from '@/types';
import {
  createItem,
  deleteItem,
  fetchCollection,
  listenCollection,
  updateItem,
  fetchValue,
  setValue,
} from './realtimeDb';
import { ref as dbRef, set, get, remove } from 'firebase/database';
import { auth, database } from '@/config/firebase';

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

/** @internal Public read-only snapshots keyed by share token. */
const PUBLIC_SHARES_COLLECTION = 'publicShares/periodTrackers';

export interface SharedPeriodTrackerData {
  ownerUserId: string;
  settings: CycleSettings;
  logs: PeriodLog[];
  updatedAt: number;
}

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
  const key = await createItem(PERIOD_LOGS_PATH, stripUndefined(payload));
  await syncPeriodShareSnapshot();
  return key;
};

/**
 * Updates an existing period log by ID.
 *
 * @param id - Period log ID to update.
 * @param log - Partial period log data to merge.
 */
export const updatePeriodLog = async (id: string, log: Partial<PeriodLog>) => {
  const { id: _ignore, ...payload } = log;
  await updateItem(PERIOD_LOGS_PATH, id, stripUndefined(payload));
  await syncPeriodShareSnapshot();
};

/**
 * Deletes a period log by ID.
 *
 * @param id - Period log ID to delete.
 */
export const deletePeriodLog = async (id: string) => {
  await deleteItem(PERIOD_LOGS_PATH, id);
  await syncPeriodShareSnapshot();
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
  await setValue(CYCLE_SETTINGS_PATH, settings);
  if (settings.shareToken) {
    await publishPeriodShareSnapshot(
      auth.currentUser?.uid ?? '',
      settings.shareToken,
      settings
    );
  }
};

const mapValueToPeriodLogs = (value: unknown): PeriodLog[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter(Boolean) as PeriodLog[];
  }
  return Object.entries(value as Record<string, unknown>).map(([id, item]) => ({
    ...(item as object),
    id,
  })) as PeriodLog[];
};

const publishPeriodShareSnapshot = async (
  userId: string,
  token: string,
  settings?: CycleSettings | null
) => {
  if (!userId || !token) return;

  const cycleSettings = settings ?? (await fetchCycleSettings());
  if (!cycleSettings) return;

  const logs = await fetchCollection<PeriodLog>(PERIOD_LOGS_PATH);
  const publicRef = dbRef(database, `${PUBLIC_SHARES_COLLECTION}/${token}`);
  await set(publicRef, {
    ownerUserId: userId,
    settings: cycleSettings,
    logs,
    updatedAt: Date.now(),
  } satisfies SharedPeriodTrackerData);
};

const syncPeriodShareSnapshot = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const settings = await fetchCycleSettings();
  if (!settings?.shareToken) return;

  await publishPeriodShareSnapshot(userId, settings.shareToken, settings);
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

    await publishPeriodShareSnapshot(userId, token, updatedSettings);

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

    const publicRef = dbRef(database, `${PUBLIC_SHARES_COLLECTION}/${token}`);
    await remove(publicRef);

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

export const fetchSharedPeriodTrackerByToken = async (
  token: string
): Promise<SharedPeriodTrackerData | null> => {
  try {
    const shareRef = dbRef(database, `${PUBLIC_SHARES_COLLECTION}/${token}`);
    const snapshot = await get(shareRef);
    if (!snapshot.exists()) return null;

    const data = snapshot.val() as Omit<SharedPeriodTrackerData, 'logs'> & {
      logs?: unknown;
    };
    if (!data.settings || !data.ownerUserId) return null;

    return {
      ownerUserId: data.ownerUserId,
      settings: data.settings,
      logs: mapValueToPeriodLogs(data.logs),
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error('Error loading shared period tracker snapshot:', error);
    return null;
  }
};
