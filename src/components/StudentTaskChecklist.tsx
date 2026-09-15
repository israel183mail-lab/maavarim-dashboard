"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TASK_STATUS_LABELS } from "@/lib/format";

type TaskItem = {
  id: string;
  status: string;
  notes: string;
  template: { id: string; title: string; weight: number; order: number };
};

export default function StudentTaskChecklist({
  studentId,
  tasks,
  title,
}: {
  studentId: string;
  tasks: TaskItem[];
  title: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  async function toggle(task: TaskItem) {
    setLoadingId(task.id);
    setError(null);
    const nextStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    const res = await fetch(`/api/students/${studentId}/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, notes: noteDrafts[task.id] ?? task.notes }),
    });
    setLoadingId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "שגיאה");
      return;
    }
    router.refresh();
  }

  const sorted = [...tasks].sort((a, b) => a.template.order - b.template.order);

  return (
    <div>
      <h3 className="font-semibold text-slate-700 mb-2 text-sm">{title}</h3>
      {error && <div className="text-xs text-rose-600 mb-2">{error}</div>}
      <ul className="space-y-1.5">
        {sorted.map((t) => (
          <li key={t.id} className="flex items-start gap-2 group">
            <input
              type="checkbox"
              checked={t.status === "COMPLETED"}
              disabled={loadingId === t.id}
              onChange={() => toggle(t)}
              className="mt-1 h-4 w-4 accent-brand-600 shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className={t.status === "COMPLETED" ? "text-slate-400 line-through" : "text-slate-700"}>
                  {t.template.title}
                </span>
                {t.template.weight > 0 && <span className="text-[10px] text-slate-400">{t.template.weight}%</span>}
                <span className="text-[10px] text-slate-400">{TASK_STATUS_LABELS[t.status]}</span>
              </div>
              <input
                type="text"
                defaultValue={t.notes}
                onChange={(e) => setNoteDrafts((d) => ({ ...d, [t.id]: e.target.value }))}
                onBlur={() => {
                  if (noteDrafts[t.id] !== undefined && noteDrafts[t.id] !== t.notes) {
                    fetch(`/api/students/${studentId}/tasks/${t.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: t.status, notes: noteDrafts[t.id] }),
                    }).then(() => router.refresh());
                  }
                }}
                placeholder="הערה למשימה..."
                className="mt-0.5 w-full text-xs border-0 border-b border-transparent group-hover:border-slate-200 focus:border-brand-400 focus:outline-none bg-transparent py-0.5"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
