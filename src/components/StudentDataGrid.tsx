"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RiskBadge from "@/components/RiskBadge";
import ProgressBattery from "@/components/ProgressBattery";
import { taskProgressPercent } from "@/lib/progress";
import { CATEGORY_LABELS, CATEGORY_ORDER, RISK_ORDER } from "@/lib/format";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  category: string;
  riskLevel: string;
  coordinator: { id: string; name: string };
  currentInstitution: { id: string; name: string } | null;
  tasks: { status: string; template: { weight: number } }[];
  notes: { note: string; createdAt: string }[];
};

type SortKey = "name" | "category" | "institution" | "progress" | "risk";

export default function StudentDataGrid({
  coordinatorId,
  showCoordinatorColumn = false,
}: {
  coordinatorId?: string;
  showCoordinatorColumn?: boolean;
}) {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [risk, setRisk] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (risk) params.set("risk", risk);
    if (coordinatorId) params.set("coordinatorId", coordinatorId);
    fetch(`/api/students?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setStudents(d.students ?? []));
  }, [q, category, risk, coordinatorId]);

  const sorted = useMemo(() => {
    if (!students) return [];
    const arr = [...students];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName, "he");
      else if (sortKey === "category")
        cmp = (CATEGORY_ORDER as string[]).indexOf(a.category) - (CATEGORY_ORDER as string[]).indexOf(b.category);
      else if (sortKey === "institution")
        cmp = (a.currentInstitution?.name ?? "").localeCompare(b.currentInstitution?.name ?? "", "he");
      else if (sortKey === "progress") cmp = taskProgressPercent(a.tasks) - taskProgressPercent(b.tasks);
      else if (sortKey === "risk") cmp = (RISK_ORDER as string[]).indexOf(a.riskLevel) - (RISK_ORDER as string[]).indexOf(b.riskLevel);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [students, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="חפש שם..."
          className="input max-w-[200px]"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input max-w-[180px]">
          <option value="">כל הקטגוריות</option>
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <select value={risk} onChange={(e) => setRisk(e.target.value)} className="input max-w-[160px]">
          <option value="">כל רמות הסיכון</option>
          {RISK_ORDER.map((r) => (
            <option key={r} value={r}>
              {r === "NORMAL" ? "תקין" : r === "IN_REVIEW" ? "בבדיקה" : r === "ELEVATED" ? "מוגבר" : "קריטי"}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-brand-50 text-brand-800 text-xs">
            <tr>
              <th className="text-right p-2.5 font-semibold border border-slate-200">⚠</th>
              <th
                className="text-right p-2.5 font-semibold border border-slate-200 cursor-pointer select-none"
                onClick={() => toggleSort("name")}
              >
                שם משפחה / שם פרטי
              </th>
              {showCoordinatorColumn && <th className="text-right p-2.5 font-semibold border border-slate-200">רכז אחראי</th>}
              <th
                className="text-right p-2.5 font-semibold border border-slate-200 cursor-pointer select-none"
                onClick={() => toggleSort("institution")}
              >
                מוסד
              </th>
              <th
                className="text-right p-2.5 font-semibold border border-slate-200 cursor-pointer select-none"
                onClick={() => toggleSort("category")}
              >
                קטגוריה
              </th>
              <th className="text-right p-2.5 font-semibold border border-slate-200">אינטראקציה אחרונה</th>
              <th
                className="text-right p-2.5 font-semibold border border-slate-200 cursor-pointer select-none"
                onClick={() => toggleSort("progress")}
              >
                מצב התקדמות
              </th>
              <th
                className="text-right p-2.5 font-semibold border border-slate-200 cursor-pointer select-none"
                onClick={() => toggleSort("risk")}
              >
                רמת סיכון
              </th>
              <th className="text-right p-2.5 font-semibold border border-slate-200">הפניה</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/60">
                <td className="p-2.5 border border-slate-200 text-center">
                  {(s.riskLevel === "ELEVATED" || s.riskLevel === "CRITICAL") && <span title="בסיכון">⚠️</span>}
                </td>
                <td className="p-2.5 border border-slate-200 font-medium text-slate-700">
                  {s.lastName} {s.firstName}
                </td>
                {showCoordinatorColumn && <td className="p-2.5 border border-slate-200 text-slate-500">{s.coordinator.name}</td>}
                <td className="p-2.5 border border-slate-200 text-slate-500">{s.currentInstitution?.name ?? "—"}</td>
                <td className="p-2.5 border border-slate-200 text-slate-500">{CATEGORY_LABELS[s.category]}</td>
                <td className="p-2.5 border border-slate-200 text-slate-500">{s.notes[0]?.note?.slice(0, 30) || "—"}</td>
                <td className="p-2.5 border border-slate-200">
                  <ProgressBattery percent={taskProgressPercent(s.tasks)} compact />
                </td>
                <td className="p-2.5 border border-slate-200">
                  <RiskBadge level={s.riskLevel} />
                </td>
                <td className="p-2.5 border border-slate-200 text-center">
                  <Link href={`/students/${s.id}`} className="text-brand-600 hover:underline" title="כרטיס תלמיד">
                    🔗
                  </Link>
                </td>
              </tr>
            ))}
            {students !== null && sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-400 border border-slate-200">
                  לא נמצאו תלמידים
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
