"use client";

import { Header } from "@/components/layouts/header";
import { StatCard } from "@/components/shared/stat-card";
import { useDashboardStats } from "@/hooks/use-users";
import { Wallet, TrendingUp, Crown } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { motion } from "framer-motion";

export default function FinancialsPage() {
  const { data: stats } = useDashboardStats();
  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Financials"
        breadcrumbs={[{ label: "Financials" }]}
       
      />
      <main className="flex-1 p-6 space-y-5">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">Financials</h1>
          <p className="text-sm text-muted-foreground mt-1">Revenue and subscription metrics.</p>
        </motion.div>
        <motion.div
          className="grid grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <StatCard label="TOTAL EARNINGS" value={formatCurrency(stats?.totalEarnings ?? 0)} icon={Wallet} />
          <StatCard label="MONTHLY EARNINGS" value={formatCurrency(stats?.monthlyEarnings ?? 0)} icon={TrendingUp} />
          <StatCard label="PREMIUM USERS" value={formatNumber(stats?.totalPremiumUsers ?? 0)} icon={Crown} />
        </motion.div>
      </main>
    </div>
  );
}
