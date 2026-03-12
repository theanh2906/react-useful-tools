/**
 * @module services/mealCheckInService
 * @description Meal check-in service for daily meal photo tracking.
 * Handles image upload, CRUD operations, and monthly statistics.
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
  MealCheckInCycleConfig,
  MealCheckInCycleStats,
} from '../types';

/** @internal Realtime Database collection name for meal check-ins. */
const COLLECTION_NAME = 'mealCheckIns';
const CONFIG_COLLECTION_NAME = 'mealCheckInConfigs';
const SHARE_TOKENS_COLLECTION = 'mealCheckInShareTokens';

export const mealCheckInService = {
  /**
   * Create or update a meal check-in for a specific date
   */
  async createCheckIn(
    userId: string,
    date: string,
    imageFile: File,
    notes?: string
  ): Promise<MealCheckIn> {
    try {
      // Create storage reference
      const timestamp = Date.now();
      const storagePath = `meal-check-ins/${userId}/${date}_${timestamp}.${imageFile.name.split('.').pop()}`;
      const storageReference = ref(storage, storagePath);

      // Upload image
      await uploadBytes(storageReference, imageFile);
      const imageUrl = await getDownloadURL(storageReference);

      // Create check-in document
      const checkInId = `${userId}_${date}`;
      const checkInData: MealCheckIn = {
        id: checkInId,
        userId,
        date,
        imageUrl,
        imageStoragePath: storagePath,
        notes,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const checkInRef = dbRef(database, `${COLLECTION_NAME}/${checkInId}`);
      await set(checkInRef, checkInData);

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
      // Get all check-ins from database
      const checkInsRef = dbRef(database, COLLECTION_NAME);
      const snapshot = await get(checkInsRef);

      if (!snapshot.exists()) {
        return [];
      }

      // Filter check-ins for the specific user and date range
      const rangeCheckIns: MealCheckIn[] = [];
      snapshot.forEach((childSnapshot) => {
        const checkIn = childSnapshot.val() as MealCheckIn;
        // Filter by userId and date range
        if (
          checkIn.userId === userId &&
          checkIn.date >= startDate &&
          checkIn.date <= endDate
        ) {
          rangeCheckIns.push(checkIn);
        }
      });

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
      const configRef = dbRef(
        database,
        `${CONFIG_COLLECTION_NAME}/${config.userId}`
      );
      await set(configRef, config);
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
   * Delete a check-in
   */
  async deleteCheckIn(checkIn: MealCheckIn): Promise<void> {
    try {
      // Delete image from storage
      const imageReference = ref(storage, checkIn.imageStoragePath);
      await deleteObject(imageReference);

      // Delete document
      const checkInRef = dbRef(database, `${COLLECTION_NAME}/${checkIn.id}`);
      await remove(checkInRef);
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

      await set(checkInRef, {
        notes,
        updatedAt: Date.now(),
      });
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
      const checkInsRef = dbRef(database, COLLECTION_NAME);
      const userQuery = query(
        checkInsRef,
        orderByChild('userId'),
        equalTo(userId)
      );
      const snapshot = await get(userQuery);

      if (!snapshot.exists()) {
        return [];
      }

      const allCheckIns: MealCheckIn[] = [];
      snapshot.forEach((childSnapshot) => {
        allCheckIns.push(childSnapshot.val() as MealCheckIn);
      });

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

      // Clear token from cycle config
      const configRef = dbRef(database, `${CONFIG_COLLECTION_NAME}/${userId}`);
      await update(configRef, { shareToken: null });
    } catch (error) {
      console.error('Error revoking share token:', error);
      throw error;
    }
  },

  /**
   * Resolve a share token to its owner's userId.
   * Returns null if the token does not exist.
   */
  async getUserIdByShareToken(token: string): Promise<string | null> {
    try {
      const tokenRef = dbRef(
        database,
        `${SHARE_TOKENS_COLLECTION}/${token}`
      );
      const snapshot = await get(tokenRef);
      if (snapshot.exists()) {
        const data = snapshot.val() as { userId: string };
        return data.userId;
      }
      return null;
    } catch (error) {
      console.error('Error resolving share token:', error);
      return null;
    }
  },
};
