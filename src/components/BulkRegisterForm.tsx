"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/format";

type Institution = { id: string; name: string };

type Row = { firstName: string; lastName: string; category: string; currentInstitutionId: string };

function emptyRow(): Row {
  return { firstName: "", lastName: "", category: "GRADE_8", currentInstitutionId: "" };
}

export default function BulkRegisterForm({ institutions }: { institutions: Institution[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateRow(i: number, patch: Partial<Row>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    let count = 0;
    for (const row of rows) {
      if (!row.firstName.trim() || !row.lastName.trim()) continue;
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: row.firstName.trim(),
          lastName: row.lastName.trim(),
          category: row.category,
          currentInstitutionId: row.currentInstitutionId || undefined,
        }),
      });
      if (res.ok) count += 1;
    }
    setLoading(false);
    setDone(count);
    if (count > 0) {
      setRows([emptyRow(), emptyRow(), emptyRow()]);
      router.refresh();
    } else {
      setError("לא נוספו תלמידים — נא למלא שם פרטי ושם משפחה בשורה אחת לפחות.");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="text-right p-2 font-medium">שם פרטי</th>
              <th className="text-right p-2 font-medium">שם משפחה</th>
              <th className="text-right p-2 font-medium">קטגוריה</th>
              <th className="text-right p-2 font-medium">מוסד</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="p-2">
                  <input className="input" value={row.firstName} onChange={(e) => updateRow(i, { firstName: e.target.value })} />
                </td>
                <td className="p-2">
                  <input className="input" value={row.lastName} onChange={(e) => updateRow(i, { lastName: e.target.value })} />
                </td>
                <td className="p-2">
                  <select className="input" value={row.category} onChange={(e) => updateRow(i, { category: e.target.value })}>
                    {CATEGORY_ORDER.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <select className="input" value={row.currentInstitutionId} onChange={(e) => updateRow(i, { currentInstitutionId: e.target.value })}>
                    <option value="">ללא</option>
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setRows((r) => [...r, emptyRow()])} className="text-sm text-brand-600 hover:underline">
          + הוסף שורה
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "רושם..." : "רישום תלמידים"}
        </button>
        {done !== null && <span className="text-sm text-emerald-600">נוספו {done} תלמידים בהצלחה</span>}
        {error && <span className="text-sm text-rose-600">{error}</span>}
      </div>
    </form>
  );
}
