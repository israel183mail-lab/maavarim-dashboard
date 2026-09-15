"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

type TaskItem = {
  status: string;
  notes: string;
  completedAt: string | null;
  template: { title: string; weight: number; order: number };
};

export default function StudentSuccessChart({ tasks, riskMultiplier }: { tasks: TaskItem[]; riskMultiplier: number }) {
  const ordered = [...tasks].sort((a, b) => a.template.order - b.template.order);
  let cumulative = 0;
  const data = [
    { step: "התחלה", score: 0, note: "" },
    ...ordered.map((t) => {
      if (t.status === "COMPLETED") cumulative += t.template.weight;
      return {
        step: t.template.title,
        score: Math.round(cumulative * riskMultiplier * 10) / 10,
        note: t.notes || (t.status === "COMPLETED" ? "בוצע" : "טרם בוצע"),
      };
    }),
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="step" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} height={60} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
        <ReferenceLine y={100} stroke="#cbd5e1" strokeDasharray="4 4" />
        <Tooltip
          formatter={(value: number) => [`${value}%`, "ציון הצלחה"]}
          labelFormatter={(label, payload) => (payload?.[0]?.payload?.note ? `${label} — ${payload[0].payload.note}` : label)}
        />
        <Line type="monotone" dataKey="score" stroke="#1D2445" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
