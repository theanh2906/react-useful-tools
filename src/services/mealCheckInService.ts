/**
 * @module services/mealCheckInService
 * @description Meal check-in service for daily meal tracking.
 * Handles optional image upload, CRUD operations, and monthly statistics.
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  ref as dbRef,
  set,
  get,
  remove,
  update,
  query,
  orderByChild,
  equalTo,
} from 'firebase/database';
import { database, storage } from '../config/firebase';
import type {
  MealCheckIn,
  MealCheckInCycleDefinition,
  MealCheckInCycleConfig,
  MealCheckInCycleStats,
} from '../types';
import { normalizeMealCheckInCycles } from '../utils/mealCheckInCycles';

/** @internal Realtime Database collection name for meal check-ins. */
const COLLECTION_NAME = 'mealCheckIns';
const CONFIG_COLLECTION_NAME = 'mealCheckInConfigs';
const SHARE_TOKENS_COLLECTION = 'mealCheckInShareTokens';
const PUBLIC_SHARES_COLLECTION = 'publicShares/mealCheckIns';

export interface SharedMealCheckInData {
  ownerUserId: string;
  config: MealCheckInCycleConfig;
  configs: MealCheckInCycleConfig[];
  checkIns: MealCheckIn[];
  updatedAt: number;
}

const normalizeCycleHistory = (
  cycles: MealCheckInCycleDefinition[]
): MealCheckInCycleDefinition[] => {
  const byStartDate = new Map<string, MealCheckInCycleDefinition>();

  cycles.forEach((cycle) => {
    if (!cycle.startDate || cycle.cycleDays < 1) return;
    byStartDate.set(cycle.startDate, cycle);
  });

  return Array.from(byStartDate.values()).sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );
};

const mapCheckInsSnapshot = (snapshot: Awaited<ReturnType<typeof get>>) => {
  if (!snapshot.exists()) return [];

  const checkIns: MealCheckIn[] = [];
  snapshot.forEach((childSnapshot) => {
    checkIns.push(childSnapshot.val() as MealCheckIn);
  });

  return checkIns;
};

const fetchCheckInsForUser = async (userId: string) => {
  const checkInsRef = dbRef(database, COLLECTION_NAME);
  const userQuery = query(checkInsRef, orderByChild('userId'), equalTo(userId));
  const snapshot = await get(userQuery);
  return mapCheckInsSnapshot(snapshot);
};

const buildCycleConfigs = (
  userId: string,
  legacyConfig: MealCheckInCycleConfig | null
) => {
  const configs: MealCheckInCycleConfig[] = [];

  if (legacyConfig) {
    configs.push(legacyConfig);
    configs.push(
      ...(legacyConfig.cycleHistory ?? []).map((cycle) => ({
        userId,
        startDate: cycle.startDate,
        cycleDays: cycle.cycleDays,
      }))
    );
  }

  return normalizeMealCheckInCycles(configs);
};

const syncMealCheckInShareSnapshot = async (userId: string) => {
  if (!userId) return;

  const configRef = dbRef(database, `${CONFIG_COLLECTION_NAME}/${userId}`);
  const configSnapshot = await get(configRef);
  if (!configSnapshot.exists()) return;

  const config = configSnapshot.val() as MealCheckInCycleConfig;
  if (!config.shareToken) return;

  const configs = buildCycleConfigs(userId, config);
  const checkIns = (await fetchCheckInsForUser(userId)).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  const publicRef = dbRef(
    database,
    `${PUBLIC_SHARES_COLLECTION}/${config.shareToken}`
  );

  await set(publicRef, {
    ownerUserId: userId,
    config,
    configs,
    checkIns,
    updatedAt: Date.now(),
  } satisfies SharedMealCheckInData);
};

