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

  useEffect(() => {
    if (hydrated && !token) router.replace("/login");
  }, [hydrated, token, router]);

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
