import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { ref as dbRef, set, get, query, orderByChild, equalTo, remove } from 'firebase/database';
import { database, storage } from '../config/firebase';
import type { MealCheckIn, MealCheckInStats } from '../types';

const COLLECTION_NAME = 'mealCheckIns';

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
   * Get all check-ins for a specific month
   */
  async getCheckInsByMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<MealCheckIn[]> {
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

      const checkInsRef = dbRef(database, COLLECTION_NAME);
      const userQuery = query(checkInsRef, orderByChild('userId'), equalTo(userId));
      const snapshot = await get(userQuery);

      if (!snapshot.exists()) {
        return [];
      }

      const allCheckIns: MealCheckIn[] = [];
      snapshot.forEach((childSnapshot) => {
        const checkIn = childSnapshot.val() as MealCheckIn;
        if (checkIn.date >= startDate && checkIn.date <= endDate) {
          allCheckIns.push(checkIn);
        }
      });

      return allCheckIns.sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error getting monthly check-ins:', error);
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
   * Get statistics for a specific month
   */
  async getMonthStats(
    userId: string,
    year: number,
    month: number
  ): Promise<MealCheckInStats> {
    try {
      const checkIns = await this.getCheckInsByMonth(userId, year, month);
      const totalDaysInMonth = new Date(year, month, 0).getDate();
      const checkedInDays = checkIns.length;
      const percentage = Math.round((checkedInDays / totalDaysInMonth) * 100);

      return {
        totalDaysInMonth,
        checkedInDays,
        percentage,
      };
    } catch (error) {
      console.error('Error getting month stats:', error);
      throw error;
    }
  },

  /**
   * Get all check-ins for a user (for export/backup)
   */
  async getAllCheckIns(userId: string): Promise<MealCheckIn[]> {
    try {
      const checkInsRef = dbRef(database, COLLECTION_NAME);
      const userQuery = query(checkInsRef, orderByChild('userId'), equalTo(userId));
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
};
