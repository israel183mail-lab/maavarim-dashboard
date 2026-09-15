"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RISK_DOT_COLOR, RISK_LABELS, RISK_ORDER } from "@/lib/format";

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
  const [open, setOpen] = useState(false);
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
  }

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-accent-500">
      <div className="bg-accent-500 flex items-center justify-between px-4 py-2.5 flex-wrap gap-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="bg-brand-700 text-white text-sm font-bold px-4 py-1.5 rounded-full"
        >
          פרטים אישיים {open ? "▲" : "▼"}
        </button>

        <div className="flex items-center gap-2 text-white text-sm font-bold">
          מצב סיכון
          <span className={`h-4 w-4 rounded-full ring-2 ring-white/50 ${RISK_DOT_COLOR[form.riskLevel] ?? "bg-slate-400"}`} />
        </div>

        <div className="flex rounded-full overflow-hidden border-2 border-white text-xs font-bold">
          <button
            onClick={() => {
              setForm((f) => ({ ...f, status: "ACTIVE" }));
              save({ status: "ACTIVE" });
            }}
            className={`px-3 py-1.5 transition ${form.status === "ACTIVE" ? "bg-brand-700 text-white" : "text-white/80"}`}
          >
            פעיל
          </button>
          <button
            onClick={() => {
              setForm((f) => ({ ...f, status: "INACTIVE" }));
              save({ status: "INACTIVE" });
            }}
            className={`px-3 py-1.5 transition ${form.status === "INACTIVE" ? "bg-white text-accent-600" : "text-white/80"}`}
          >
            לא פעיל
          </button>
        </div>
      </div>

      {open && (
        <form onSubmit={saveAll} className="p-4 bg-white space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">מצב סיכון</label>
            <div className="flex gap-1.5 flex-wrap">
              {RISK_ORDER.map((r) => (
                <button
                  key={r}
                  type="button"
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

          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="עיר מגורים" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input className="input" placeholder="רחוב" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <input className="input" dir="ltr" placeholder="טלפון" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input" dir="ltr" placeholder="טלפון הורים" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} />
            <select className="input col-span-2" value={form.currentInstitutionId} onChange={(e) => setForm({ ...form, currentInstitutionId: e.target.value })}>
              <option value="">ללא מוסד (ישיבה)</option>
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
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "שומר..." : "שמירת פרטים"}
          </button>
        </form>
      )}
    </div>
  );
}
