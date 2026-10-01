"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore, useAuthHydrated } from "@/store/auth.store";

/* Figma: content area has a rgba(63,72,82,0.10) → transparent gradient overlay */
const CONTENT_GRADIENT = "linear-gradient(180deg, rgba(63,72,82,0.10) 0%, rgba(63,72,82,0) 100%)";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const token = useAuthStore((s) => s.token);
  const expiresAt = useAuthStore((s) => s.expiresAt);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!hydrated) return;

    const expireSession = () => {
      logout();
      router.replace("/login");
    };

    if (!token || !expiresAt || expiresAt <= Date.now()) {
      expireSession();
      return;
    }

    const timeout = window.setTimeout(expireSession, expiresAt - Date.now());
    const checkExpiry = () => {
      if (expiresAt <= Date.now()) expireSession();
    };

    // Timers can be suspended while the browser is in the background.
    window.addEventListener("focus", checkExpiry);
    window.addEventListener("pageshow", checkExpiry);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("focus", checkExpiry);
      window.removeEventListener("pageshow", checkExpiry);
    };
  }, [hydrated, token, expiresAt, logout, router]);

  if (!hydrated || !token) return null;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Sidebar />

      {/* Desktop lg+ — sidebar width animates */}
      <motion.div
        animate={{ paddingLeft: sidebarCollapsed ? 64 : 238 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="hidden lg:flex flex-col min-h-screen pt-[52px]"
        style={{ background: CONTENT_GRADIENT }}
      >
        {children}
      </motion.div>

      {/* Tablet md–lg — fixed 64px offset */}
      <div
        className="hidden md:flex lg:hidden flex-col min-h-screen pt-[52px] pl-[64px]"
        style={{ background: CONTENT_GRADIENT }}
      >
        {children}
      </div>

      {/* Mobile — no sidebar offset */}
      <div
        className="flex md:hidden flex-col min-h-screen pt-[52px]"
        style={{ background: CONTENT_GRADIENT }}
      >
        {children}
      </div>
    </div>
  );
}
