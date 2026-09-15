"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { RISK_LABELS } from "@/lib/format";

const COLORS: Record<string, string> = {
  NORMAL: "#21B524",
  IN_REVIEW: "#F5C518",
  ELEVATED: "#F7901E",
  CRITICAL: "#FF3131",
};

const RADIAN = Math.PI / 180;

export default function RiskPieChart({ data }: { data: { risk: string; count: number }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const chartData = data
    .filter((d) => d.count > 0)
    .map((d) => ({ name: RISK_LABELS[d.risk] ?? d.risk, value: d.count, risk: d.risk }));

  if (total === 0) {
    return <div className="h-56 flex items-center justify-center text-sm text-slate-400">אין נתונים</div>;
  }

  const renderLabel = (props: { cx: number; cy: number; midAngle: number; outerRadius: number; percent: number; name: string }) => {
    const { cx, cy, midAngle, outerRadius, percent, name } = props;
    const r = outerRadius + 22;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={11} fill="#334155">
        {name} {Math.round(percent * 100)}%
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          outerRadius={75}
          label={renderLabel}
          labelLine={{ stroke: "#cbd5e1" }}
        >
          {chartData.map((d) => (
            <Cell key={d.risk} fill={COLORS[d.risk]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
