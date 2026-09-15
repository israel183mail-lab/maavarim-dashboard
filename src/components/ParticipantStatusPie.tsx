"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const RADIAN = Math.PI / 180;

// Simplified 3-way view of participant status — "תמונת מצב פעילים" in the
// design deck — grouping the 4 risk levels down to on-track / at-risk /
// dropping-out.
export default function ParticipantStatusPie({
  onTrack,
  atRisk,
  droppingOut,
}: {
  onTrack: number;
  atRisk: number;
  droppingOut: number;
}) {
  const total = onTrack + atRisk + droppingOut;
  const data = [
    { name: "הולכים בתלם", value: onTrack, color: "#21B524" },
    { name: "בסיכון", value: atRisk, color: "#F5C518" },
    { name: "בנשירה", value: droppingOut, color: "#FF3131" },
  ].filter((d) => d.value > 0);

  if (total === 0) {
    return <div className="h-56 flex items-center justify-center text-sm text-slate-400">אין נתונים</div>;
  }

  const renderLabel = (props: { cx: number; cy: number; midAngle: number; outerRadius: number; percent: number; name: string }) => {
    const { cx, cy, midAngle, outerRadius, percent, name } = props;
    const r = outerRadius + 26;
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
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={75} label={renderLabel} labelLine={{ stroke: "#cbd5e1" }}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
