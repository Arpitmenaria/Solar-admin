"use client";

import { Header } from "@/components/layouts/header";
import { SectionCard } from "@/components/shared/section-card";
import { useModerationQueue } from "@/hooks/use-users";
import { Shield, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";

const MODERATION_COLORS: Record<string, string> = {
  "Policy Violation": "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  "Spam Detection": "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  "Harassment": "bg-red-500/20 text-red-400 border border-red-500/30",
};

export default function ModerationPage() {
  const { data: items } = useModerationQueue();

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Content Moderation"
        breadcrumbs={[{ label: "Content Moderation" }]}
       
      />
      <main className="flex-1 p-4 md:p-6 space-y-5">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">Content Moderation</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and action pending violations.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <SectionCard
            title="Pending Violations"
            icon={Shield}
            headerRight={
              <span className="text-[10px] font-bold tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 rounded px-2 py-0.5">
                CRITICAL
              </span>
            }
          >
            <div className="space-y-3 max-w-2xl">
              {(items ?? []).map((item) => (
                <div key={item.id} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-[#1a2a4a] flex items-center justify-center text-xs font-bold text-blue-400">
                        {item.username.slice(1, 3).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{item.username}</p>
                        <p className="text-xs text-muted-foreground">Reported {item.reportedAt}</p>
                      </div>
                    </div>
                    <button className="text-[#3a4a6a] hover:text-slate-300">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  <div className="mt-3">
                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold ${MODERATION_COLORS[item.type] ?? ""}`}>
                      {item.type}
                    </span>
                    <p className="mt-2 text-sm text-muted-foreground">{item.excerpt}</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors">
                      Remove Content
                    </button>
                    <button className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-white/[0.05] transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </motion.div>
      </main>
    </div>
  );
}
