/**
 * @module services/realtimeDb
 * @description Generic Firebase Realtime Database abstraction layer.
 * Provides path-resolved CRUD operations with automatic user-scoping.
 *
 * Path resolution:
 * - **Authenticated:** `users/{uid}/{logicalPath}` for private app data.
 * - **Exception:** paths starting with `liveShare` stay at the database root so
 *   share rooms work for both signed-in and guest participants.
 * - **Anonymous:** logical path as-is (e.g. public or legacy reads).
 *
 * Legacy data that still lives at the database root is **not** merged automatically;
 * migrate via Firebase Console or a one-off script to `users/{uid}/...` if needed.
 *
 * Cache keys include the current uid so switching accounts does not reuse wrong paths.
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
import { toast } from '@/components/ui/Toast';

/** Callback type for collection listeners. */
type Listener<T> = (items: T[]) => void;

/** @internal Cache of resolved database paths to avoid repeated lookups. */
const resolvedPathCache = new Map<string, string>();

/** @internal Tracks the last time a local write occurred to suppress local update toasts. */
let lastLocalWriteTime = 0;

/** @internal Records a local write to prevent immediate toasts for self-made changes. */
const recordLocalWrite = () => {
  lastLocalWriteTime = Date.now();
};

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
 * @internal
 */
const resolvePath = async (path: string) => {
  const uid = getUserId();
  const cacheKey = `${uid ?? '__anon__'}:${path}`;

  if (resolvedPathCache.has(cacheKey)) {
    console.log(
      `[RealtimeDB] Using cached path for "${path}" (${cacheKey}):`,
      resolvedPathCache.get(cacheKey)
    );
    return resolvedPathCache.get(cacheKey)!;
  }

  console.log(`[RealtimeDB] Resolving path "${path}" for user:`, uid);

  if (!uid) {
    console.log(`[RealtimeDB] No user, using root path: "${path}"`);
    resolvedPathCache.set(cacheKey, path);
    return path;
  }

  if (path === 'liveShare' || path.startsWith('liveShare/')) {
    console.log(`[RealtimeDB] Live Share root path (shared): "${path}"`);
    resolvedPathCache.set(cacheKey, path);
    return path;
  }

  const scopedPath = `users/${uid}/${path}`;
  console.log(`[RealtimeDB] Using user-scoped path: "${scopedPath}"`);
  resolvedPathCache.set(cacheKey, scopedPath);
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
  let isInitialLoad = true;

  const handler = (snapshot: DataSnapshot) => {
    const data = mapSnapshotToArray<T>(snapshot);
    console.log(
      `[RealtimeDB] Data received from "${resolved}":`,
      data.length,
      'items'
    );
    onChange(data);

    if (!isInitialLoad && Date.now() - lastLocalWriteTime > 1500) {
      toast.info('Data synced', `Background updates received for ${path}`);
    }
    isInitialLoad = false;
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
  recordLocalWrite();
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
  recordLocalWrite();
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
  recordLocalWrite();
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
  recordLocalWrite();
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
  let isInitialLoad = true;

  const handler = (snapshot: DataSnapshot) => {
    onChange(snapshot.exists() ? (snapshot.val() as T) : null);
    
    if (!isInitialLoad && Date.now() - lastLocalWriteTime > 1500) {
      toast.info('Data synced', `Background updates received for ${path}`);
    }
    isInitialLoad = false;
  };
  onValue(dbRef, handler);
  return () => off(dbRef, 'value', handler);
};
