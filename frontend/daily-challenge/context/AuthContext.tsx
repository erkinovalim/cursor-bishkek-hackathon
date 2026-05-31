"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { RegisterRequest, RegisteredUser } from "@/lib/auth-types";
import { loadRegisteredUser, saveRegisteredUser } from "@/lib/auth-storage";

interface AuthContextValue {
  user: RegisteredUser | null;
  isOnboarded: boolean;
  isReady: boolean;
  completeRegistration: (data: RegisterRequest) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const listeners = new Set<() => void>();
let cachedUser: RegisteredUser | null | undefined;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getUserSnapshot(): RegisteredUser | null {
  if (cachedUser === undefined) {
    cachedUser = loadRegisteredUser();
  }
  return cachedUser;
}

function getServerSnapshot(): RegisteredUser | null {
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(subscribe, getUserSnapshot, getServerSnapshot);
  const isReady = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const completeRegistration = useCallback((data: RegisterRequest) => {
    const registered: RegisteredUser = {
      name: data.name.trim(),
      email: data.email.trim(),
      registeredAt: new Date().toISOString(),
    };
    saveRegisteredUser(registered);
    cachedUser = registered;
    emitChange();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isOnboarded: !!user,
        isReady,
        completeRegistration,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Clears stored registration — useful for testing onboarding again. */
export function resetAuthCache() {
  cachedUser = undefined;
  emitChange();
}
