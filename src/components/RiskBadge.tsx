import { RISK_BADGE_COLOR, RISK_DOT_COLOR, RISK_LABELS } from "@/lib/format";

export default function RiskBadge({ level }: { level: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${RISK_BADGE_COLOR[level] ?? ""}`}
    >
      <span className={`h-2 w-2 rounded-full ${RISK_DOT_COLOR[level] ?? "bg-slate-400"}`} />
      {RISK_LABELS[level] ?? level}
    </span>
  );
}
