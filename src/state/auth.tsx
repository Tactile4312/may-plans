import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as fbSignOut, type User } from "firebase/auth";
import { auth, firebaseReady } from "../lib/firebase";
import { logins } from "../config";
import type { PartnerKey } from "../lib/types";

interface AuthState {
  /** true once we know whether someone is signed in */
  ready: boolean;
  user: User | null;
  /** which partner is signed in, from their email */
  me: PartnerKey | null;
  /** false when Firebase isn't set up: the app runs without login */
  needsLogin: boolean;
  signIn: (loginIndex: number, passcode: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!firebaseReady);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);
    });
  }, []);

  const idx = user ? logins.findIndex((l) => l.email.toLowerCase() === (user.email ?? "").toLowerCase()) : -1;
  const me: PartnerKey | null = idx === 0 ? "p1" : idx === 1 ? "p2" : null;

  const value: AuthState = {
    ready,
    user,
    me,
    needsLogin: firebaseReady,
    signIn: async (i, passcode) => {
      if (!auth) return;
      await signInWithEmailAndPassword(auth, logins[i].email, passcode);
    },
    signOut: () => {
      if (auth) fbSignOut(auth);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
