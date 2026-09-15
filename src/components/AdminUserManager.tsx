"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_LABELS } from "@/lib/format";

type UserRow = { id: string; name: string; email: string; role: string; isActive: boolean; _count: { students: number } };

export default function AdminUserManager({ initialUsers }: { initialUsers: UserRow[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [form, setForm] = useState({ name: "", email: "", role: "COORDINATOR" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "שגיאה");
      return;
    }
    setUsers((u) => [...u, { ...data.user, _count: { students: 0 } }]);
    setMessage(`המשתמש נוצר. סיסמה זמנית: ${data.tempPassword}`);
    setForm({ name: "", email: "", role: "COORDINATOR" });
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setUsers((u) => u.map((x) => (x.id === id ? { ...x, isActive: !isActive } : x)));
    router.refresh();
  }

  async function resetPassword(id: string) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resetPassword" }),
    });
    const data = await res.json();
    if (res.ok) setMessage(`סיסמה חדשה: ${data.tempPassword}`);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={createUser} className="card p-4 grid sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs text-slate-500 mb-1">שם מלא</label>
          <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">דוא&quot;ל</label>
          <input required type="email" dir="ltr" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">תפקיד</label>
          <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="COORDINATOR">רכז/ת</option>
            <option value="MANAGER">מנהל/ת תוכנית</option>
            <option value="SUPER_ADMIN">מנהל/ת כללי/ת</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "יוצר..." : "+ הוספת עובד"}
        </button>
      </form>

      {message && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700">{message}</div>}
      {error && <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-2 text-sm text-rose-700">{error}</div>}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="text-right p-3 font-medium">שם</th>
              <th className="text-right p-3 font-medium">דוא&quot;ל</th>
              <th className="text-right p-3 font-medium">תפקיד</th>
              <th className="text-right p-3 font-medium">תלמידים</th>
              <th className="text-right p-3 font-medium">סטטוס</th>
              <th className="text-right p-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="p-3 font-medium text-slate-700">{u.name}</td>
                <td className="p-3 text-slate-500" dir="ltr">{u.email}</td>
                <td className="p-3 text-slate-500">{ROLE_LABELS[u.role]}</td>
                <td className="p-3 text-slate-500">{u._count.students}</td>
                <td className="p-3">
                  <button
                    onClick={() => toggleActive(u.id, u.isActive)}
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {u.isActive ? "פעיל" : "מושבת"}
                  </button>
                </td>
                <td className="p-3">
                  <button onClick={() => resetPassword(u.id)} className="text-xs text-brand-600 hover:underline">
                    איפוס סיסמה
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
