"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Menu, LogOut, CheckCheck, Zap, Users, ShieldAlert, CreditCard } from "lucide-react";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

const NOTIFICATIONS = [
  {
    id: 1,
    icon: ShieldAlert,
    iconColor: "text-red-400",
    iconBg: "bg-red-500/10",
    title: "New flagged user",
    desc: "User @dark_knight99 was flagged for policy violation.",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    icon: Users,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    title: "Group report submitted",
    desc: "Group \"Night Owls\" received 3 reports in the last hour.",
    time: "18m ago",
    unread: true,
  },
  {
    id: 3,
    icon: CreditCard,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    title: "Premium subscription spike",
    desc: "Premium upgrades up 24% today vs. yesterday.",
    time: "1h ago",
    unread: true,
  },
  {
    id: 4,
    icon: Zap,
    iconColor: "text-yellow-400",
    iconBg: "bg-yellow-500/10",
    title: "System latency alert",
    desc: "API response time exceeded 300ms threshold briefly.",
    time: "3h ago",
    unread: false,
  },
];

function NotificationPortal({
  open,
  anchorRef,
  onClose,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const [mounted, setMounted] = useState(false);
  const [unreadIds, setUnreadIds] = useState(new Set(NOTIFICATIONS.filter((n) => n.unread).map((n) => n.id)));

  useEffect(() => { setMounted(true); }, []);

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
      const panel = document.getElementById("notif-panel");
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
          id="notif-panel"
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999, width: 340 }}
          className="overflow-hidden rounded-xl border border-white/[0.10] bg-[#0d1321] shadow-2xl shadow-black/60"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell size={13} className="text-blue-400" />
              <span className="text-[12px] font-semibold text-white">Notifications</span>
              {unreadIds.size > 0 && (
                <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                  {unreadIds.size}
                </span>
              )}
            </div>
            <button
              onClick={() => setUnreadIds(new Set())}
              className="flex items-center gap-1 text-[11px] text-[#3a4d6a] transition-colors hover:text-blue-400"
            >
              <CheckCheck size={11} />
              Mark all read
            </button>
          </div>

          {/* Items */}
          <div className="divide-y divide-white/[0.05]">
            {NOTIFICATIONS.map((n) => {
              const Icon = n.icon;
              const isUnread = unreadIds.has(n.id);
              return (
                <motion.button
                  key={n.id}
                  onClick={() => setUnreadIds((prev) => { const s = new Set(prev); s.delete(n.id); return s; })}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors"
                >
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${n.iconBg}`}>
                    <Icon size={14} className={n.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12px] font-semibold text-slate-200 leading-tight">{n.title}</p>
                      {isUnread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-[#4a5a7a]">{n.desc}</p>
                    <p className="mt-1 text-[10px] text-[#2e3d57]">{n.time}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.07] px-4 py-2.5">
            <button className="w-full text-center text-[11px] text-[#3a4d6a] transition-colors hover:text-blue-400">
              View all notifications
            </button>
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
  const bellRef = useRef<HTMLButtonElement>(null);
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 flex h-[52px] items-center justify-between border-b border-white/[0.06] bg-background px-4 md:px-5">

        {/* Left */}
        <div className="flex items-center gap-2">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-icon-muted transition-colors hover:bg-white/[0.06] md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>
          <span className="text-[15px] font-bold tracking-[-0.2px] text-blue-500">
            Social Platform Admin
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2.5">

          {/* Bell */}
          <motion.button
            ref={bellRef}
            aria-label="Notifications"
            onClick={() => setNotifOpen((v) => !v)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              notifOpen
                ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                : "border border-white/[0.07] text-icon-muted hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-slate-200"
            }`}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-md shadow-blue-600/40"
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>

          {/* Divider */}
          <div className="h-5 w-px bg-white/[0.07]" />

          {/* Logout */}
          <motion.button
            aria-label="Logout"
            onClick={() => { logout(); router.push("/login"); }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="group relative flex items-center gap-1.5 overflow-hidden rounded-lg bg-red-600 px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm shadow-red-600/20 transition-all hover:bg-red-700 hover:shadow-md hover:shadow-red-600/30"
          >
            <LogOut size={13} className="transition-transform group-hover:-translate-x-[1px] group-hover:rotate-[-4deg]" />
            Logout
          </motion.button>

        </div>
      </header>

      <NotificationPortal
        open={notifOpen}
        anchorRef={bellRef}
        onClose={() => setNotifOpen(false)}
      />
    </>
  );
}
