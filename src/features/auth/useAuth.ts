import { useEffect, useRef, useState } from "react";

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";

import { auth, googleProvider } from "../../lib/firebase";
import { devSignIn } from "./devAuth";

export type AuthState = {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const devTried = useRef(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (next) => {
      setUser(next);
      setLoading(false);
      // In dev, auto sign-in to the emulator so the app is reachable without
      // driving the real Google popup.
      if (import.meta.env.DEV && !next && !devTried.current) {
        devTried.current = true;
        void devSignIn();
      }
    });
  }, []);

  return {
    user,
    loading,
    signIn: async () => {
      await signInWithPopup(auth, googleProvider);
    },
    logOut: async () => {
      await signOut(auth);
    },
  };
}
