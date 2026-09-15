"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MOMENT_STATUS_LABELS } from "@/lib/format";

type Moment = {
  id: string;
  storyText: string;
  status: string;
  coordinatorName: string;
  createdAt: string;
};

const MAX_LENGTH = 200;

export default function MomentOfTransitionBoard({
  coordinators,
  currentUserId,
  initialMoments,
  canModerate = false,
}: {
  coordinators: { id: string; name: string }[];
  currentUserId: string;
  initialMoments: Moment[];
  canModerate?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [coordinatorId, setCoordinatorId] = useState(currentUserId);
  const [storyText, setStoryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moderatingId, setModeratingId] = useState<string | null>(null);

  async function moderate(id: string, status: "APPROVED" | "REJECTED") {
    setModeratingId(id);
    await fetch(`/api/moments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setModeratingId(null);
    router.refresh();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/moments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coordinatorId, storyText }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "שגיאה בשליחה");
      return;
    }
    setStoryText("");
    setOpen(false);
    router.refresh();
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg text-slate-800">רגע של מעבר</h2>
        <button onClick={() => setOpen((v) => !v)} className="btn-primary text-xs !py-1.5 !px-3">
          {open ? "ביטול" : "+ סיפור חדש"}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="card p-4 mb-3 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">שם הרכז</label>
            <select
              value={coordinatorId}
              onChange={(e) => setCoordinatorId(e.target.value)}
              className="input"
            >
              {coordinators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              סיפור של הצלחה קטנה (עד {MAX_LENGTH} תווים)
            </label>
            <textarea
              value={storyText}
              onChange={(e) => setStoryText(e.target.value.slice(0, MAX_LENGTH))}
              rows={3}
              className="input"
              placeholder="ספר בקצרה על רגע של הצלחה..."
            />
            <div className="text-xs text-slate-400 text-left mt-1">
              {storyText.length}/{MAX_LENGTH}
            </div>
          </div>
          {error && <div className="text-sm text-rose-600">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "שולח..." : "שלח וזכה בקרדיט"}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {initialMoments.length === 0 && (
          <div className="card p-4 text-sm text-slate-400 text-center">עדיין אין סיפורים</div>
        )}
        {initialMoments.map((m) => (
          <div key={m.id} className="card p-3 flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-slate-700">{m.storyText}</div>
              <div className="text-xs text-slate-400 mt-1">{m.coordinatorName}</div>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1.5">
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  m.status === "APPROVED"
                    ? "bg-emerald-100 text-emerald-700"
                    : m.status === "REJECTED"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                {MOMENT_STATUS_LABELS[m.status]}
              </span>
              {canModerate && m.status === "PENDING" && (
                <div className="flex gap-1">
                  <button
                    onClick={() => moderate(m.id, "APPROVED")}
                    disabled={moderatingId === m.id}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    אשר
                  </button>
                  <button
                    onClick={() => moderate(m.id, "REJECTED")}
                    disabled={moderatingId === m.id}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200"
                  >
                    דחה
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
