"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Zap,
  Activity,
  Leaf,
  RefreshCw,
  Download,
  CheckCircle2,
  SlidersHorizontal,
  BatteryCharging,
  Gauge,
  Radio,
  ExternalLink,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  DEFAULT_SOLAR_STATS,
  SOLAR_CHART_DATA,
  SOLAR_PLANTS,
} from "@/constants/solar-data";
import { cn, formatNumber } from "@/lib/utils";
import type { ChartPeriod, SolarPlant } from "@/types";

const SolarGenerationChart = dynamic(
  () =>
    import("@/components/shared/solar-generation-chart").then(
      (m) => m.SolarGenerationChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[240px] animate-pulse rounded-lg bg-white/[0.03]" />
    ),
  }
);

const PERIODS: { key: ChartPeriod; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function DashboardPage() {
  const [period, setPeriod] = useState<ChartPeriod>("weekly");
  const [plantFilter, setPlantFilter] = useState<"ALL" | "OPTIMAL" | "NORMAL">("ALL");
  const [selectedPlant, setSelectedPlant] = useState<SolarPlant | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);

  const chartData = SOLAR_CHART_DATA[period];

  const filteredPlants = SOLAR_PLANTS.filter((plant) => {
    if (plantFilter === "ALL") return true;
    return plant.status === plantFilter;
  });

  function handleRefresh() {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Solar telemetry refreshed. Live sensor stream synchronized.");
    }, 450);
  }

  function handleExportReport() {
    toast.success("Solar Telemetry Report generated!", {
      description: `Sparrow_Solar_${period.toUpperCase()}_Report.csv is ready.`,
    });
  }

  function handleRunDiagnostics() {
    setDiagnosticsRunning(true);
    toast.info("Initiating full array telemetry scan...");
    setTimeout(() => {
      setDiagnosticsRunning(false);
      toast.success("Diagnostic complete: All 48 inverters within nominal parameters.", {
        description: "Zero ground faults. Insulation resistance > 100 MΩ.",
      });
    }, 700);
  }

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
      {/* ── Top Header & Actions ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[26px] font-bold text-white tracking-tight">
              Solar Generation & Telemetry
            </h1>
            <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
              Live Feed
            </span>
          </div>
          <p className="mt-1 text-[13px] text-slate-400">
            Real-time performance metrics across active solar arrays, high-voltage inverters, and utility grid interconnects.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleRunDiagnostics}
            disabled={diagnosticsRunning}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-[12px] font-medium text-slate-200 transition-all hover:bg-white/[0.08] hover:border-white/[0.2] active:scale-[0.98] cursor-pointer"
          >
            <Radio size={14} className={cn("text-amber-400", diagnosticsRunning && "animate-pulse")} />
            {diagnosticsRunning ? "Running Diagnostics…" : "Run Diagnostic"}
          </button>

          <button
            type="button"
            onClick={handleExportReport}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-[12px] font-medium text-slate-200 transition-all hover:bg-white/[0.08] hover:border-white/[0.2] active:scale-[0.98] cursor-pointer"
          >
            <Download size={14} className="text-emerald-400" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-[12px] font-semibold text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw size={14} className={cn(isRefreshing && "animate-spin")} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* ── 4 Key Telemetry Stat Cards ── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <StatCard
            label="Total Solar Generation"
            value={`${DEFAULT_SOLAR_STATS.totalGenerationMwh} MWh`}
            icon={Sun}
            badge="+14.2% YoY"
            sub="284,600 kWh produced across all sites"
            className="border-amber-500/20 bg-gradient-to-b from-[#0f172a] to-[#0b1120]"
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <StatCard
            label="Inverters Online"
            value={`${DEFAULT_SOLAR_STATS.activeInverters} / ${DEFAULT_SOLAR_STATS.totalInverters}`}
            icon={Zap}
            badge="100% Operational"
            badgeClassName="border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
            sub="Zero tripped circuits · 3.82 MW Peak"
            className="border-white/[0.08] bg-gradient-to-b from-[#0f172a] to-[#0b1120]"
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <StatCard
            label="Grid Feed-in Export"
            value={`${DEFAULT_SOLAR_STATS.gridExportMwh} MWh`}
            icon={Activity}
            badge="Exporting"
            badgeClassName="border-blue-400/25 bg-blue-400/10 text-blue-300"
            sub="67.6% of generated solar fed to grid"
            className="border-white/[0.08] bg-gradient-to-b from-[#0f172a] to-[#0b1120]"
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <StatCard
            label="Carbon Offset (ESG)"
            value={`${DEFAULT_SOLAR_STATS.co2SavedTons} t`}
            icon={Leaf}
            badge="Mitigated"
            badgeClassName="border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
            sub="Equivalent to ~6,850 trees planted"
            className="border-white/[0.08] bg-gradient-to-b from-[#0f172a] to-[#0b1120]"
          />
        </motion.div>
      </motion.div>

      {/* ── Solar Generation vs Grid Export Interactive Chart ── */}
      <motion.div
        id="analytics"
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="rounded-xl border border-white/[0.08] bg-[#0c1322] p-5 md:p-6 shadow-xl"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">
                Power Generation & Grid Intertie Telemetry
              </h2>
              <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[10px] font-mono text-slate-300 uppercase">
                {period}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              Comparative curve: Total photovoltaic yield (kWh) vs. net utility export (kWh)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Period selector */}
            <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.02] p-0.5">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPeriod(p.key)}
                  className={cn(
                    "rounded-md px-3 py-1 text-[11px] font-medium transition-all cursor-pointer",
                    period === p.key
                      ? "bg-amber-500 font-bold text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Legend badges */}
            <div className="flex items-center gap-3 text-[12px] text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Solar Generation
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Grid Export
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Chart Canvas */}
        <div className="mt-6 min-h-[240px]">
          <SolarGenerationChart data={chartData} />
        </div>

        {/* Bottom Telemetry Metrics Strip */}
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-4 sm:grid-cols-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Est. Tariff Revenue
            </p>
            <p className="mt-1 text-[18px] font-bold text-amber-400">
              ${formatNumber(DEFAULT_SOLAR_STATS.estimatedRevenue)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Monthly Grid Savings
            </p>
            <p className="mt-1 text-[18px] font-bold text-emerald-400">
              ${formatNumber(DEFAULT_SOLAR_STATS.monthlySavings)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              System Efficiency PR
            </p>
            <p className="mt-1 text-[18px] font-bold text-white">
              {DEFAULT_SOLAR_STATS.efficiencyPercent}%
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Current Solar Irradiance
            </p>
            <p className="mt-1 text-[18px] font-bold text-sky-400">
              {DEFAULT_SOLAR_STATS.solarIrradiance} W/m²
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Grid Interconnect & Battery Status ── */}
      <motion.div
        id="grid"
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="rounded-xl border border-white/[0.08] bg-[#0c1322] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-400">
                Battery Storage Bank
              </span>
              <BatteryCharging size={18} className="text-emerald-400" />
            </div>
            <p className="mt-3 text-[26px] font-bold text-white">
              {DEFAULT_SOLAR_STATS.batteryStoragePercent}%
            </p>
            <p className="mt-1 text-[12px] text-slate-400">
              470 kWh stored · Ready for peak evening dispatch
            </p>
          </div>
          <div className="mt-4 w-full bg-white/[0.08] rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${DEFAULT_SOLAR_STATS.batteryStoragePercent}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0c1322] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-400">
                Grid Frequency & Voltage
              </span>
              <Gauge size={18} className="text-amber-400" />
            </div>
            <p className="mt-3 text-[26px] font-bold text-white">
              60.02 Hz
            </p>
            <p className="mt-1 text-[12px] text-slate-400">
              480V 3-Phase · Power factor 0.99 (Optimal)
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
            <CheckCircle2 size={13} />
            Utility Intertie Synchronized
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0c1322] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-400">
                Peak Generation Today
              </span>
              <Sun size={18} className="text-amber-400" />
            </div>
            <p className="mt-3 text-[26px] font-bold text-white">
              3,820 kW
            </p>
            <p className="mt-1 text-[12px] text-slate-400">
              Recorded at 13:45 · 99.4% of design capacity
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-amber-300 font-medium">
            <Sparkles size={13} />
            Highest generation in past 14 days
          </div>
        </div>
      </motion.div>

      {/* ── Active Solar Plants & Fields ── */}
      <motion.div
        id="plants"
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="rounded-xl border border-white/[0.08] bg-[#0c1322] p-5 md:p-6 shadow-xl"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-4">
          <div>
            <h2 className="text-base font-semibold text-white">
              Active Solar Plants & Array Status
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Monitored facilities, installed photovoltaic capacities, and real-time generation.
            </p>
          </div>

          {/* Plant filter tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.02] p-0.5">
            {(["ALL", "OPTIMAL", "NORMAL"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setPlantFilter(filter)}
                className={cn(
                  "rounded-md px-3 py-1 text-[11px] font-medium transition-all cursor-pointer",
                  plantFilter === filter
                    ? "bg-white/[0.1] text-white font-semibold"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {filter === "ALL" ? `All Plants (${SOLAR_PLANTS.length})` : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Plants Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Plant Facility</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Capacity (kWp)</th>
                <th className="py-3 px-3">Current Yield (kW)</th>
                <th className="py-3 px-3">Efficiency</th>
                <th className="py-3 px-3">Grid Status</th>
                <th className="py-3 px-3">Health</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-[13px]">
              {filteredPlants.map((plant) => (
                <tr
                  key={plant.id}
                  className="transition-colors hover:bg-white/[0.02] group"
                >
                  <td className="py-3 px-3 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                        <Sun size={14} />
                      </div>
                      <span>{plant.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[12px]">
                    {plant.location}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-200">
                    {formatNumber(plant.capacityKwp)} kWp
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-amber-300">
                    {formatNumber(plant.currentOutputKw)} kW
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-200">
                    {plant.efficiency}%
                  </td>
                  <td className="py-3 px-3">
                    <span className="rounded-md bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 text-[11px] text-slate-300">
                      {plant.gridStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={plant.status} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedPlant(plant)}
                      className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-300 cursor-pointer"
                    >
                      <span>Telemetry</span>
                      <ExternalLink size={11} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Slide-over Modal for Plant Telemetry Details ── */}
      <AnimatePresence>
        {selectedPlant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-2xl border border-white/[0.12] bg-[#0c1322] p-6 shadow-2xl shadow-black/80"
            >
              <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                    <Sun size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {selectedPlant.name}
                    </h3>
                    <p className="text-[12px] text-slate-400 mt-0.5">
                      {selectedPlant.location}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlant(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      Installed Capacity
                    </p>
                    <p className="mt-1 text-lg font-bold text-white font-mono">
                      {selectedPlant.capacityKwp} kWp
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      Real-time Generation
                    </p>
                    <p className="mt-1 text-lg font-bold text-amber-400 font-mono">
                      {selectedPlant.currentOutputKw} kW
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      Performance Ratio
                    </p>
                    <p className="mt-1 text-lg font-bold text-emerald-400 font-mono">
                      {selectedPlant.efficiency}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      Active Inverters
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-100 font-mono">
                      {selectedPlant.invertersCount} Units
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-2 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Commission Date:</span>
                    <span className="text-slate-200">{selectedPlant.installedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Grid Intertie Mode:</span>
                    <span className="text-slate-200">{selectedPlant.gridStatus}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">System Health:</span>
                    <StatusBadge status={selectedPlant.status} />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    toast.success(`Plant diagnostic initiated for ${selectedPlant.name}`);
                    setSelectedPlant(null);
                  }}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-[12px] font-semibold text-slate-950 transition-colors hover:bg-amber-400 cursor-pointer"
                >
                  Run Plant Diagnostic
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlant(null)}
                  className="rounded-lg border border-white/[0.1] px-4 py-2 text-[12px] font-medium text-slate-300 transition-colors hover:bg-white/[0.05] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
