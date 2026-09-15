"use client";

import { useState, type ReactNode } from "react";

type Section = { key: string; label: string; hint: string; content: ReactNode };

export default function InfoCenterMenu({ sections }: { sections: Section[] }) {
  const [openKey, setOpenKey] = useState<string | null>(sections[0]?.key ?? null);

  return (
    <div className="grid md:grid-cols-[260px_1fr] gap-6">
      <div className="space-y-3 relative">
        {sections.map((s, i) => (
          <div key={s.key} className="relative">
            <button
              onClick={() => setOpenKey(s.key)}
              className="relative w-full text-right"
              style={{ filter: openKey === s.key ? "none" : undefined }}
            >
              {/* sketchy double-outline effect */}
              <span
                className="absolute inset-0 rounded-full border-2"
                style={{
                  borderColor: openKey === s.key ? "#e07800" : "#8695c5",
                  transform: "rotate(-1deg) translate(2px, 2px)",
                }}
              />
              <span
                className={`relative block rounded-full border-2 px-5 py-2.5 text-sm font-bold text-white transition ${
                  openKey === s.key ? "bg-accent-500 border-accent-600" : "bg-brand-500 border-brand-600 hover:bg-brand-400"
                }`}
              >
                {s.label}
              </span>
            </button>
            {i === 0 && openKey === s.key && (
              <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-full mr-3 w-64 rounded-2xl border-2 border-slate-800 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm">
                {s.hint}
                <span className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-4 bg-white border-t-2 border-r-2 border-slate-800 rotate-45" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div>{sections.find((s) => s.key === openKey)?.content}</div>
    </div>
  );
}
