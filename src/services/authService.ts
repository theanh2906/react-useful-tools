/**
 * @module services/authService
 * @description Authentication service providing email/password, Google, and Azure AD login.
 * Wraps Firebase Authentication and Microsoft MSAL for multi-provider sign-in.
 */

import { auth } from '@/config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  OAuthProvider,
} from 'firebase/auth';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '@/config/authConfig';

/** MSAL (Microsoft Authentication Library) client instance. */
export const msalInstance = new PublicClientApplication(msalConfig);
let isMsalInitialized = false;

/**
 * Initializes the MSAL instance (idempotent).
 * Must be called before any Azure AD operations.
 */
const initializeMsal = async () => {
  if (!isMsalInitialized) {
    await msalInstance.initialize();
    isMsalInitialized = true;
  }
};

/**
 * Creates a new user account with email and password.
 *
 * @param email - User's email address.
 * @param password - User's chosen password.
 * @returns Firebase `UserCredential` for the newly created account.
 */
export const signUpWithEmail = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Signs in an existing user with email and password.
 *
 * @param email - User's email address.
 * @param password - User's password.
 * @returns Firebase `UserCredential`.
 */
export const signInWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Signs in using Google OAuth via a popup window.
 *
 * @returns Firebase `UserCredential` from Google sign-in.
 */
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

/**
 * Signs in using Azure AD (Microsoft) via MSAL popup + Firebase.
 *
 * First authenticates with Microsoft via MSAL popup, then uses Firebase's
 * Microsoft OAuthProvider to create a Firebase user session.
 *
 * @returns Firebase `UserCredential` from Microsoft sign-in.
 * @throws {Error} If MSAL or Firebase Microsoft auth fails.
 */
export const signInWithAzure = async () => {
  await initializeMsal();

  try {
    // 1. Login with Microsoft via PopUp
    await msalInstance.loginPopup(loginRequest);
    // const { accessToken } = loginResponse;

    // 2. Since Firebase doesn't directly support generic OIDC for all plans or requires setup,
    // For this 'Useful Tools' scope, we will treat the Azure Auth as a successful client-side auth
    // and ideally link it to Firebase via OAuthProvider if configured.
    // However, to strictly follow the request of just "Implementing missing parts",
    // we will use Firebase's Microsoft Auth Provider which is simpler if enabled in Console.

    // METHOD A: Firebase Microsoft Provider (Preferred for Firebase Apps)
    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({
      tenant: import.meta.env.VITE_AZURE_TENANT_ID || 'common',
    });

    return signInWithPopup(auth, provider);
  } catch (error) {
    console.warn(
      'Firebase Microsoft Auth failed, falling back to pure MSAL or throwing error',
      error
    );
    // Fallback or re-throw
    // If we wanted to use just MSAL purely without Firebase Sync, we would return the MSAL user
    // BUt the whole app depends on Firebase User object (auth.currentUser).
    throw error;
  }
};

/**
 * Note: For Azure AD to work with Firebase:
 * 1. Enable "Microsoft" sign-in method in Firebase Console -> Authentication -> Sign-in method.
 * 2. Add the "Application (client) ID" and "Client Secret" from Azure Portal to Firebase.
 * 3. Add the callback URL from Firebase to Azure Portal -> Authentication -> Redirect URIs.
 */

/**
 * Signs out the current user from both MSAL and Firebase.
 * Handles MSAL logout popup if an active account exists.
 */
export const signOutUser = async () => {
  await initializeMsal(); // Ensure instance is ready
  const account = msalInstance.getActiveAccount();
  if (account) {
    await msalInstance.logoutPopup();
  }
  return signOut(auth);
};

/**
 * Subscribes to Firebase auth state changes.
 *
 * @param callback - Invoked with the Firebase `User` (or `null` on sign-out).
 * @returns Unsubscribe function to stop listening.
 */
export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};
