"use client";

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

export interface ChartDataPoint {
  day: string;
  dau: number;
  mau: number;
}

interface EngagementChartProps {
  data: ChartDataPoint[];
}

export function EngagementChart({ data }: EngagementChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: -24 }}>
        <defs>
          <linearGradient id="gDau" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.03} />
          </linearGradient>
          <linearGradient id="gMau" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#06b6d4" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="day"
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
          type="monotone" dataKey="dau"
          stroke="#3b82f6" strokeWidth={2.5}
          fill="url(#gDau)" dot={false}
          activeDot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
        />
        <Area
          type="monotone" dataKey="mau"
          stroke="#06b6d4" strokeWidth={2}
          fill="url(#gMau)" dot={false}
          activeDot={{ r: 4, fill: "#06b6d4", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
