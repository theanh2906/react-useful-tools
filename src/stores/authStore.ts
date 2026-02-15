/**
 * @module stores/authStore
 * @description Authentication state store.
 * Manages user session, login/logout, token expiration, and Firebase auth listener.
 * Persisted to session storage.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';
import type { User as FirebaseUser } from 'firebase/auth';
import { signOutUser, subscribeToAuthChanges } from '@/services/authService';
import { clearResolvedPathCache } from '@/services/realtimeDb';

/** Authentication state shape and actions. */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  checkTokenExpiration: () => boolean;
  setUserFromFirebase: (firebaseUser: FirebaseUser | null) => Promise<void>;
  initAuthListener: () => () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      logout: () => {
        signOutUser().catch(() => undefined);
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      checkTokenExpiration: () => {
        const { user } = get();
        if (!user) return false;

        const now = Date.now();
        if (now >= user.tokenExpirationIn) {
          get().logout();
          return false;
        }
        return true;
      },

      setUserFromFirebase: async (firebaseUser) => {
        if (!firebaseUser) {
          clearResolvedPathCache();
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        const tokenResult = await firebaseUser.getIdTokenResult();
        const expiration = new Date(tokenResult.expirationTime).getTime();

        clearResolvedPathCache();
        set({
          user: {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || undefined,
            photoURL: firebaseUser.photoURL || undefined,
            token: tokenResult.token,
            tokenExpirationIn: expiration,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      initAuthListener: () => {
        set({ isLoading: true });
        return subscribeToAuthChanges((firebaseUser) => {
          get().setUserFromFirebase(firebaseUser);
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
