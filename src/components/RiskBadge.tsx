import { RISK_DOT_COLOR, RISK_LABELS } from "@/lib/format";

// A dark toggle/traffic-light pill — matches the risk-level switch shown
// on ציר הפרט in the design deck, rather than a plain colored badge.
export default function RiskBadge({ level }: { level: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-brand-800 pl-2.5 pr-1 py-1 text-xs font-semibold text-white">
      <span className={`h-3.5 w-3.5 rounded-full ring-2 ring-white/20 ${RISK_DOT_COLOR[level] ?? "bg-slate-400"}`} />
      {RISK_LABELS[level] ?? level}
    </span>
  );
}
