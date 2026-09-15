"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

type Row = { name: string; annual: number; lifetime: number };

// "מדד הוצאה מסיכון" — students each coordinator moved back to a normal
// risk level, this year vs. all-time.
export default function RescueBarChart({ data }: { data: Row[] }) {
  if (data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-sm text-slate-400">אין נתונים</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="lifetime" name="כללי" fill="#2c3768" radius={[4, 4, 0, 0]} />
        <Bar dataKey="annual" name={'תשפ"ו'} fill="#F7901E" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