export const mealCheckInService = {
  /**
   * Create or update a meal check-in for a specific date
   */
  async createCheckIn(
    userId: string,
    date: string,
    imageFile?: File | null,
    notes?: string
  ): Promise<MealCheckIn> {
    try {
      const timestamp = Date.now();
      let imageUrl: string | undefined;
      let imageStoragePath: string | undefined;

      if (imageFile) {
        const extension = imageFile.name.split('.').pop();
        imageStoragePath = `meal-check-ins/${userId}/${date}_${timestamp}.${extension}`;
        const storageReference = ref(storage, imageStoragePath);

        await uploadBytes(storageReference, imageFile);
        imageUrl = await getDownloadURL(storageReference);
      }

      // Create check-in document
      const checkInId = `${userId}_${date}`;
      const checkInData: MealCheckIn = {
        id: checkInId,
        userId,
        date,
        ...(imageUrl ? { imageUrl } : {}),
        ...(imageStoragePath ? { imageStoragePath } : {}),
        ...(notes ? { notes } : {}),
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const checkInRef = dbRef(database, `${COLLECTION_NAME}/${checkInId}`);
      await set(checkInRef, checkInData);
      await syncMealCheckInShareSnapshot(userId);

      return checkInData;
    } catch (error) {
      console.error('Error creating meal check-in:', error);
      throw error;
    }
  },

  /**
   * Get check-in for a specific date
   */
  async getCheckInByDate(
    userId: string,
    date: string
  ): Promise<MealCheckIn | null> {
    try {
      const checkInId = `${userId}_${date}`;
      const checkInRef = dbRef(database, `${COLLECTION_NAME}/${checkInId}`);
      const snapshot = await get(checkInRef);

      if (snapshot.exists()) {
        return snapshot.val() as MealCheckIn;
      }
      return null;
    } catch (error) {
      console.error('Error getting meal check-in:', error);
      throw error;
    }
  },

  /**
   * Get all check-ins for a specific date range
   */
  async getCheckInsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<MealCheckIn[]> {
    try {
      const rangeCheckIns = (await fetchCheckInsForUser(userId)).filter(
        (checkIn) => checkIn.date >= startDate && checkIn.date <= endDate
      );

      return rangeCheckIns.sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error getting range check-ins:', error);
      throw error;
    }
  },

  /**
   * Get all check-ins for a specific month (deprecated - use getCheckInsByDateRange)
   */
  async getCheckInsByMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<MealCheckIn[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    return this.getCheckInsByDateRange(userId, startDate, endDate);
  },

  /**
   * Save a meal check-in cycle configuration
   */
  async saveCycleConfig(config: MealCheckInCycleConfig): Promise<void> {
    try {
      const existingConfig = await this.getCycleConfig(config.userId);
      const cycleHistory = normalizeCycleHistory([
        ...(existingConfig?.cycleHistory ?? []),
        ...(existingConfig
          ? [
              {
                startDate: existingConfig.startDate,
                cycleDays: existingConfig.cycleDays,
              },
            ]
          : []),
        {
          startDate: config.startDate,
          cycleDays: config.cycleDays,
        },
      ]);
      const configToSave: MealCheckInCycleConfig = {
        ...config,
        shareToken: config.shareToken ?? existingConfig?.shareToken,
        cycleHistory,
      };
      const configRef = dbRef(
        database,
        `${CONFIG_COLLECTION_NAME}/${config.userId}`
      );
      await set(configRef, configToSave);
      await syncMealCheckInShareSnapshot(config.userId);
    } catch (error) {
      console.error('Error saving cycle config:', error);
      throw error;
    }
  },

  /**
   * Get cycle config for a user
   */
  async getCycleConfig(userId: string): Promise<MealCheckInCycleConfig | null> {
    try {
      const configRef = dbRef(database, `${CONFIG_COLLECTION_NAME}/${userId}`);
      const snapshot = await get(configRef);
      if (snapshot.exists()) {
        return snapshot.val() as MealCheckInCycleConfig;
      }
      return null;
    } catch (error) {
      console.error('Error getting cycle config:', error);
      throw error;
    }
  },

  /**
   * Get all cycle configs for a user.
   * Merges the legacy single config with the cycle history for backward compatibility.
   */
  async getCycleConfigs(userId: string): Promise<MealCheckInCycleConfig[]> {
    try {
      const legacyConfig = await this.getCycleConfig(userId);
      return buildCycleConfigs(userId, legacyConfig);
    } catch (error) {
      console.error('Error getting cycle configs:', error);
      throw error;
    }
  },

  /**
   * Delete a check-in
   */
  async deleteCheckIn(checkIn: MealCheckIn): Promise<void> {
    try {
      if (checkIn.imageStoragePath) {
        const imageReference = ref(storage, checkIn.imageStoragePath);
        await deleteObject(imageReference);
      }

      // Delete document
      const checkInRef = dbRef(database, `${COLLECTION_NAME}/${checkIn.id}`);
      await remove(checkInRef);
      await syncMealCheckInShareSnapshot(checkIn.userId);
    } catch (error) {
      console.error('Error deleting meal check-in:', error);
      throw error;
    }
  },

  /**
   * Update check-in notes
   */
  async updateNotes(
    userId: string,
    date: string,
    notes: string
  ): Promise<void> {
    try {
      const checkInId = `${userId}_${date}`;
      const checkInRef = dbRef(database, `${COLLECTION_NAME}/${checkInId}`);

      await update(checkInRef, {
        notes,
        updatedAt: Date.now(),
      });
      await syncMealCheckInShareSnapshot(userId);
    } catch (error) {
      console.error('Error updating check-in notes:', error);
      throw error;
    }
  },

  /**
   * Get statistics for a cycle
   */
  async getCycleStats(
    userId: string,
    startDate: string,
    endDate: string,
    cycleDays: number
  ): Promise<MealCheckInCycleStats> {
    try {
      const checkIns = await this.getCheckInsByDateRange(
        userId,
        startDate,
        endDate
      );
      const checkedInDays = checkIns.length;

      // Calculate percentage based on cycle days
      // If cycleDays is fewer than checked in, limit to 100%
      const percentage = Math.min(
        100,
        Math.round((checkedInDays / cycleDays) * 100)
      );

      return {
        totalCycleDays: cycleDays,
        checkedInDays,
        percentage,
      };
    } catch (error) {
      console.error('Error getting cycle stats:', error);
      throw error;
    }
  },

  /**
   * Get statistics for a specific month (deprecated - use getCycleStats)
   */
  async getMonthStats(
    userId: string,
    year: number,
    month: number
  ): Promise<MealCheckInCycleStats> {
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(totalDaysInMonth).padStart(2, '0')}`;

    return this.getCycleStats(userId, startDate, endDate, totalDaysInMonth);
  },

  /**
   * Get all check-ins for a user (for export/backup)
   */
  async getAllCheckIns(userId: string): Promise<MealCheckIn[]> {
    try {
      const allCheckIns = await fetchCheckInsForUser(userId);

      return allCheckIns.sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
      console.error('Error getting all check-ins:', error);
      throw error;
    }
  },

  /**
   * Generate a random share token for a user's meal check-in page.
   * Saves the token on the cycle config and creates a reverse-lookup entry.
   */
  async generateShareToken(userId: string): Promise<string> {
    try {
      const token = crypto.randomUUID();

      // Save token on cycle config
      const configRef = dbRef(database, `${CONFIG_COLLECTION_NAME}/${userId}`);
      await update(configRef, { shareToken: token });

      // Reverse-lookup: token → userId
      const tokenRef = dbRef(
        database,
        `${SHARE_TOKENS_COLLECTION}/${token}`
      );
      await set(tokenRef, { userId });
      await syncMealCheckInShareSnapshot(userId);

      return token;
    } catch (error) {
      console.error('Error generating share token:', error);
      throw error;
    }
  },

  /**
   * Revoke a share token. Removes lookup entry and clears token from config.
   */
  async revokeShareToken(userId: string, token: string): Promise<void> {
    try {
      // Remove reverse-lookup entry
      const tokenRef = dbRef(
        database,
        `${SHARE_TOKENS_COLLECTION}/${token}`
      );
      await remove(tokenRef);

      const publicRef = dbRef(database, `${PUBLIC_SHARES_COLLECTION}/${token}`);
      await remove(publicRef);

      // Clear token from cycle config
      const configRef = dbRef(database, `${CONFIG_COLLECTION_NAME}/${userId}`);
      await update(configRef, { shareToken: null });
    } catch (error) {
      console.error('Error revoking share token:', error);
      throw error;
    }
  },

  async getSharedDataByToken(
    token: string
  ): Promise<SharedMealCheckInData | null> {
    try {
      const publicRef = dbRef(database, `${PUBLIC_SHARES_COLLECTION}/${token}`);
      const snapshot = await get(publicRef);
      if (!snapshot.exists()) return null;

      const data = snapshot.val() as SharedMealCheckInData;
      if (!data.ownerUserId || !data.config || !Array.isArray(data.checkIns)) {
        return null;
      }

      return {
        ownerUserId: data.ownerUserId,
        config: data.config,
        configs: Array.isArray(data.configs) ? data.configs : [data.config],
        checkIns: data.checkIns,
        updatedAt: data.updatedAt,
      };
    } catch (error) {
      console.error('Error loading shared meal check-in snapshot:', error);
      return null;
    }
  },
};
