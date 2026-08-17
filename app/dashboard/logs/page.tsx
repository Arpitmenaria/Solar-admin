"use client";

import { Header } from "@/components/layouts/header";
import { Monitor } from "lucide-react";
import { motion } from "framer-motion";

const MOCK_LOGS = [
  { id: 1, level: "INFO", message: "User @marcus_v logged in from 192.168.1.100", ts: "2026-06-18 09:12:04" },
  { id: 2, level: "WARN", message: "Rate limit approached for endpoint /api/posts", ts: "2026-06-18 09:10:21" },
  { id: 3, level: "ERROR", message: "Failed payment transaction #TXN-884421 for user @shadow_882", ts: "2026-06-18 09:08:55" },
  { id: 4, level: "INFO", message: "New user registered: sjm_82@flow.com", ts: "2026-06-18 09:05:10" },
  { id: 5, level: "INFO", message: "Moderation action: post #P-44291 removed for policy violation", ts: "2026-06-18 08:58:33" },
  { id: 6, level: "WARN", message: "Suspicious login attempt from IP 10.0.4.22", ts: "2026-06-18 08:44:11" },
];

const LEVEL_STYLE: Record<string, string> = {
  INFO: "text-blue-400 bg-blue-400/10 border-blue-500/30",
  WARN: "text-yellow-400 bg-yellow-400/10 border-yellow-500/30",
  ERROR: "text-red-400 bg-red-400/10 border-red-500/30",
};

export default function LogsPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header
        title="System Logs"
        breadcrumbs={[{ label: "System Logs" }]}
       
      />
      <main className="flex-1 p-4 md:p-6 space-y-5">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">System Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time infrastructure event log.</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-xl border border-white/[0.08] bg-[#0d1321] overflow-hidden"
        >
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-white/[0.06]">
            <Monitor size={15} className="text-[#3b82f6]" />
            <span className="text-sm font-semibold text-white">Event Stream</span>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          <div className="font-mono text-xs">
            {MOCK_LOGS.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-4 px-6 py-3 border-b border-white/[0.04] hover:bg-white/[0.02]"
              >
                <span className="shrink-0 text-[#3a4a6a]">{log.ts}</span>
                <span className={`shrink-0 border rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${LEVEL_STYLE[log.level]}`}>
                  {log.level}
                </span>
                <span className="text-slate-300">{log.message}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
