"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  admin: AdminUser | null;
  setAuth: (token: string, admin: AdminUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      setAuth: (token, admin) => set({ token, admin }),
      logout: () => set({ token: null, admin: null }),
    }),
    { name: "kick-analyst-admin-auth" }
  )
);

// Persisted state loads from localStorage asynchronously on first client
// render — read this before trusting `token === null` to mean "logged out",
// otherwise a route guard can bounce a logged-in user back to /login.
// `.persist` is only attached once this runs in a browser (the middleware
// references `window.localStorage` while configuring, which throws during
// Next's SSR pass and is swallowed) so every access here is optional-chained,
// and the server snapshot is always "not hydrated" to avoid an SSR crash.
export function useAuthHydrated() {
  return useSyncExternalStore(
    (callback) => useAuthStore.persist?.onFinishHydration(callback) ?? (() => {}),
    () => useAuthStore.persist?.hasHydrated() ?? true,
    () => false
  );
}
