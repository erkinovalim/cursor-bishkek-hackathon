import type { RegisteredUser } from "./auth-types";

const STORAGE_KEY = "daily-quest-user";

export function loadRegisteredUser(): RegisteredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RegisteredUser;
  } catch {
    return null;
  }
}

export function saveRegisteredUser(user: RegisteredUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearRegisteredUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}
