"use client";

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint } from "@/types";

interface EngagementChartProps {
  data: ChartDataPoint[];
}

export function EngagementChart({ data }: EngagementChartProps) {
  return (
    // A fixed pixel height, not "100%" — the parent's height comes from
    // flex-grow + min-height, not a definite size, so recharts (v3 measures
    // strictly) resolves height:100% to 0 and never renders anything.
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: -24 }}>
        <defs>
          <linearGradient id="gTotalUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.03} />
          </linearGradient>
          <linearGradient id="gPremiumUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f5b642" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#f5b642" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tick={{ fill: "#2e4066", fontSize: 11, fontFamily: "var(--font-sans)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#2e4066", fontSize: 11, fontFamily: "var(--font-sans)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#0d1321",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            fontSize: 12,
            fontFamily: "var(--font-sans)",
            color: "#f0f4ff",
          }}
          labelStyle={{ color: "#4a5a7a", marginBottom: 4 }}
          cursor={{ stroke: "rgba(255,255,255,0.06)" }}
        />
        <Area
          type="monotone" dataKey="totalUsers"
          stroke="#3b82f6" strokeWidth={2.5}
          fill="url(#gTotalUsers)" dot={false}
          activeDot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
        />
        <Area
          type="monotone" dataKey="premiumUsers"
          stroke="#f5b642" strokeWidth={2}
          fill="url(#gPremiumUsers)" dot={false}
          activeDot={{ r: 4, fill: "#f5b642", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
