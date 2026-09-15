export default function KpiCard({
  label,
  value,
  hint,
  accent = "brand",
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "brand" | "green" | "orange" | "red";
}) {
  const accentColor =
    accent === "green" ? "#21B524" : accent === "orange" ? "#F7901E" : accent === "red" ? "#FF3131" : "#1D2445";

  return (
    <div className="card p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 h-full w-1" style={{ backgroundColor: accentColor }} />
      <div className="text-sm text-slate-500 mb-1">{label}</div>
      <div className="text-3xl font-heebo font-extrabold text-slate-800">{value}</div>
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
    </div>
  );
}
