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

type Listener<T> = (items: T[]) => void;

const resolvedPathCache = new Map<string, string>();

const getUserId = () => auth.currentUser?.uid || null;

export const clearResolvedPathCache = () => {
  resolvedPathCache.clear();
};

const mapSnapshotToArray = <T extends { id?: string }>(snapshot: DataSnapshot): T[] => {
  if (!snapshot.exists()) return [];
  const value = snapshot.val();
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  return Object.entries(value).map(([id, item]) => ({ ...(item as object), id })) as T[];
};

const resolvePath = async (path: string) => {
  if (resolvedPathCache.has(path)) {
    console.log(`[RealtimeDB] Using cached path for "${path}":`, resolvedPathCache.get(path));
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
    console.log(`[RealtimeDB] Scoped path "${scopedPath}" exists:`, scopedSnap.exists());
    if (scopedSnap.exists()) {
      resolvedPathCache.set(path, scopedPath);
      return scopedPath;
    }
  } catch (e) {
    console.log(`[RealtimeDB] Error checking scoped path "${scopedPath}":`, e);
  }

  // Default to scoped path for new data
  console.log(`[RealtimeDB] No data found, defaulting to scoped path: "${scopedPath}"`);
  resolvedPathCache.set(path, scopedPath);
  return scopedPath;
};

export const listenCollection = async <T extends { id?: string }>(
  path: string,
  onChange: Listener<T>
) => {
  const resolved = await resolvePath(path);
  console.log(`[RealtimeDB] Listening to collection at: "${resolved}"`);
  const dbRef = ref(database, resolved);
  const handler = (snapshot: DataSnapshot) => {
    const data = mapSnapshotToArray<T>(snapshot);
    console.log(`[RealtimeDB] Data received from "${resolved}":`, data.length, 'items');
    onChange(data);
  };
  onValue(dbRef, handler);
  return () => off(dbRef, 'value', handler);
};

export const fetchCollection = async <T extends { id?: string }>(path: string) => {
  const resolved = await resolvePath(path);
  const snapshot = await get(ref(database, resolved));
  return mapSnapshotToArray<T>(snapshot);
};

export const createItem = async <T extends Record<string, any>>(path: string, data: T) => {
  const resolved = await resolvePath(path);
  const collectionRef = ref(database, resolved);
  const newRef = push(collectionRef);
  await set(newRef, data);
  return newRef.key!;
};

export const updateItem = async <T extends Record<string, any>>(path: string, id: string, data: T) => {
  const resolved = await resolvePath(path);
  const itemRef = ref(database, `${resolved}/${id}`);
  await update(itemRef, data);
};

export const deleteItem = async (path: string, id: string) => {
  const resolved = await resolvePath(path);
  const itemRef = ref(database, `${resolved}/${id}`);
  await remove(itemRef);
};

export const setValue = async <T>(path: string, data: T) => {
  const resolved = await resolvePath(path);
  await set(ref(database, resolved), data);
};

export const fetchValue = async <T>(path: string) => {
  const resolved = await resolvePath(path);
  const snapshot = await get(ref(database, resolved));
  return snapshot.exists() ? (snapshot.val() as T) : null;
};

export const listenValue = async <T>(path: string, onChange: (value: T | null) => void) => {
  const resolved = await resolvePath(path);
  const dbRef = ref(database, resolved);
  const handler = (snapshot: DataSnapshot) => onChange(snapshot.exists() ? (snapshot.val() as T) : null);
  onValue(dbRef, handler);
  return () => off(dbRef, 'value', handler);
};
