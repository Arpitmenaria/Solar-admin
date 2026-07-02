"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Monitor } from "lucide-react";
import type { EducationActivityAction, EducationEntityType } from "@/constants/education-mock-data";
import { useEducationActivity } from "@/hooks/use-education-activity";

const ACTION_STYLE: Record<EducationActivityAction, string> = {
  CREATED: "text-blue-400 bg-blue-400/10 border-blue-500/30",
  UPDATED: "text-slate-300 bg-white/[0.05] border-white/[0.15]",
  PUBLISHED: "text-emerald-400 bg-emerald-400/10 border-emerald-500/30",
  ARCHIVED: "text-orange-400 bg-orange-400/10 border-orange-500/30",
  DELETED: "text-red-400 bg-red-400/10 border-red-500/30",
};

const FILTERS: (EducationEntityType | "All")[] = ["All", "Course", "Resource"];

export function ActivityLogList() {
  const { data: activity, isLoading } = useEducationActivity();
  const [filter, setFilter] = useState<EducationEntityType | "All">("All");

  const filtered = (activity ?? []).filter((a) => filter === "All" || a.entityType === filter);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0d1321] overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-6 py-4">
        <Monitor size={15} className="text-[#3b82f6]" />
        <span className="text-sm font-semibold text-white">Education Activity</span>
        <div className="ml-auto flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                filter === f ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="font-mono text-xs">
        {isLoading && <div className="px-6 py-6 text-slate-500">Loading…</div>}
        {!isLoading && filtered.length === 0 && (
          <div className="px-6 py-6 text-slate-500">No activity recorded yet.</div>
        )}
        {filtered.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i, 10) * 0.04 }}
            className="flex flex-wrap items-start gap-4 border-b border-white/[0.04] px-6 py-3 hover:bg-white/[0.02]"
          >
            <span className="shrink-0 text-[#3a4a6a]">{entry.timestamp}</span>
            <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${ACTION_STYLE[entry.action]}`}>
              {entry.action}
            </span>
            <span className="shrink-0 text-slate-500">{entry.entityType}</span>
            <span className="text-slate-300">
              <span className="text-slate-500">{entry.adminName} — </span>
              {entry.entityName}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
