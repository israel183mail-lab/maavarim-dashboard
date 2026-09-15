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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-500 via-brand-700 to-brand-900 flex flex-col">
      {/* decorative orange tabs, echoing the deck's login screens */}
      <div className="absolute -bottom-6 right-10 h-16 w-10 rounded-t-full bg-accent-500/90" />
      <div className="absolute -bottom-6 right-24 h-20 w-10 rounded-t-full bg-accent-500/70" />

      <div className="flex items-center justify-between px-6 sm:px-10 pt-8">
        <h1 className="text-xl sm:text-2xl font-heebo font-extrabold text-white">כניסה למערכת</h1>
        <div className="text-2xl">
          <MaavarimLogo light />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-white/80 text-sm w-24 shrink-0 text-left">דוא&quot;ל</span>
            <div className="relative flex-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full bg-white/95 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-400"
                placeholder="name@maavarim.org.il"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-white/80 text-sm w-24 shrink-0 text-left">סיסמה</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 rounded-full bg-white/95 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-400"
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

          <p className="text-xs text-white/60 text-center pt-2">
            גישה לצוות התכנית בלבד. לבעיות התחברות יש לפנות למנהל המערכת.
          </p>
        </form>
      </div>
      <div className="h-16" />
    </div>
  );
}
