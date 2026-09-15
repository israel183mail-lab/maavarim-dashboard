"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RISK_LABELS, RISK_ORDER } from "@/lib/format";

type Institution = { id: string; name: string };

export default function StudentEditPanel({
  studentId,
  initial,
  institutions,
}: {
  studentId: string;
  initial: {
    firstName: string;
    lastName: string;
    city: string;
    address: string;
    phone: string;
    parentPhone: string;
    familyStatusNotes: string;
    currentInstitutionId: string;
    status: string;
    riskLevel: string;
  };
  institutions: Institution[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function save(patch: Record<string, unknown>) {
    setLoading(true);
    await fetch(`/api/students/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setLoading(false);
    router.refresh();
  }

  async function saveAll(e: React.FormEvent) {
    e.preventDefault();
    await save(form);
    setEditing(false);
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-700 text-sm">פרטים אישיים</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => save({ status: form.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" })}
            disabled={loading}
            className={`text-xs px-3 py-1 rounded-full font-semibold ${
              form.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
            }`}
          >
            {form.status === "ACTIVE" ? "פעיל" : "לא פעיל"}
          </button>
          <button onClick={() => setEditing((v) => !v)} className="text-xs text-brand-600 hover:underline">
            {editing ? "ביטול" : "עריכה"}
          </button>
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-slate-500 mb-1">מצב סיכון</label>
        <div className="flex gap-1.5 flex-wrap">
          {RISK_ORDER.map((r) => (
            <button
              key={r}
              onClick={() => {
                setForm((f) => ({ ...f, riskLevel: r }));
                save({ riskLevel: r });
              }}
              className={`text-xs px-2.5 py-1 rounded-full border font-medium transition ${
                form.riskLevel === r ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 text-slate-500 hover:border-slate-400"
              }`}
            >
              {RISK_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {!editing ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="text-xs text-slate-400">עיר מגורים</dt>
            <dd className="text-slate-700">{form.city || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">רחוב</dt>
            <dd className="text-slate-700">{form.address || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">טלפון</dt>
            <dd className="text-slate-700" dir="ltr">{form.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">טלפון הורים</dt>
            <dd className="text-slate-700" dir="ltr">{form.parentPhone || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">ישיבה / מוסד</dt>
            <dd className="text-slate-700">{institutions.find((i) => i.id === form.currentInstitutionId)?.name || "—"}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-slate-400">מצב משפחתי</dt>
            <dd className="text-slate-700">{form.familyStatusNotes || "—"}</dd>
          </div>
        </dl>
      ) : (
        <form onSubmit={saveAll} className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="עיר מגורים" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className="input" placeholder="רחוב" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input className="input" dir="ltr" placeholder="טלפון" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input" dir="ltr" placeholder="טלפון הורים" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} />
          <select className="input col-span-2" value={form.currentInstitutionId} onChange={(e) => setForm({ ...form, currentInstitutionId: e.target.value })}>
            <option value="">ללא מוסד</option>
            {institutions.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          <textarea
            className="input col-span-2"
            placeholder="מצב משפחתי"
            value={form.familyStatusNotes}
            onChange={(e) => setForm({ ...form, familyStatusNotes: e.target.value })}
          />
          <button type="submit" disabled={loading} className="btn-primary col-span-2">
            {loading ? "שומר..." : "שמירה"}
          </button>
        </form>
      )}
    </div>
  );
}
