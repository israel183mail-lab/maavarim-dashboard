"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "שגיאה בהתחברות");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-800 to-brand-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
            <span className="text-3xl font-heebo font-extrabold text-brand-700">מ</span>
          </div>
          <h1 className="text-2xl font-bold text-white">מעברים</h1>
          <p className="text-teal-100 mt-1 text-sm">מערכת ניהול תכנית מעברים</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              דואר אלקטרוני
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="name@maavarim.org.il"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">סיסמה</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full btn-primary">
            {loading ? "מתחבר..." : "התחברות"}
          </button>

          <p className="text-xs text-slate-500 text-center pt-2">
            גישה לצוות התכנית בלבד. לבעיות התחברות יש לפנות למנהל המערכת.
          </p>
        </form>
      </div>
    </div>
  );
}
