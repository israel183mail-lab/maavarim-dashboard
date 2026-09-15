"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { RISK_LABELS } from "@/lib/format";

const COLORS: Record<string, string> = {
  NORMAL: "#21B524",
  IN_REVIEW: "#F5C518",
  ELEVATED: "#F7901E",
  CRITICAL: "#FF3131",
};

export default function RiskPieChart({ data }: { data: { risk: string; count: number }[] }) {
  const chartData = data.filter((d) => d.count > 0).map((d) => ({ name: RISK_LABELS[d.risk] ?? d.risk, value: d.count, risk: d.risk }));

  if (chartData.length === 0) {
    return <div className="h-56 flex items-center justify-center text-sm text-slate-400">אין נתונים</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {chartData.map((d) => (
            <Cell key={d.risk} fill={COLORS[d.risk]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
