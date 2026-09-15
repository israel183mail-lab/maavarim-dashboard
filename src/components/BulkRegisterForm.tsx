"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/format";

type Institution = { id: string; name: string };

type Row = {
  currentInstitutionId: string;
  lastName: string;
  firstName: string;
  city: string;
  address: string;
  phone: string;
  familyStatusNotes: string;
  category: string;
};

function emptyRow(): Row {
  return { currentInstitutionId: "", lastName: "", firstName: "", city: "", address: "", phone: "", familyStatusNotes: "", category: "GRADE_8" };
}

const COLUMNS: { key: keyof Row; label: string }[] = [
  { key: "currentInstitutionId", label: "שם המוסד" },
  { key: "lastName", label: "שם משפחה" },
  { key: "firstName", label: "שם פרטי" },
  { key: "city", label: "עיר" },
  { key: "address", label: "כתובת" },
  { key: "phone", label: "טלפון" },
  { key: "familyStatusNotes", label: "מצב משפחתי" },
  { key: "category", label: "קטגוריה" },
];

export default function BulkRegisterForm({ institutions }: { institutions: Institution[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(Array.from({ length: 8 }, emptyRow));
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
          city: row.city || undefined,
          address: row.address || undefined,
          phone: row.phone || undefined,
          familyStatusNotes: row.familyStatusNotes || undefined,
          currentInstitutionId: row.currentInstitutionId || undefined,
        }),
      });
      if (res.ok) count += 1;
    }
    setLoading(false);
    setDone(count);
    if (count > 0) {
      setRows(Array.from({ length: 8 }, emptyRow));
      router.refresh();
    } else {
      setError("לא נוספו תלמידים — נא למלא שם פרטי ושם משפחה בשורה אחת לפחות.");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="border-2 border-slate-300 overflow-x-auto bg-white">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.key} className="text-right p-2 font-bold text-accent-600 border border-slate-300 bg-slate-50 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="border border-slate-200 p-0">
                  <select
                    className="w-full h-full px-2 py-1.5 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-accent-400"
                    value={row.currentInstitutionId}
                    onChange={(e) => updateRow(i, { currentInstitutionId: e.target.value })}
                  >
                    <option value=""></option>
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border border-slate-200 p-0">
                  <input className="w-full h-full px-2 py-1.5 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-accent-400" value={row.lastName} onChange={(e) => updateRow(i, { lastName: e.target.value })} />
                </td>
                <td className="border border-slate-200 p-0">
                  <input className="w-full h-full px-2 py-1.5 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-accent-400" value={row.firstName} onChange={(e) => updateRow(i, { firstName: e.target.value })} />
                </td>
                <td className="border border-slate-200 p-0">
                  <input className="w-full h-full px-2 py-1.5 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-accent-400" value={row.city} onChange={(e) => updateRow(i, { city: e.target.value })} />
                </td>
                <td className="border border-slate-200 p-0">
                  <input className="w-full h-full px-2 py-1.5 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-accent-400" value={row.address} onChange={(e) => updateRow(i, { address: e.target.value })} />
                </td>
                <td className="border border-slate-200 p-0">
                  <input dir="ltr" className="w-full h-full px-2 py-1.5 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-accent-400" value={row.phone} onChange={(e) => updateRow(i, { phone: e.target.value })} />
                </td>
                <td className="border border-slate-200 p-0">
                  <input className="w-full h-full px-2 py-1.5 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-accent-400" value={row.familyStatusNotes} onChange={(e) => updateRow(i, { familyStatusNotes: e.target.value })} />
                </td>
                <td className="border border-slate-200 p-0">
                  <select className="w-full h-full px-2 py-1.5 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-accent-400" value={row.category} onChange={(e) => updateRow(i, { category: e.target.value })}>
                    {CATEGORY_ORDER.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
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
