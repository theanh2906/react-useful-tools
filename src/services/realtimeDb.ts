/**
 * @module services/realtimeDb
 * @description Generic Firebase Realtime Database abstraction layer.
 * Provides path-resolved CRUD operations with automatic user-scoping.
 *
 * Path Resolution Strategy:
 * 1. Check root path for shared/legacy data
 * 2. Check `users/{uid}/{path}` for user-scoped data
 * 3. Default to user-scoped path for new data
 *
 * Results are cached to avoid redundant lookups.
 */

import { auth, database } from '@/config/firebase';
import {
  ref,
  get,
  set,
  push,
  update,
  remove,
  onValue,
  off,
  DataSnapshot,
} from 'firebase/database';

/** Callback type for collection listeners. */
type Listener<T> = (items: T[]) => void;

/** @internal Cache of resolved database paths to avoid repeated lookups. */
const resolvedPathCache = new Map<string, string>();

/** @internal Returns the current authenticated user's UID, or `null`. */
const getUserId = () => auth.currentUser?.uid || null;

/**
 * Clears the resolved path cache.
 * Should be called on auth state changes to re-resolve user-scoped paths.
 */
export const clearResolvedPathCache = () => {
  resolvedPathCache.clear();
};

/**
 * Converts a Firebase `DataSnapshot` into a typed array.
 * Handles both object and array snapshot structures.
 * @internal
 */
const mapSnapshotToArray = <T extends { id?: string }>(
  snapshot: DataSnapshot
): T[] => {
  if (!snapshot.exists()) return [];
  const value = snapshot.val();
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  return Object.entries(value).map(([id, item]) => ({
    ...(item as object),
    id,
  })) as T[];
};

/**
 * Resolves a logical path to a concrete database path.
 * Checks root, then user-scoped path, and caches the result.
 * @internal
 */
const resolvePath = async (path: string) => {
  if (resolvedPathCache.has(path)) {
    console.log(
      `[RealtimeDB] Using cached path for "${path}":`,
      resolvedPathCache.get(path)
    );
    return resolvedPathCache.get(path)!;
  }

  const uid = getUserId();
  console.log(`[RealtimeDB] Resolving path "${path}" for user:`, uid);

  if (!uid) {
    console.log(`[RealtimeDB] No user, using root path: "${path}"`);
    resolvedPathCache.set(path, path);
    return path;
  }

  // First check root path (for shared/legacy data)
  try {
    const rootSnap = await get(ref(database, path));
    console.log(`[RealtimeDB] Root path "${path}" exists:`, rootSnap.exists());
    if (rootSnap.exists()) {
      resolvedPathCache.set(path, path);
      return path;
    }
  } catch (e) {
    console.log(`[RealtimeDB] Error checking root path "${path}":`, e);
  }

  // Then check user-scoped path
  const scopedPath = `users/${uid}/${path}`;
  try {
    const scopedSnap = await get(ref(database, scopedPath));
    console.log(
      `[RealtimeDB] Scoped path "${scopedPath}" exists:`,
      scopedSnap.exists()
    );
    if (scopedSnap.exists()) {
      resolvedPathCache.set(path, scopedPath);
      return scopedPath;
    }
  } catch (e) {
    console.log(`[RealtimeDB] Error checking scoped path "${scopedPath}":`, e);
  }

  // Default to scoped path for new data
  console.log(
    `[RealtimeDB] No data found, defaulting to scoped path: "${scopedPath}"`
  );
  resolvedPathCache.set(path, scopedPath);
  return scopedPath;
};

/**
 * Subscribes to real-time updates on a collection.
 *
 * @typeParam T - Item type with an optional `id` field.
 * @param path - Logical database path.
 * @param onChange - Callback invoked with the latest items array.
 * @returns Unsubscribe function.
 */
export const listenCollection = async <T extends { id?: string }>(
  path: string,
  onChange: Listener<T>
) => {
  const resolved = await resolvePath(path);
  console.log(`[RealtimeDB] Listening to collection at: "${resolved}"`);
  const dbRef = ref(database, resolved);
  const handler = (snapshot: DataSnapshot) => {
    const data = mapSnapshotToArray<T>(snapshot);
    console.log(
      `[RealtimeDB] Data received from "${resolved}":`,
      data.length,
      'items'
    );
    onChange(data);
  };
  onValue(dbRef, handler);
  return () => off(dbRef, 'value', handler);
};

/**
 * Fetches all items from a collection once.
 *
 * @typeParam T - Item type with an optional `id` field.
 * @param path - Logical database path.
 * @returns Array of items.
 */
export const fetchCollection = async <T extends { id?: string }>(
  path: string
) => {
  const resolved = await resolvePath(path);
  const snapshot = await get(ref(database, resolved));
  return mapSnapshotToArray<T>(snapshot);
};

/**
 * Creates a new item in a collection using Firebase `push()`.
 *
 * @typeParam T - Data type to store.
 * @param path - Logical database path.
 * @param data - Data to write.
 * @returns The auto-generated key of the new item.
 */
export const createItem = async <T extends Record<string, any>>(
  path: string,
  data: T
) => {
  const resolved = await resolvePath(path);
  const collectionRef = ref(database, resolved);
  const newRef = push(collectionRef);
  await set(newRef, data);
  return newRef.key!;
};

/**
 * Updates an existing item in a collection.
 *
 * @typeParam T - Data type to merge.
 * @param path - Logical database path.
 * @param id - Item ID to update.
 * @param data - Partial data to merge.
 */
export const updateItem = async <T extends Record<string, any>>(
  path: string,
  id: string,
  data: T
) => {
  const resolved = await resolvePath(path);
  const itemRef = ref(database, `${resolved}/${id}`);
  await update(itemRef, data);
};

/**
 * Deletes an item from a collection.
 *
 * @param path - Logical database path.
 * @param id - Item ID to delete.
 */
export const deleteItem = async (path: string, id: string) => {
  const resolved = await resolvePath(path);
  const itemRef = ref(database, `${resolved}/${id}`);
  await remove(itemRef);
};

/**
 * Sets (overwrites) a value at a specific path.
 *
 * @typeParam T - Data type to store.
 * @param path - Logical database path.
 * @param data - Data to write (or `null` to delete).
 */
export const setValue = async <T>(path: string, data: T) => {
  const resolved = await resolvePath(path);
  await set(ref(database, resolved), data);
};

/**
 * Fetches a single value from the database once.
 *
 * @typeParam T - Expected value type.
 * @param path - Logical database path.
 * @returns The value, or `null` if not found.
 */
export const fetchValue = async <T>(path: string) => {
  const resolved = await resolvePath(path);
  const snapshot = await get(ref(database, resolved));
  return snapshot.exists() ? (snapshot.val() as T) : null;
};

/**
 * Subscribes to real-time updates on a single value.
 *
 * @typeParam T - Expected value type.
 * @param path - Logical database path.
 * @param onChange - Callback invoked with the latest value (or `null`).
 * @returns Unsubscribe function.
 */
export const listenValue = async <T>(
  path: string,
  onChange: (value: T | null) => void
) => {
  const resolved = await resolvePath(path);
  const dbRef = ref(database, resolved);
  const handler = (snapshot: DataSnapshot) =>
    onChange(snapshot.exists() ? (snapshot.val() as T) : null);
  onValue(dbRef, handler);
  return () => off(dbRef, 'value', handler);
};
