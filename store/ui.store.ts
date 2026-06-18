"use client";

import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;   // desktop icon-only mode
  mobileOpen: boolean;         // mobile drawer open
  toggleSidebar: () => void;
  setMobileOpen: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mobileOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMobileOpen: (v) => set({ mobileOpen: v }),
}));
