"use client";

import { Header } from "@/components/layouts/header";
import { BarChart2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Analytics"
        breadcrumbs={[{ label: "Analytics" }]}
       
      />
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0d1321]">
            <BarChart2 size={28} className="text-[#3b82f6]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Analytics</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Detailed analytics and reporting dashboards coming soon.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
