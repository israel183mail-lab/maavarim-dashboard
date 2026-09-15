"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/format";

type Note = { id: string; note: string; authorName: string; createdAt: string };

export default function StudentNotesTimeline({ studentId, notes }: { studentId: string; notes: Note[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? notes : notes.slice(0, 4);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    await fetch(`/api/students/${studentId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: text }),
    });
    setLoading(false);
    setText("");
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-700 text-sm">יומן מעקב</h3>
        <div className="flex gap-3 text-xs">
          <button onClick={() => setShowAll((v) => !v)} className="text-brand-600 hover:underline">
            {showAll ? "הצג פחות" : "הצג כל ההערות"}
          </button>
          <a href={`/api/students/${studentId}/notes/export`} className="text-brand-600 hover:underline">
            ייצא לאקסל
          </a>
        </div>
      </div>

      <form onSubmit={submit} className="flex gap-2 mb-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="כתוב הערה..."
          className="input flex-1"
        />
        <button type="submit" disabled={loading} className="btn-primary !px-4">
          {loading ? "..." : "הוסף"}
        </button>
      </form>

      <ul className="space-y-2">
        {visible.map((n) => (
          <li key={n.id} className="border-r-2 border-brand-200 pr-3 text-sm">
            <div className="text-slate-700">{n.note}</div>
            <div className="text-xs text-slate-400 mt-0.5">
              {n.authorName} · {formatDate(n.createdAt)}
            </div>
          </li>
        ))}
        {notes.length === 0 && <li className="text-sm text-slate-400">אין עדיין הערות</li>}
      </ul>
    </div>
  );
}
