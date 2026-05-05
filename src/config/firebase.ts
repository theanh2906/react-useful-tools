/**
 * @module config/firebase
 * @description Firebase SDK initialization and service exports.
 * Configures Firebase App, Authentication, Realtime Database, and Cloud Storage
 * using environment variables defined in `.env`.
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

/**
 * Firebase project configuration.
 * Values are loaded from `VITE_FIREBASE_*` environment variables with sensible defaults.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'useful-tools-api.firebaseapp.com',
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    'https://useful-tools-api-default-rtdb.firebaseio.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'useful-tools-api',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'useful-tools-api.firebasestorage.app',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '740845971597',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.appId) {
  console.warn(
    'Firebase env vars missing. Please set NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_APP_ID.'
  );
}

/** Initialized Firebase application instance. */
export const app = initializeApp(firebaseConfig);

/** Firebase Authentication service instance. */
export const auth = getAuth(app);

/** Firebase Realtime Database service instance. */
export const database = getDatabase(app);

/** Firebase Cloud Storage service instance. */
export const storage = getStorage(app);
