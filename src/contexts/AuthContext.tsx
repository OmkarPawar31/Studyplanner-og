import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebaseconfig';

// ─── Types ─────────────────────────────────────────────────────────────────

type AuthContextValue = {
  /** The currently authenticated Firebase user, or null if signed out. */
  user: User | null;
  /** True while onAuthStateChanged is resolving on first mount. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  logOut: () => Promise<void>;
};

// ─── Context ───────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to Firebase auth state changes
  useEffect(() => {
    if (!auth) {
      setUser(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Email + password sign-in
  const signIn = useCallback(async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase is not configured in this environment.');
    }
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  // Email + password registration; sets displayName immediately after creation
  const signUp = useCallback(
    async (email: string, password: string, displayName: string): Promise<User> => {
      if (!auth) {
        throw new Error('Firebase is not configured in this environment.');
      }
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName });
      // Refresh local state so displayName is immediately available
      setUser({ ...credential.user });
      return credential.user;
    },
    [],
  );

  // Google Sign-In via popup
  const signInWithGoogle = useCallback(async (): Promise<User> => {
    if (!auth || !googleProvider) {
      throw new Error('Firebase is not configured in this environment.');
    }
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  }, []);

  // Sign out
  const logOut = useCallback(async () => {
    if (!auth) {
      return;
    }
    await signOut(auth);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
