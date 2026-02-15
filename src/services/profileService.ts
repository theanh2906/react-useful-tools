/**
 * @module services/profileService
 * @description User profile persistence service.
 * Manages conception date and baby birth date stored in Firebase Realtime Database.
 */

import { fetchValue, setValue, listenValue } from './realtimeDb';

/** User profile data stored in Firebase. */
export type UserProfile = {
  /** Conception date as ISO string (optional). */
  conceptionDate?: string;
  /** Baby birth date as ISO string (optional). */
  babyBirthDate?: string;
};

/** @internal Realtime Database path for user profile. */
const PROFILE_PATH = 'profile';

/**
 * Fetches the user profile from the database.
 *
 * @returns The user profile, or `null` if not found.
 */
export const fetchProfile = async () => {
  return fetchValue<UserProfile>(PROFILE_PATH);
};

/**
 * Saves (overwrites) the user profile in the database.
 *
 * @param profile - The profile data to save.
 */
export const saveProfile = async (profile: UserProfile) => {
  return setValue(PROFILE_PATH, profile);
};

/**
 * Subscribes to real-time profile updates.
 *
 * @param onChange - Callback invoked with the latest profile (or `null`).
 * @returns Unsubscribe function.
 */
export const listenProfile = (
  onChange: (profile: UserProfile | null) => void
) => {
  return listenValue<UserProfile>(PROFILE_PATH, onChange);
};
