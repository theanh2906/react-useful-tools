/**
 * @module services/storageService
 * @description Firebase Cloud Storage file management service.
 * Provides file listing, upload, and deletion operations.
 * Authenticated paths are scoped under `users/{uid}/...`.
 */

import { auth, storage } from '@/config/firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  getMetadata,
  deleteObject,
} from 'firebase/storage';
import type { FileInfo } from '@/types';
import { getFileType } from '@/lib/utils';

/**
 * Returns Storage path `users/{uid}/{relativePath}` (no leading/trailing slashes on segments).
 * @param relativePath - Path relative to the user root; empty string = user root folder.
 * @throws If no user is signed in.
 */
export const resolveStoragePath = (relativePath: string): string => {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('You must be signed in to use cloud storage.');
  }
  const trimmed = relativePath.replace(/^\/+|\/+$/g, '');
  return trimmed ? `users/${uid}/${trimmed}` : `users/${uid}`;
};

/**
 * When signed in: `users/{uid}/{relativePath}`.
 * When anonymous: `relativePath` only (e.g. `live-share/{roomId}` for temporary rooms).
 */
export const resolveStoragePathOrLegacy = (relativePath: string): string => {
  const uid = auth.currentUser?.uid;
  const trimmed = relativePath.replace(/^\/+|\/+$/g, '');
  if (!uid) {
    return trimmed;
  }
  return trimmed ? `users/${uid}/${trimmed}` : `users/${uid}`;
};

/**
 * Lists all files from Firebase Storage at a given path.
 *
 * Retrieves metadata and download URLs for each file.
 * Files are sorted by creation date (newest first).
 *
 * @param path - Storage path to list files from.
 * @returns Array of `FileInfo` objects, or empty array on error.
 */
export const listFiles = async (path: string): Promise<FileInfo[]> => {
  try {
    console.log('[Storage] Listing files from:', path);

    // List files directly from the path
    const result = await listAll(ref(storage, path));
    console.log(
      '[Storage] Found items:',
      result.items.length,
      'prefixes:',
      result.prefixes.length
    );

    if (result.items.length === 0) {
      console.log('[Storage] No files found in path:', path);
      return [];
    }

    const files = await Promise.all(
      result.items.map(async (itemRef) => {
        try {
          const metadata = await getMetadata(itemRef);
          const url = await getDownloadURL(itemRef);
          const name = itemRef.name;
          const type = metadata.contentType || getFileType(name);

          return {
            id: itemRef.fullPath,
            name,
            size: metadata.size,
            type,
            path: itemRef.fullPath,
            url,
            createdAt: metadata.timeCreated || new Date().toISOString(),
          } as FileInfo;
        } catch (err) {
          console.warn(
            '[Storage] Failed to get metadata for:',
            itemRef.fullPath,
            err
          );
          return null;
        }
      })
    );

    const validFiles = files.filter((f): f is FileInfo => f !== null);
    console.log('[Storage] Loaded files:', validFiles.length);

    return validFiles.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('[Storage] Error listing files:', error);
    return [];
  }
};

/**
 * Uploads a file to Firebase Storage at a given path.
 *
 * @param path - Storage directory path.
 * @param file - The file to upload.
 * @returns `FileInfo` object with the uploaded file's metadata and download URL.
 */
export const uploadFile = async (path: string, file: File) => {
  const fileRef = ref(storage, `${path}/${file.name}`);
  console.log('[Storage] Uploading to:', fileRef.fullPath);

  const snapshot = await uploadBytes(fileRef, file);
  const url = await getDownloadURL(snapshot.ref);
  const metadata = await getMetadata(snapshot.ref);

  return {
    id: snapshot.ref.fullPath,
    name: file.name,
    size: metadata.size,
    type: metadata.contentType || getFileType(file.name),
    path: snapshot.ref.fullPath,
    url,
    createdAt: metadata.timeCreated || new Date().toISOString(),
  } as FileInfo;
};

/**
 * Deletes a file from Firebase Storage.
 *
 * @param fullPath - Full storage path of the file to delete.
 */
export const deleteFile = async (fullPath: string) => {
  const fileRef = ref(storage, fullPath);
  await deleteObject(fileRef);
};
