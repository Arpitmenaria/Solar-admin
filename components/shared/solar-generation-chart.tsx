"use client";

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import type { SolarChartDataPoint } from "@/types";

interface SolarChartProps {
  data: SolarChartDataPoint[];
}

export function SolarGenerationChart({ data }: SolarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="gSolarGen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gGridExport" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
          tickLine={false}
          tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
        />
        <Tooltip
          contentStyle={{
            background: "#0d1321",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            fontSize: 12,
            color: "#f0f4ff",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
          }}
          labelStyle={{ color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}
          formatter={(value: unknown, name: unknown) => {
            const formattedVal = typeof value === "number" ? `${value.toLocaleString()} kWh` : String(value ?? "");
            const formattedName =
              name === "generation"
                ? "Solar Generation"
                : name === "gridExport"
                ? "Grid Export"
                : "Consumption";
            return [formattedVal, formattedName];
          }}
          cursor={{ stroke: "rgba(255,255,255,0.12)", strokeDasharray: "3 3" }}
        />
        <Area
          type="monotone"
          dataKey="generation"
          stroke="#f59e0b"
          strokeWidth={2.5}
          fill="url(#gSolarGen)"
          dot={false}
          activeDot={{ r: 5, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="gridExport"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#gGridExport)"
          dot={false}
          activeDot={{ r: 4, fill: "#10b981", stroke: "#fff", strokeWidth: 1.5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

