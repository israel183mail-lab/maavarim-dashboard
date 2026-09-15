// "Battery" style progress meter — matches the ציר הפרט spec: a charge-level
// bar showing how far a student has progressed through their task checklist.
export default function ProgressBattery({ percent, compact = false }: { percent: number; compact?: boolean }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const color = clamped >= 70 ? "#21B524" : clamped >= 40 ? "#F7901E" : "#FF3131";

  return (
    <div className="flex items-center gap-2" title={`${clamped}%`}>
      <div
        className={`relative border-2 rounded-[4px] ${compact ? "w-14 h-5" : "w-20 h-7"}`}
        style={{ borderColor: "#94a3b8" }}
      >
        <div
          className="absolute inset-y-0 right-0 rounded-[2px] transition-all"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
        <div
          className="absolute -left-[3px] top-1/2 -translate-y-1/2 h-2.5 w-1 rounded-sm"
          style={{ backgroundColor: "#94a3b8" }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-600 tabular-nums">{clamped}%</span>
    </div>
  );
}
