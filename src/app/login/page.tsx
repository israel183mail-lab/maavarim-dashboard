"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MaavarimLogo from "@/components/MaavarimLogo";

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
    <div
      className="relative min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
      style={{ backgroundImage: "url(/login-bg.jpg)" }}
    >
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="text-4xl sm:text-5xl mb-10">
          <MaavarimLogo />
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full space-y-4 bg-white/85 backdrop-blur-sm rounded-3xl p-6 shadow-xl"
        >
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">דוא&quot;ל</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full bg-white px-4 py-3 text-sm text-slate-800 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-400"
              placeholder="name@maavarim.org.il"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">סיסמה</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-full bg-white px-4 py-3 text-sm text-slate-800 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-400"
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

          <p className="text-xs text-slate-500 text-center pt-1">
            גישה לצוות התכנית בלבד. לבעיות התחברות יש לפנות למנהל המערכת.
          </p>
        </form>
      </div>
    </div>
  );
}
