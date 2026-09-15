"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type GroupTaskItem = {
  id: string;
  status: string;
  executedDate: string | null;
  description: string;
  template: { title: string; targetMonth: string | null; order: number };
};

export default function GroupAxis({
  institutionName,
  tasks,
  percentDone,
}: {
  institutionName: string;
  tasks: GroupTaskItem[];
  percentDone: number;
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [executedDate, setExecutedDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function markDone(id: string) {
    setLoading(true);
    await fetch(`/api/group-tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED", executedDate, description }),
    });
    setLoading(false);
    setOpenId(null);
    setExecutedDate("");
    setDescription("");
    router.refresh();
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800">{institutionName}</h3>
        <span className="text-xs font-semibold text-brand-700">{percentDone}% בוצע</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tasks.map((t) => (
          <div key={t.id} className="shrink-0 w-40">
            <button
              onClick={() => (t.status === "COMPLETED" ? null : setOpenId(openId === t.id ? null : t.id))}
              className={`w-full text-right rounded-lg border px-3 py-2 text-xs transition ${
                t.status === "COMPLETED"
                  ? "bg-[#21B524]/10 border-[#21B524]/40 text-[#178018]"
                  : "bg-white border-slate-200 text-slate-600 hover:border-brand-400"
              }`}
            >
              <div className="font-medium">{t.template.title}</div>
              {t.template.targetMonth && <div className="text-[10px] text-slate-400 mt-0.5">{t.template.targetMonth}</div>}
              <div className="text-[10px] mt-1 font-semibold">{t.status === "COMPLETED" ? "בוצע ✓" : "טרם בוצע"}</div>
            </button>

            {openId === t.id && (
              <div className="mt-2 p-2 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
                <input
                  type="date"
                  value={executedDate}
                  onChange={(e) => setExecutedDate(e.target.value)}
                  className="input !text-xs !py-1"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="תיאור"
                  rows={2}
                  className="input !text-xs !py-1"
                />
                <button
                  onClick={() => markDone(t.id)}
                  disabled={loading}
                  className="btn-primary w-full !text-xs !py-1"
                >
                  {loading ? "שומר..." : "אישור ביצוע"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
