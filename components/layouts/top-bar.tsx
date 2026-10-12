"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Menu,
  LogOut,
  CheckCheck,
  Sun,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { INITIAL_NOTIFICATIONS } from "@/constants/solar-data";
import type { SolarNotification, SolarNotificationSeverity } from "@/types";

const SEVERITY_ICONS: Record<SolarNotificationSeverity, { icon: typeof Info; color: string; bg: string }> = {
  info:    { icon: Info,          color: "text-blue-400",   bg: "bg-blue-500/10"   },
  success: { icon: CheckCircle2,  color: "text-emerald-400",bg: "bg-emerald-500/10"},
  warning: { icon: AlertTriangle, color: "text-amber-400",  bg: "bg-amber-500/10"  },
  alert:   { icon: AlertTriangle, color: "text-rose-400",   bg: "bg-rose-500/10"   },
};

function NotificationPortal({
  open,
  anchorRef,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClose,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  notifications: SolarNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}) {
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const [mounted, setMounted] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 10, right: window.innerWidth - rect.right });
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target)) return;
      const panel = document.getElementById("solar-notif-panel");
      if (panel && !panel.contains(target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, anchorRef, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          id="solar-notif-panel"
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999, width: 360 }}
          className="max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-white/[0.12] bg-[#0c1322] shadow-2xl shadow-black/70 backdrop-blur-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Sun size={15} className="text-amber-400" />
              <span className="text-[13px] font-semibold text-white">Solar Alerts & Telemetry</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-slate-950 leading-none">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-400 transition-colors hover:text-amber-300"
            >
              <CheckCheck size={12} />
              Mark all read
            </button>
          </div>

          {/* List */}
          <div className="divide-y divide-white/[0.06] max-h-[380px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-[12px] text-slate-400">
                All systems operating normally. No alerts.
              </p>
            ) : (
              notifications.map((n) => {
                const meta = SEVERITY_ICONS[n.severity] ?? SEVERITY_ICONS.info;
                const Icon = meta.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => onMarkRead(n.id)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04] ${
                      n.read ? "opacity-75" : "bg-amber-500/[0.03]"
                    }`}
                  >
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}>
                      <Icon size={14} className={meta.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[12px] font-semibold text-slate-200 leading-snug">
                          {n.title}
                        </p>
                        {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />}
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                        {n.message}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">{n.timestamp}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function TopBar() {
  const { setMobileOpen } = useUIStore();
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<SolarNotification[]>(INITIAL_NOTIFICATIONS);
  const bellRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleMarkRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  }

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 flex h-[52px] items-center justify-between border-b border-white/[0.06] bg-[#080c16] px-4 md:px-5">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.06] md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500 text-slate-950 font-bold">
              <Sun size={15} />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white">
              Sparrow Solar Admin
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 ml-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Grid Interconnected · 100% Normal
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Notifications bell */}
          <motion.button
            ref={bellRef}
            aria-label="Notifications"
            onClick={() => setNotifOpen((v) => !v)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              notifOpen
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/40"
                : "border border-white/[0.08] text-slate-400 hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-slate-200"
            }`}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-slate-950 shadow-md">
                {unreadCount}
              </span>
            )}
          </motion.button>

          {/* Divider */}
          <div className="h-5 w-px bg-white/[0.08]" />

          {/* Logout button */}
          <motion.button
            aria-label="Logout"
            onClick={() => {
              logout();
              toast.info("Logged out successfully");
              router.push("/login");
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/15 px-3 py-1.5 text-[12px] font-semibold text-rose-300 transition-all hover:bg-rose-500/25 hover:text-rose-200 active:scale-[0.98]"
          >
            <LogOut size={13} />
            Sign Out
          </motion.button>
        </div>
      </header>

      <NotificationPortal
        open={notifOpen}
        anchorRef={bellRef}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        onClose={() => setNotifOpen(false)}
      />
    </>
  );
}
